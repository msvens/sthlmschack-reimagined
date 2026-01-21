#!/usr/bin/env npx tsx
/**
 * Changelog Generator
 *
 * Reads CHANGELOG.md from the project root and generates a typed TypeScript
 * file with structured changelog data.
 *
 * Run manually: yarn generate:changelog
 * Runs automatically: as part of predev and prebuild
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = path.join(__dirname, '..');
const CHANGELOG_MD = path.join(ROOT_DIR, 'CHANGELOG.md');
const OUTPUT_FILE = path.join(ROOT_DIR, 'src', 'data', 'changelog.ts');

interface ChangelogSection {
  type: string;
  items: string[];
}

interface ChangelogEntry {
  version: string;
  date: string | null;
  sections: ChangelogSection[];
}

function parseChangelog(content: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];
  const lines = content.split('\n');

  let currentEntry: ChangelogEntry | null = null;
  let currentSection: ChangelogSection | null = null;

  for (const line of lines) {
    // Match version headers: ## [0.4.0] - 2025-01-20 or ## [Unreleased]
    const versionMatch = line.match(/^## \[([^\]]+)\](?:\s*-\s*(\d{4}-\d{2}-\d{2}))?/);
    if (versionMatch) {
      if (currentEntry) {
        if (currentSection && currentSection.items.length > 0) {
          currentEntry.sections.push(currentSection);
        }
        entries.push(currentEntry);
      }
      currentEntry = {
        version: versionMatch[1],
        date: versionMatch[2] || null,
        sections: [],
      };
      currentSection = null;
      continue;
    }

    // Match section headers: ### Added, ### Changed, etc.
    const sectionMatch = line.match(/^### (.+)/);
    if (sectionMatch && currentEntry) {
      if (currentSection && currentSection.items.length > 0) {
        currentEntry.sections.push(currentSection);
      }
      currentSection = {
        type: sectionMatch[1],
        items: [],
      };
      continue;
    }

    // Match list items: - Item text
    const itemMatch = line.match(/^- (.+)/);
    if (itemMatch && currentSection) {
      currentSection.items.push(itemMatch[1]);
      continue;
    }

    // Match indented list items (sub-items): "  - Sub item"
    const subItemMatch = line.match(/^\s{2,}- (.+)/);
    if (subItemMatch && currentSection && currentSection.items.length > 0) {
      // Append to last item
      const lastIdx = currentSection.items.length - 1;
      currentSection.items[lastIdx] += ` (${subItemMatch[1]})`;
    }
  }

  // Don't forget the last entry
  if (currentEntry) {
    if (currentSection && currentSection.items.length > 0) {
      currentEntry.sections.push(currentSection);
    }
    entries.push(currentEntry);
  }

  return entries;
}

function main(): void {
  console.log('Generating changelog...');

  // Check if CHANGELOG.md exists
  if (!fs.existsSync(CHANGELOG_MD)) {
    console.error('Error: CHANGELOG.md not found at project root');
    process.exit(1);
  }

  // Read the markdown content
  const content = fs.readFileSync(CHANGELOG_MD, 'utf-8');

  // Parse into structured data
  const entries = parseChangelog(content);

  // Ensure src/data directory exists
  const dataDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Generate the TypeScript file
  const tsContent = `// Auto-generated from CHANGELOG.md - DO NOT EDIT DIRECTLY
// Run 'yarn generate:changelog' to regenerate

export interface ChangelogSection {
  type: string;
  items: string[];
}

export interface ChangelogEntry {
  version: string;
  date: string | null;
  sections: ChangelogSection[];
}

export const changelog: ChangelogEntry[] = ${JSON.stringify(entries, null, 2)};
`;

  fs.writeFileSync(OUTPUT_FILE, tsContent);
  console.log(`Generated: ${OUTPUT_FILE}`);
  console.log(`  ${entries.length} changelog entries parsed`);
}

main();