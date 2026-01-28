# Release Command

Create a new release with version: $ARGUMENTS

## Steps

1. **Validate version argument**
   - If no version provided, show current [Unreleased] section and ask for version number
   - Version should follow semver format (e.g., 0.5.1, 1.0.0)

2. **Generate changelog from commits**
   - Find the last release tag: `git describe --tags --abbrev=0`
   - Get all commits since that tag: `git log <last-tag>..HEAD --oneline`
   - Analyze commits and generate meaningful user-facing changelog entries
   - Group by category:
     - **Added** - New features
     - **Changed** - Changes to existing functionality
     - **Fixed** - Bug fixes
     - **Removed** - Removed features
   - Filter out noise (internal refactors, typo fixes, version bumps, etc.)
   - Summarize related commits into single entries (e.g., 5 pagination commits → one entry)
   - Add entries to the [Unreleased] section in CHANGELOG.md

3. **Update CHANGELOG.md version header**
   - Change `## [Unreleased]` to `## [VERSION] - YYYY-MM-DD` (today's date)
   - Add new empty `## [Unreleased]` section above it with a `---` separator

4. **Validate**
   - Run `yarn tsc --noEmit`
   - Run `yarn test`
   - If either fails: Stop and report errors

5. **Build**
   - Run `yarn build` (includes `yarn generate:changelog` via prebuild hook)
   - If fails: Stop and report errors

6. **Commit and tag**
   - Stage: `git add CHANGELOG.md src/data/changelog.ts`
   - Commit: `git commit -m "release: vVERSION"`
   - Tag: `git tag vVERSION`
   - **NO Claude attribution**

7. **Push**
   - Push commit: `git push`
   - Push tag: `git push --tags`

8. **Report success**
   - Show the commit hash
   - Show the tag name
   - Show changelog entries that were added
   - Provide link to GitHub releases page

## Changelog Guidelines

When generating changelog entries:
- Focus on **user-facing changes** only
- Use clear, non-technical language where possible
- One line per feature/fix (can have sub-bullets if complex)
- Skip:
  - Internal refactoring
  - Code style changes
  - Dependency updates (unless user-facing)
  - Typo fixes in code
  - Build/config changes (unless user-facing)

## Example usage

```
/release 0.5.1
/release 1.0.0
```