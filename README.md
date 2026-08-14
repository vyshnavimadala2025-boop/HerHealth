# SIRILA

**Smart Intelligent Responsive Insights Life Assistant**

Understand yourself. Live better.

Frontend foundation for the SIRILA platform.

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- shadcn/ui (Radix-based)
- React Router
- Lucide React (icons)
- Sonner (notifications)
- Supabase (backend / database, client only — auth not yet implemented)

## Getting started

```bash
npm install
cp .env.example .env.local  # then fill in your Supabase project values
npm run dev
```

## Environment variables

Create `.env.local` (ignored by Git) from `.env.example` and set:

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production
- `npm run preview` — preview the production build
- `npm run lint` — lint the codebase
