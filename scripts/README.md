# Scripts

## fetch-organizations.js

Fetches all districts and clubs from the Swedish Chess Federation API and saves them to static JSON files.

### Usage

```bash
node scripts/fetch-organizations.js
```

### What it does

1. Fetches all 30 districts from the API
2. Fetches all clubs for each district in parallel
3. Saves three files to `public/data/`:
   - `districts.json` - All districts (~12 KB)
   - `clubs-by-district.json` - Clubs organized by district
   - `organizations-all.json` - Complete dataset used by the app (~19 MB pretty, ~1 MB gzipped)

### When to run

Run this script when you need to update the organization data. Since districts and clubs change very rarely (maybe a few times per year), you typically only need to run this:

- After setting up the project for the first time
- When you know organizations have been added/removed
- Periodically (e.g., once per month) to stay up to date

### Performance

- **Fetch time**: ~1.5 seconds (30 districts in parallel)
- **Total clubs**: ~14,000
- **Data size**: 19 MB (pretty JSON), 10.2 MB (minified), ~1 MB (gzipped)

### After running

1. **Commit the updated file** to git:
   ```bash
   git add public/data/organizations-all.json
   git commit -m "chore: update organization data"
   git push
   ```

2. **Deploy** as normal - the file is in `public/` so it gets deployed automatically with your code

3. The app will automatically use the updated data on next load (no rebuild needed)

### Future enhancements

The data loader (`src/lib/organizations/organizationDataLoader.ts`) is abstracted to make it easy to switch from static files to other sources:

- **Option A**: Load from Next.js API route (for dynamic updates)
- **Option B**: Current - Static files bundled with app (fastest, simplest)
- **Option C**: Load with localStorage caching (best of both)

See comments in `organizationDataLoader.ts` for implementation details.
