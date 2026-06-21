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

## 4. Deploy

```bash
npm run build
npx wrangler pages deploy .vercel/output/static --project-name opentuwa
```

## 5. Protect CMS with Cloudflare Access

1. Go to Cloudflare dashboard → Zero Trust → Access → Applications → **Add an application**
2. Choose **Self-hosted**
3. **Application name**: `opentuwa-cms`
4. **Domain**: select your Pages domain, set path to `/cms.html`
5. **Policy name**: `CMS Access`
6. **Action**: `Allow`
7. **Rules**: add a rule (e.g. `Everyone` with email or any identity provider you use)
8. Click **Next** and **Add application**
9. Then edit the application → **Additional routes** → add `/api/d1`
10. Save

Now `/cms.html` and `/api/d1` require Cloudflare Access login. No custom token needed.

## 6. Use CMS

1. Visit `https://<your-pages-domain>/cms.html` — Cloudflare Access will prompt login
2. Click **Seed Alafasy** to insert all 114 surahs + verses as artists/albums/tracks
3. Use Artists / Albums / Tracks tabs to browse, edit, add, or delete

## 7. Verify

- Homepage shows D1-powered artist & album lists
- `/alafasy/album/00100000000` loads album page from D1
- `/alafasy/song/00100100000` loads track page from D1
- Static data (`src/lib/surah-metadata.ts`, `src/lib/configs.ts`) is fallback only
