# Release Command

Create a new release with version: $ARGUMENTS

## Steps

1. **Validate version argument**
   - If no version provided, show current [Unreleased] changes from CHANGELOG.md and ask for version number
   - Version should follow semver format (e.g., 0.5.1, 1.0.0)

2. **Update CHANGELOG.md**
   - Change `## [Unreleased]` to `## [VERSION] - YYYY-MM-DD` (today's date)
   - Add new empty `## [Unreleased]` section above it with a `---` separator

3. **Regenerate and build**
   - Run `yarn build` (this includes `yarn generate:changelog` via prebuild hook)
   - If build fails, stop and report the error

4. **Commit and tag**
   - Stage: `git add CHANGELOG.md src/data/changelog.ts`
   - Commit: `git commit -m "release: vVERSION"`
   - Tag: `git tag vVERSION`

5. **Push**
   - Push commit: `git push`
   - Push tag: `git push --tags`

6. **Report success**
   - Show the commit hash
   - Show the tag name
   - Provide link to GitHub releases page

## Example usage

```
/release 0.5.1
/release 1.0.0
```