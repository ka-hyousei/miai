# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ミアイ (Miai) - 在日華人向けマッチングアプリ。日本で暮らす中国人のための真剣な出会いを応援するサービス。

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + React + TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Neon recommended for production)
- **ORM**: Prisma
- **Authentication**: NextAuth.js (credentials provider)
- **Storage**: Cloudflare R2 (for photos)
- **Deployment**: Vercel

## Common Commands

```bash
# Development
npm run dev          # Start dev server on localhost:3000

# Database
npx prisma generate  # Generate Prisma client after schema changes
npx prisma migrate dev --name <name>  # Create and apply migration
npx prisma db push   # Push schema to database without migration
npx prisma studio    # Open database GUI

# Build
npm run build        # Production build
npm run lint         # Run ESLint
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Auth pages (login, register) - no main layout
│   ├── (main)/          # Protected pages with nav layout
│   │   ├── discover/    # User discovery/search
│   │   ├── likes/       # Likes management
│   │   ├── messages/    # Chat functionality
│   │   └── mypage/      # User settings
│   ├── api/             # API routes
│   │   ├── auth/        # NextAuth endpoints
│   │   ├── discover/    # User search API
│   │   ├── likes/       # Like/match API
│   │   └── profile/     # Profile CRUD
│   └── profile/
│       └── setup/       # Profile creation wizard
├── components/
│   ├── providers/       # Context providers (SessionProvider)
│   └── ui/              # Reusable UI components
├── lib/
│   ├── auth.ts          # NextAuth configuration
│   ├── constants.ts     # Enums and static data (prefectures, visa types)
│   └── prisma.ts        # Prisma client singleton
├── types/
│   └── next-auth.d.ts   # NextAuth type extensions
└── generated/
    └── prisma/          # Generated Prisma client
```

## Database Schema

Core models:
- **User**: Account with email/password auth
- **Profile**: User profile with personal info, visa status, Japanese level
- **Photo**: User photos with ordering
- **Like**: Directional likes (mutual = match)
- **Message**: Chat messages between matched users
- **Block/Report**: Safety features

Key enums: `Gender`, `VisaType`, `JapaneseLevel`, `FuturePlan`

## Architecture Notes

- Route groups `(auth)` and `(main)` separate public/protected layouts
- Prisma client is singleton (`src/lib/prisma.ts`) to prevent connection exhaustion
- User session includes `hasProfile` flag for redirect logic
- Blocking works bidirectionally - blocked users can't see each other
- Visa information display is privacy-controlled per user (`showVisaType`, `showYearsInJapan`)

## Environment Variables

Required in `.env`:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random string for JWT signing
- `NEXTAUTH_URL` - Base URL (http://localhost:3000 for dev)

Optional for photo upload:
- `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`

## Language

- UI is in Japanese (日本語)
- Code comments may be in Japanese
- Variable/function names are in English
