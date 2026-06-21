# Deploy & Seed D1 Database

## 1. Create D1 database

```bash
npx wrangler d1 create opentuwa-prod
```

Copy the returned `database_id` into `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "opentuwa-prod"
database_id = "PASTE_ID_HERE"
```

## 2. Apply schema

```bash
npx wrangler d1 execute opentuwa-prod --file=schema.sql
```

## 3. Seed data (optional via CLI)

```bash
node scripts/generate-seed.js > seed-alafasy.sql
npx wrangler d1 execute opentuwa-prod --file=seed-alafasy.sql
```

## 4. Set CMS_API_TOKEN secret

```bash
npx wrangler pages secret put CMS_API_TOKEN
```

Enter a strong token value. Default fallback (if not set) is `opentuwa-cms-token`.

## 5. Deploy

```bash
npm run build
npx wrangler pages deploy .vercel/output/static --project-name opentuwa
```

## 6. Use CMS

1. Visit `https://<your-pages-domain>/cms.html`
2. Enter your `CMS_API_TOKEN` in the field at top
3. Click **Seed Alafasy** to insert all 114 surahs + verses as artists/albums/tracks
4. Use Artists / Albums / Tracks tabs to browse, edit, add, or delete

## 7. Verify

- Homepage shows D1-powered artist & album lists
- `/alafasy/album/00100000000` loads album page from D1
- `/alafasy/song/00100100000` loads track page from D1
- Static data (`src/lib/surah-metadata.ts`, `src/lib/configs.ts`) is fallback only
