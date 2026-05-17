# UnitWatch 🔌

> Track your Nigerian prepaid electricity meter units remotely. Get alerts before your light goes out.

## Tech Stack
- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Auth + Database:** Supabase (Google OAuth + email/password)
- **Deployment:** Vercel

## Project Structure
```
unitwatch/
├── app/
│   ├── page.tsx                    ← Landing page
│   ├── auth/page.tsx               ← Sign in / Sign up (Google + email)
│   └── dashboard/
│       ├── page.tsx                ← Main dashboard (all meters)
│       ├── add-meter/page.tsx      ← Add new meter form
│       ├── meter/[id]/page.tsx     ← Individual meter detail + history
│       └── settings/page.tsx       ← Profile + notifications
├── lib/
│   ├── supabase.ts                 ← Supabase client
│   ├── calculations.ts             ← Unit estimation logic
│   └── supabase-schema.sql         ← Run this in Supabase SQL editor
└── types/index.ts                  ← TypeScript types + DisCo data
```

## Setup

### 1. Install
```bash
npm install
```

### 2. Set up Supabase
1. Create a project at supabase.com
2. Run `lib/supabase-schema.sql` in the SQL Editor
3. Enable Google Auth under Authentication → Providers
4. Copy your Project URL and anon key

### 3. Environment variables
```bash
cp .env.example .env.local
# Fill in your Supabase URL and anon key
```

### 4. Run
```bash
npm run dev
```

## Deploy to Vercel
```bash
vercel
```
Add env vars in Vercel dashboard. Update Supabase Google OAuth redirect URL to your Vercel domain.

## How unit estimation works
1. Daily consumption = Total units ÷ Days since first log
2. Units remaining = Total loaded − (Daily × Days elapsed)
3. Days remaining = Remaining ÷ Daily consumption
4. Alerts fire when remaining drops below your set threshold

All estimates recalculate automatically on each new recharge log.
