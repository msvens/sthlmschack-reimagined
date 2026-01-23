# Commit Command

Validate and commit changes: $ARGUMENTS

## Arguments

- `test` or `-t`: Also run `yarn test` after build
- No arguments: Just tsc, build, and commit

## Steps

1. **Check for changes**
   - Run `git status` to see what's changed
   - If no changes, inform user and stop

2. **Type check**
   - Run `yarn tsc --noEmit`
   - If fails: Stop and report errors

3. **Build**
   - Run `yarn build`
   - If fails: Stop and report errors

4. **Test (if requested)**
   - If `test` or `-t` argument provided, run `yarn test`
   - If fails: Stop and report errors

5. **Analyze changes for commit**
   - Run `git diff --staged` and `git diff` to understand changes
   - Run `git status` to see all modified and untracked files
   - Run `git log --oneline -5` to see recent commit style

6. **Stage changes**
   - **Default to ONE commit** with all changes (user often works on multiple things)
   - Only suggest splitting into multiple commits if changes are truly large AND distinct
   - **Ensure nothing is forgotten** - all modified files should be committed
   - For untracked files:
     - Include project-related files (new components, tests, configs)
     - **Ask about suspicious/unrelated files** (drafts, personal notes, random .txt files)
     - Never include sensitive files (.env, credentials, secrets)
   - Prefer staging specific files by name over `git add -A`

7. **Commit**
   - Generate clear, concise commit message
   - Use imperative mood ("Add feature" not "Added feature")
   - Focus on what and why, not how
   - **NO Claude attribution or co-authored-by lines**

8. **Report success**
   - Show commit hash
   - Show summary of what was committed

## Important

- **Abort immediately** if any validation step fails (tsc, build, test)
- **Never** add co-authored-by or Claude attribution to commits
- **Never** commit sensitive files (.env, credentials, etc.)
- **Never** push automatically - user will push when ready

## Example usage

```
/commit              # Validate and commit
/commit test         # Also run tests
/commit -t           # Also run tests (short form)
```