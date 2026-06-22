# LCAR Drive

A platform connecting learner drivers with driving instructors. Built with Next.js 14, Supabase, Clerk, and Tailwind CSS.

## Features

- **Search & Discovery** – Find instructors by suburb, rating, and service areas
- **Instructor Profiles** – Detailed profiles with rates, availability, service areas, and reviews
- **Claims System** – Instructors can claim and manage their profiles
- **Admin Dashboard** – Review, approve, import/export data, manage backups
- **AI Document Scanning** – Google Gemini-powered document verification
- **Leads Management** – Track student inquiries and leads
- **Authentication** – Clerk-powered auth with student and admin roles

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS 3
- **Database:** Supabase (PostgreSQL)
- **Auth:** Clerk
- **AI:** Google Generative AI (Gemini)
- **Icons:** Lucide React
- **Location:** LocationIQ API
- **Email:** Resend

## Getting Started

1. Clone the repo:
   ```bash
   git clone git@github.com:pillavarunkumar/lcardrive.git
   cd lcardrive
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment template and fill in your keys:
   ```bash
   cp .env.local.example .env.local
   ```

4. Apply Supabase migrations:
   ```bash
   node scripts/apply-migrations.mjs
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `LOCATIONIQ_API_KEY` | LocationIQ API key |
| `RESEND_API_KEY` | Resend API key for emails |
| `GEMINI_API_KEY` | Google Gemini API key |
| `ADMIN_SECRET` | Admin access secret |

## Scripts

- `npm run dev` – Start development server
- `npm run build` – Build for production
- `npm run start` – Start production server
- `npm run lint` – Run ESLint

## Database Migrations

Migrations are in `supabase/migrations/` and can be applied with:
```bash
node scripts/apply-migrations.mjs
```

## License

Private – All rights reserved.
