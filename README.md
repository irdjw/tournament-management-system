# Tournament Management System

A multi-sport tournament management system built with SvelteKit and Supabase.

## Features

- **Tournament Organisation** - Create and manage knockout, league, and round robin tournaments
- **Live Scoring** - Mobile-first scorer interface for real-time dart-by-dart scoring
- **Multi-Sport Support** - Darts, pool, snooker, and more
- **Role-Based Access** - System admin, venue admin, tournament admin, scorer, and player roles
- **PWA Ready** - Install as a mobile app with offline UI support

## Technology Stack

- **Frontend**: SvelteKit (JavaScript)
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Netlify
- **PWA**: @vite-pwa/sveltekit

## Getting Started

### Prerequisites

- Node.js v18 or higher
- A Supabase project

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Environment Variables

- `PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (keep secret!)

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── admin/       # Admin panel components
│   │   ├── scorer/      # Scorer interface components
│   │   └── shared/      # Shared UI components
│   ├── services/        # Business logic and API calls
│   ├── stores/          # Svelte stores for state management
│   └── utils/           # Pure utility functions
├── routes/
│   ├── (public)/        # Public routes (login)
│   ├── admin/           # Admin panel routes
│   └── scorer/          # Scorer interface routes
└── hooks.server.js      # Server-side auth handling
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Style Guide

- British English throughout (colour, organise, centre)
- Mobile-first design (375px minimum width)
- camelCase for variables, PascalCase for components
- 2-space indentation, no semicolons
- Service layer pattern (components never call Supabase directly)

## Licence

Private - All rights reserved
