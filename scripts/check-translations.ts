#!/usr/bin/env npx tsx
/**
 * Translation Key Checker
 *
 * Scans all .tsx files for translation key usage patterns and compares
 * against keys defined in translations.ts.
 *
 * Reports:
 * - Unused translations (defined but never referenced)
 * - Missing translations (referenced but not defined)
 * - Duplicate string values (informational)
 */

import * as fs from 'fs';
import * as path from 'path';

const SRC_DIR = path.join(__dirname, '..', 'src');
const TRANSLATIONS_FILE = path.join(SRC_DIR, 'lib', 'translations.ts');

interface TranslationStats {
  definedKeys: Set<string>;
  usedKeys: Set<string>;
  duplicateValues: Map<string, string[]>; // value -> keys[]
}

/**
 * Extract all translation keys from the translations.ts file
 */
function extractDefinedKeys(): { keys: Set<string>; valueMap: Map<string, string> } {
  const content = fs.readFileSync(TRANSLATIONS_FILE, 'utf-8');
  const keys = new Set<string>();
  const valueMap = new Map<string, string>(); // key -> value

  // Match the 'en' translations object structure
  // We look for string values in the English translations
  const enMatch = content.match(/en:\s*\{([\s\S]*?)\n\s*\},\n\s*sv:/);
  if (!enMatch) {
    console.error('Could not find English translations');
    return { keys, valueMap };
  }

  const enContent = enMatch[1];

  // Parse the nested structure to extract keys
  function parseObject(content: string, prefix: string = ''): void {
    // Match key-value pairs where value is a string
    const stringPattern = /(\w+):\s*['"]([^'"]+)['"]/g;
    let match;

    while ((match = stringPattern.exec(content)) !== null) {
      const key = prefix ? `${prefix}.${match[1]}` : match[1];
      const value = match[2];
      keys.add(key);
      valueMap.set(key, value);
    }

    // Match nested objects
    const objectPattern = /(\w+):\s*\{/g;
    let objMatch;
    const positions: { key: string; start: number }[] = [];

    while ((objMatch = objectPattern.exec(content)) !== null) {
      positions.push({ key: objMatch[1], start: objMatch.index + objMatch[0].length });
    }

    for (const pos of positions) {
      // Find the matching closing brace
      let depth = 1;
      let i = pos.start;
      while (i < content.length && depth > 0) {
        if (content[i] === '{') depth++;
        if (content[i] === '}') depth--;
        i++;
      }

      const nestedContent = content.slice(pos.start, i - 1);
      const newPrefix = prefix ? `${prefix}.${pos.key}` : pos.key;
      parseObject(nestedContent, newPrefix);
    }
  }

  parseObject(enContent);

  return { keys, valueMap };
}

/**
 * Find all .tsx files in the src directory
 */
function findTsxFiles(dir: string): string[] {
  const files: string[] = [];

  function walk(currentDir: string): void {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and .next
        if (entry.name !== 'node_modules' && entry.name !== '.next') {
          walk(fullPath);
        }
      } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
        // Skip the translations file itself
        if (!fullPath.endsWith('translations.ts')) {
          files.push(fullPath);
        }
      }
    }
  }

  walk(dir);
  return files;
}

// Known top-level translation keys to validate against
const TOP_LEVEL_KEYS = ['navbar', 'footer', 'home', 'common', 'components', 'pages'];

/**
 * Extract translation key usage from a file
 */
function extractUsedKeys(filePath: string): Set<string> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const usedKeys = new Set<string>();

  // Pattern: t.something.something... or translations.something.something...
  // This matches patterns like t.pages.results.title, t.common.filters.all, etc.
  // Only match if the first part is a known top-level translation key
  const pattern = /\bt\.(\w+(?:\.\w+)*)/g;

  let match;
  while ((match = pattern.exec(content)) !== null) {
    const key = match[1];
    const topLevel = key.split('.')[0];

    // Only include if it starts with a known translation key prefix
    if (TOP_LEVEL_KEYS.includes(topLevel)) {
      usedKeys.add(key);
    }
  }

  return usedKeys;
}

/**
 * Find duplicate string values in translations
 */
