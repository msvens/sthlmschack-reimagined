#!/usr/bin/env node

/**
 * Quick test runner for API endpoints
 * Run with: npx tsx src/lib/api/test-runner.ts
 */

import { PlayerService, ResultsService } from './index';

async function main() {
  console.log('🚀 Stockholm Chess API Test Runner\n');

  const playerService = new PlayerService();
  const resultsService = new ResultsService();
  
  // Test constants
  const PLAYER_ID = 642062; // Olle Svensson
  const TOURNAMENT_ID = 15816;
  
  try {
    console.log('1️⃣ Testing Player Info API...');
    console.log('─'.repeat(50));
    
    // Test current date
    const playerCurrent = await playerService.getPlayerInfo(PLAYER_ID);
    if (playerCurrent.data) {
      console.log(`✅ Player: ${playerCurrent.data.firstName} ${playerCurrent.data.lastName}`);
      console.log(`   Club: ${playerCurrent.data.club}`);
      console.log(`   Rating: ${playerCurrent.data.elo.rating}`);
      console.log(`   Country: ${playerCurrent.data.country}`);
    } else {
      console.log('❌ Failed to fetch player info');
      console.log('   Error:', playerCurrent.error);
    }

    // Test specific date
    const specificDate = new Date('2024-01-01');
    const playerSpecific = await playerService.getPlayerInfo(PLAYER_ID, specificDate);
    console.log(`\n📅 Historical data (${specificDate.toISOString().split('T')[0]}):`);
    if (playerSpecific.data && playerSpecific.data.elo) {
      console.log(`   Rating: ${playerSpecific.data.elo.rating || 'N/A'}`);
    } else {
      console.log('   No historical data available or API returned null');
    }
    
    console.log('\n2️⃣ Testing Tournament Results API...');
    console.log('─'.repeat(50));
    
    const tournamentResults = await resultsService.getTournamentResults(TOURNAMENT_ID);
    if (tournamentResults.data) {
      console.log(`✅ Tournament ${TOURNAMENT_ID} has ${tournamentResults.data.length} participants`);

      // Show top 3 players
      const top3 = tournamentResults.data
        .sort((a, b) => a.place - b.place)
        .slice(0, 3);

      console.log('\n🏆 Top 3 Players:');
      top3.forEach((result: { playerInfo: { firstName: string; lastName: string }; points: number }, index: number) => {
        console.log(`   ${index + 1}. ${result.playerInfo.firstName} ${result.playerInfo.lastName} - ${result.points} pts`);
      });
    } else {
      console.log('❌ Failed to fetch tournament results');
      console.log('   Error:', tournamentResults.error);
    }

    console.log('\n3️⃣ Testing Round Results API...');
    console.log('─'.repeat(50));

    const roundResults = await resultsService.getTournamentRoundResults(TOURNAMENT_ID);
    if (roundResults.data) {
      console.log(`✅ Tournament has ${roundResults.data.length} rounds`);
      
      const totalGames = roundResults.data.reduce((sum, round) => sum + round.games.length, 0);
      console.log(`   Total games played: ${totalGames}`);
      
      // Show round summary
      roundResults.data.slice(0, 3).forEach(round => {
        console.log(`   Round ${round.roundNr}: ${round.games.length} games, finalized: ${round.finalized}`);
      });
    } else {
      console.log('❌ Failed to fetch round results');
      console.log('   Error:', roundResults.error);
    }
    
    console.log('\n4️⃣ Testing Type Safety...');
    console.log('─'.repeat(50));
    
    // Test date formatting
    const testDate = new Date('2024-03-15T10:30:00Z');
    const formatted = playerService['formatDateToString'](testDate);
    console.log(`✅ Date formatting: ${testDate.toISOString()} → ${formatted}`);

    // Test current date
    const currentDate = playerService['getCurrentDate']();
    console.log(`✅ Current date: ${currentDate}`);

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n💡 Usage in your components:');
    console.log(`
import { PlayerService, ResultsService } from '@/lib/api';

const playerService = new PlayerService();
const resultsService = new ResultsService();

// Get player info
const player = await playerService.getPlayerInfo(${PLAYER_ID});

// Get tournament results  
const results = await resultsService.getTournamentResults(${TOURNAMENT_ID});

// Get round results
const rounds = await resultsService.getTournamentRoundResults(${TOURNAMENT_ID});
    `);
    
  } catch (error) {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main as runApiTests };
