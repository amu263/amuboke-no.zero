# Unit 8: Deployment & Publishing Flow

## Overview

`git push` to `main` branch → Auto deploy to Cloudflare Pages ≤ 2 minutes

## Branch Model

| Branch | Purpose | Auto-deploy |
|--------|---------|-------------|
| `main` | Production-ready code | ✅ Yes |
| `edit` | Content writing (posts, gallery) | ❌ No |
| Short branches | Feature development | ❌ No |

## Prerequisites

### 1. Cloudflare Setup

1. Create a Cloudflare account at https://dash.cloudflare.com
2. Create a new Pages project:
   - Go to **Workers & Pages** → **Create application** → **Pages** → **Upload assets**
   - Or connect directly via GitHub integration
3. Get your **Account ID**:
   - Go to **Workers & Pages** → Overview → Account ID
4. Create an **API Token**:
   - Go to **My Profile** → **API Tokens** → **Create Token**
   - Use **"Edit Cloudflare Workers"** template or create custom token with:
     - `Zone. Workers AI: Edit`
     - `Account. Cloudflare Pages: Edit`

### 2. GitHub Secrets

Add these secrets to your GitHub repository:

| Secret Name | Value |
|-------------|-------|
| `CLOUDFLARE_API_TOKEN` | Your Cloudflare API token |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare Account ID |

**To add secrets:**
1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add each secret

## Local Development

```bash
# Install dependencies
cd apps/web
pnpm install

# Run dev server
pnpm dev

# Type check
pnpm typecheck

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Deployment Flow

```
┌─────────────┐     push      ┌─────────────────┐
│  Developer  │ ────────────► │  GitHub Actions │
└─────────────┘              └────────┬────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │         CI Pipeline             │
                    │  1. Checkout code               │
                    │  2. Setup pnpm + Node 20        │
                    │  3. pnpm install --frozen-lockfile │
                    │  4. pnpm typecheck              │
                    │  5. pnpm build (vite-ssg)      │
                    │  6. Deploy to Cloudflare Pages  │
                    └────────────────┬────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │    Cloudflare Pages             │
                    │  - Built in ~1-2 minutes       │
                    │  - Available at                │
                    │    https://amuboke-no-zero.pages.dev │
                    └─────────────────────────────────┘
```

## Workflow File

The deployment is configured in `.github/workflows/deploy.yml`:

- **Triggers:** Push to `main` branch
- **Concurrency:** Cancels older runs if new push occurs
- **Build:** `pnpm build` in `apps/web` directory
- **Deploy:** Uses `cloudflare/pages-action@v1`

## Build Output

The build output (`apps/web/dist/`) is fully static:

- `index.html` - Homepage
- `posts/` - Blog posts (SSG rendered)
- `gallery/` - Photo galleries
- `projects/` - Project showcase
- `listen/` - Music archive
- `friends/` - Friend links
- `demo/` - UI component lab
- `assets/` - JS/CSS bundles

## Rollback

If a deployment fails or needs rollback:

1. **Via Cloudflare Dashboard:**
   - Go to **Workers & Pages** → Your project → **Deployments**
   - Click on a previous deployment to restore

2. **Via GitHub:**
   - Go to repository **Actions** tab
   - Find the working commit
   - Click **Re-run jobs**

## Troubleshooting

### Build fails with "CLOUDFLARE_API_TOKEN" not found
- Ensure secrets are added to GitHub repository settings
- Check secret names match exactly (case-sensitive)

### Deployment stuck or times out
- Check GitHub Actions logs for errors
- Verify Cloudflare quota hasn't been exceeded

### TypeScript errors in CI but not locally
- Ensure `pnpm typecheck` passes locally before pushing
- Check Node.js version matches (20.x)

## Security Notes

Per AGENTS.md §7:
- ✅ No third-party analytics/sharing/ad scripts
- ✅ Rate limit thresholds not hardcoded in client
- ✅ Build output is deterministic (same source → same hash)
- ✅ Media tokens from `POST /api/media-token` (future backend)


---
Last trigger: 2026-08-22T20:23:36.222Z

---
Last trigger: 2026-08-22T20:23:40.852Z