function findDuplicateValues(valueMap: Map<string, string>): Map<string, string[]> {
  const reverseMap = new Map<string, string[]>();

  for (const [key, value] of valueMap.entries()) {
    // Skip very short or common values
    if (value.length < 3) continue;

    const existing = reverseMap.get(value) || [];
    existing.push(key);
    reverseMap.set(value, existing);
  }

  // Filter to only duplicates
  const duplicates = new Map<string, string[]>();
  for (const [value, keys] of reverseMap.entries()) {
    if (keys.length > 1) {
      duplicates.set(value, keys);
    }
  }

  return duplicates;
}

/**
 * Check if a used key matches a defined key (allowing partial matches for parent keys)
 */
function isKeyDefined(usedKey: string, definedKeys: Set<string>): boolean {
  // Direct match
  if (definedKeys.has(usedKey)) return true;

  // Check if this is a parent key to any defined key
  for (const definedKey of definedKeys) {
    if (definedKey.startsWith(usedKey + '.')) return true;
  }

  return false;
}

/**
 * Check if a defined key is used (allowing partial matches)
 */
function isKeyUsed(definedKey: string, usedKeys: Set<string>): boolean {
  // Direct match
  if (usedKeys.has(definedKey)) return true;

  // Check if any used key is a parent of this key
  for (const usedKey of usedKeys) {
    if (definedKey.startsWith(usedKey + '.')) return true;
  }

  return false;
}

function main(): void {
  console.log('Translation Key Checker\n');
  console.log('='.repeat(50));

  // Extract defined keys
  console.log('\nExtracting defined translation keys...');
  const { keys: definedKeys, valueMap } = extractDefinedKeys();
  console.log(`Found ${definedKeys.size} defined keys`);

  // Find all tsx files
  console.log('\nScanning source files...');
  const tsxFiles = findTsxFiles(SRC_DIR);
  console.log(`Found ${tsxFiles.length} source files`);

  // Extract used keys from all files
  const allUsedKeys = new Set<string>();
  for (const file of tsxFiles) {
    const usedKeys = extractUsedKeys(file);
    for (const key of usedKeys) {
      allUsedKeys.add(key);
    }
  }
  console.log(`Found ${allUsedKeys.size} unique key references`);

  // Find missing keys (used but not defined)
  console.log('\n' + '='.repeat(50));
  console.log('MISSING TRANSLATIONS (used but not defined):');
  console.log('='.repeat(50));
  const missingKeys: string[] = [];
  for (const usedKey of allUsedKeys) {
    if (!isKeyDefined(usedKey, definedKeys)) {
      missingKeys.push(usedKey);
    }
  }

  if (missingKeys.length === 0) {
    console.log('None found.');
  } else {
    for (const key of missingKeys.sort()) {
      console.log(`  - ${key}`);
    }
  }

  // Find unused keys (defined but not used)
  console.log('\n' + '='.repeat(50));
  console.log('UNUSED TRANSLATIONS (defined but not referenced):');
  console.log('='.repeat(50));
  const unusedKeys: string[] = [];
  for (const definedKey of definedKeys) {
    if (!isKeyUsed(definedKey, allUsedKeys)) {
      unusedKeys.push(definedKey);
    }
  }

  if (unusedKeys.length === 0) {
    console.log('None found.');
  } else {
    for (const key of unusedKeys.sort()) {
      console.log(`  - ${key}`);
    }
  }

  // Find duplicate values
  console.log('\n' + '='.repeat(50));
  console.log('DUPLICATE STRING VALUES (informational):');
  console.log('='.repeat(50));
  const duplicates = findDuplicateValues(valueMap);

  if (duplicates.size === 0) {
    console.log('None found.');
  } else {
    for (const [value, keys] of duplicates) {
      console.log(`\n  "${value}":`);
      for (const key of keys) {
        console.log(`    - ${key}`);
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY:');
  console.log('='.repeat(50));
  console.log(`  Defined keys: ${definedKeys.size}`);
  console.log(`  Used key patterns: ${allUsedKeys.size}`);
  console.log(`  Missing translations: ${missingKeys.length}`);
  console.log(`  Unused translations: ${unusedKeys.length}`);
  console.log(`  Duplicate values: ${duplicates.size}`);

  // Exit with error if there are missing translations
  if (missingKeys.length > 0) {
    console.log('\nError: Missing translations found!');
    process.exit(1);
  }

  console.log('\nAll translation checks passed.');
}

main();
