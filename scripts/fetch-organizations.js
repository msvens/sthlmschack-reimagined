#!/usr/bin/env node

/**
 * Benchmark script to fetch all districts and clubs from the API
 * Measures: fetch time, data size, number of entities
 */

const fs = require('fs');
const path = require('path');

const API_BASE = 'https://member.schack.se/public/api/v1';

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${url}`);
  }
  return response.json();
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatTime(ms) {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

async function main() {
  console.log('🚀 Fetching organizations data from API...\n');

  const startTime = Date.now();

  // Step 1: Fetch all districts
  console.log('📍 Fetching districts...');
  const districtsStart = Date.now();
  const districts = await fetchJson(`${API_BASE}/organisation/districts`);
  const districtsTime = Date.now() - districtsStart;

  console.log(`✅ Fetched ${districts.length} districts in ${formatTime(districtsTime)}`);
  console.log(`   Size: ${formatBytes(JSON.stringify(districts).length)}\n`);

  // Step 2: Fetch clubs for each district (in parallel)
  console.log('🏛️  Fetching clubs for each district (parallel)...');
  const clubsStart = Date.now();

  const clubsByDistrict = await Promise.all(
    districts.map(async (district) => {
      const clubs = await fetchJson(`${API_BASE}/organisation/district/clubs/${district.id}`);
      return {
        districtId: district.id,
        districtName: district.name,
        clubs: clubs,
        count: clubs.length
      };
    })
  );

  const clubsTime = Date.now() - clubsStart;

  // Calculate totals
  const totalClubs = clubsByDistrict.reduce((sum, d) => sum + d.count, 0);

  console.log(`✅ Fetched clubs from ${districts.length} districts in ${formatTime(clubsTime)}`);
  console.log(`   Total clubs: ${totalClubs}`);

  // Step 3: Create combined data structure
  const allData = {
    fetchedAt: new Date().toISOString(),
    districts: districts,
    clubsByDistrict: clubsByDistrict,
    stats: {
      districtCount: districts.length,
      clubCount: totalClubs
    }
  };

  // Step 4: Calculate sizes
  const jsonString = JSON.stringify(allData);
  const prettyJsonString = JSON.stringify(allData, null, 2);
  const minifiedSize = jsonString.length;
  const prettySize = prettyJsonString.length;

  console.log(`   Minified size: ${formatBytes(minifiedSize)}`);
  console.log(`   Pretty size: ${formatBytes(prettySize)}\n`);

  // Step 5: Show breakdown by district
  console.log('📊 Clubs per district:');
  clubsByDistrict
    .sort((a, b) => b.count - a.count)
    .forEach(d => {
      console.log(`   ${d.districtName.padEnd(30)} ${String(d.count).padStart(3)} clubs`);
    });

  // Step 6: Save to files
  const outputDir = path.join(__dirname, '../public/data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const districtsFile = path.join(outputDir, 'districts.json');
  const clubsFile = path.join(outputDir, 'clubs-by-district.json');
  const allDataFile = path.join(outputDir, 'organizations-all.json');

  console.log('\n💾 Saving data to files...');
  fs.writeFileSync(districtsFile, JSON.stringify(districts, null, 2));
  console.log(`   ✅ ${districtsFile}`);

  fs.writeFileSync(clubsFile, JSON.stringify(clubsByDistrict, null, 2));
  console.log(`   ✅ ${clubsFile}`);

  fs.writeFileSync(allDataFile, JSON.stringify(allData, null, 2));
  console.log(`   ✅ ${allDataFile}`);

  // Final summary
  const totalTime = Date.now() - startTime;
  console.log('\n' + '='.repeat(60));
  console.log('📈 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Districts:     ${districts.length}`);
  console.log(`Clubs:         ${totalClubs}`);
  console.log(`Total time:    ${formatTime(totalTime)}`);
  console.log(`Data size:     ${formatBytes(minifiedSize)} (minified)`);
  console.log(`               ${formatBytes(prettySize)} (pretty)`);
  console.log(`Fetch speed:   ${Math.round(totalClubs / (totalTime / 1000))} clubs/sec`);
  console.log('='.repeat(60));

  console.log('\n✨ Done! Check the public/data/ directory for JSON files.\n');
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});