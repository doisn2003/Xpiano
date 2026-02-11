# Xpiano Frontend

Frontend for Xpiano - Piano rental and sales platform built with React + Vite + TypeScript

## Production Deployment

This frontend is deployed on Vercel

### Environment Variables Required:
- `VITE_API_URL` - Backend API endpoint
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon/public key

### Local Development

```bash
npm install
npm run dev
```

### Build for Production

```bash
npm run build
```

The build output will be in `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Deployment Platforms

- **Vercel** (Recommended) - Auto-deploy from GitHub
- **Netlify** - Alternative option
- **Cloudflare Pages** - Another alternative

See `DEPLOYMENT_GUIDE_FREE.md` for detailed deployment instructions.
