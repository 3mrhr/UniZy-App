<p align="center">
  <img src="public/images/unizy-logo-icon.png" alt="UniZy logo" width="104" />
</p>

# UniZy

**UniZy is a campus-first multi-service platform for students in New Assiut, Egypt.**
It brings student life workflows into one product: meals, local services, housing discovery, transport and shuttle flows, manual wallet top-ups, provider operations, and admin control surfaces built around the realities of launch-stage university operations.

Instead of forcing students to jump between scattered apps, chats, and cash-based offline coordination, UniZy centralizes discovery, booking, wallet activity, support, verification, and service fulfillment into one system with dedicated experiences for students, merchants, drivers, cleaners, service providers, house owners, finance, support, and operations teams.

## At a Glance

| Area | Details |
| --- | --- |
| Product focus | Student marketplace and operations platform |
| Primary audience | Students, merchants, drivers, cleaners, service providers, house owners, UniZy admin teams |
| Core services | Meals, services, housing, transport/shuttle, wallet/manual top-ups, support, rewards, verification |
| Launch payment model | Manual only: InstaPay / Vodafone Cash transfer + proof upload + admin approval |
| Stack | Next.js 15, React 19, Prisma, PostgreSQL, iron-session, Cloudinary, Resend, Zustand, Tailwind CSS, Leaflet, Sentry |
| Deployment target | Vercel-ready Next.js app with Prisma migrations |
| Current status | Launch-scope engineering complete; final deployment and live smoke checks remain operational tasks |

## Product Overview

UniZy is structured as a unified student platform rather than a single-service app. The repository contains the main web product and the supporting operational workflows needed to run it.

| Module | What it covers |
| --- | --- |
| Meals | Meal discovery, plans, ordering flows, merchant-facing menu operations |
| Services | Student-facing service discovery and booking flows for campus-adjacent needs |
| Housing | Listing discovery, comparisons, viewing flows, and request workflows |
| Transport & shuttle | Student transport requests, shuttle schedules, routing, and tracking surfaces |
| Wallet & manual payments | Student wallet history, manual top-up submission, proof upload, and finance review workflows |
| Provider / merchant / driver flows | Dedicated surfaces for supply-side operators and fulfillment teams |
| Rewards & ratings | Student rewards surfaces, activity history, and ratings/readback flows |
| Verification & support | Identity verification, support tickets, notifications, and admin review workflows |

## Key Features

### Student Experience

UniZy gives students one place to explore services, place orders, browse housing, request transport, track activity, top up their wallet, manage notifications, and navigate support or verification steps without leaving the platform.

### Supply-Side Operations

Merchants, providers, drivers, cleaners, and housing-side operators have role-specific portals designed for fulfillment, onboarding, content management, and ongoing service operations rather than generic back-office screens.

### Admin Control Surfaces

The admin experience is split across finance, support, operations, moderation, transport, housing, meals, and other role-based responsibilities so the platform can run with clear ownership and manual review where needed.

### Launch-Safe Platform Foundations

The codebase is built around environment-driven secrets, manual payment approval, server-side wallet handling, upload-backed proof flows, Google OAuth, and DSN-only Sentry monitoring for production visibility without storing live credentials in the repository.

## Tech Stack

| Layer | Tools |
| --- | --- |
| Frontend framework | Next.js 15 App Router, React 19 |
| Styling and UI | Tailwind CSS 4, custom component system, `lucide-react`, `framer-motion` |
| State and client UX | Zustand |
| Server and data | Prisma ORM, PostgreSQL |
| Sessions and auth | `iron-session`, email OTP via `otplib`, Google OAuth |
| Uploads and media | Cloudinary |
| Email | Resend |
| Maps and geospatial UI | Leaflet, `react-leaflet` |
| Monitoring | `@sentry/nextjs` with DSN-only setup |
| Deployment model | Standalone Next.js build, Vercel-compatible |

## Architecture and Repository Structure

UniZy is organized as a single Next.js application with App Router route groups for each audience, plus domain-based server actions and shared platform utilities.

```text
.
├── src/
│   ├── app/               # App Router routes, API routes, and domain server actions
│   ├── components/        # Shared UI plus role-specific component groups
│   ├── lib/               # Auth, session, wallet, integrations, config, shared utilities
│   ├── store/             # Zustand client state
│   └── i18n/              # Language and localization support
├── prisma/                # Prisma schema, migrations, seed scripts, SQL helpers
├── docs/                  # Setup, QA, and project documentation
├── public/                # Brand assets and static files
├── scripts/               # Local maintenance and utility scripts
└── .github/workflows/     # CI workflow definitions
```

Key architectural notes:

- `src/app/(student)`, `src/app/(admin)`, `src/app/(merchant)`, `src/app/(provider)`, and `src/app/(driver)` separate role-specific experiences cleanly.
- `src/app/actions/` is grouped by business domain so wallet, transport, services, auth, support, and related flows stay modular.
- Prisma is the source of truth for the data model and all deployment migrations.
- The app is configured for `output: 'standalone'`, which keeps Vercel and other container-style deploy targets straightforward.

## Setup

### Prerequisites

- Node.js 20 recommended to match CI
- npm
- PostgreSQL
- Optional: Docker and Docker Compose for local infrastructure

### Install dependencies

```bash
npm install
```

### Configure environment variables

Copy the example file and replace every placeholder with a real value for your environment:

```bash
cp .env.example .env.local
```

Environment reference:

- Launch variables: [`docs/env-setup.md`](docs/env-setup.md)
- Placeholder-only template: [`.env.example`](.env.example)

### Prepare the database

Generate the Prisma client, apply local migrations, and seed development data:

```bash
npx prisma generate
npm run prisma:migrate
npm run seed
```

### Start local development

```bash
npm run dev
```

Optional Docker path for local infrastructure:

```bash
docker compose up --build
```

The `docker-compose.yml` file is for local development only and uses local-only placeholder credentials. Do not reuse those values for hosted environments.

## Build, Test, and Prisma Commands

```bash
npm run dev           # Start local development
npm run build         # Build the production app
npm run start         # Start the production server locally
npm run lint          # Run ESLint
npm test              # Run Jest tests
npx tsc --noEmit      # Run the type check used in this repo workflow
npm run prisma:migrate # Apply local development migrations
npm run prisma:deploy  # Apply production migrations
npm run seed          # Seed the database
```

## Deployment

### Vercel flow

1. Import the repository into Vercel.
2. Set the required environment variables from [`.env.example`](.env.example) and [`docs/env-setup.md`](docs/env-setup.md).
3. Make sure `NEXT_PUBLIC_APP_URL` matches the deployed environment URL exactly.
4. Build with the default Next.js flow (`npm run build`).
5. Run Prisma migrations against the target database:

```bash
npm run prisma:deploy
```

### Required deployment variables

At minimum, production should have:

- `DATABASE_URL`
- `SESSION_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `CRON_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `RESEND_API_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NEXT_PUBLIC_UNIZY_INSTAPAY_PHONE`
- `NEXT_PUBLIC_UNIZY_VODAFONE_PHONE`

### Post-deploy notes

- Apple OAuth is intentionally disabled for V1.
- Sentry works in DSN-only mode; `SENTRY_AUTH_TOKEN` is optional and not required for the tracked setup.
- Verify the manual payment destination numbers before enabling student wallet top-ups.
- Run a browser smoke pass over login, wallet top-up, finance review, core student browsing flows, and transport/housing entry points.

## Security and Production Notes

- No live secrets, tokens, or passwords should ever be committed to tracked files.
- `.env.example` is placeholder-only by design; real values belong in `.env.local` or the deployment platform.
- Manual payments are a product decision for V1: students transfer externally, upload proof, and finance admins approve manually.
- The payment destination phone numbers are public-facing values and are intentionally configured through environment variables rather than hardcoded in source.
- Housing wallet deduction remains intentionally excluded from the current wallet-charge scope.
- Apple OAuth is disabled for the current launch scope and should not be configured unless the product explicitly re-enables it later.

## Project Status

Current repo status is best described as **launch-ready engineering with final deployment ops pending**.

What is already in scope:

- Student-facing multi-service platform foundation
- Role-based portals across operations and supply-side users
- Manual wallet top-up flows
- Google OAuth, email/OTP support, upload-backed proof flows
- Prisma/PostgreSQL-backed data model and migration path
- Vercel-compatible deployment shape

What is intentionally deferred or constrained:

- Apple OAuth for V1
- Live automated payment gateway checkout
- Optional realtime, push, cache, and alternate storage integrations unless explicitly enabled
- Formal public license declaration

## Screens and Visuals

**TODO:** add real product screenshots once a stable staging or production environment is available.

Recommended capture set:

- Student home / discovery surface
- Wallet top-up flow
- Housing discovery
- Transport or shuttle booking
- Merchant or provider dashboard
- Admin finance review queue

## Contributor Workflow

Keep changes small, scoped, and safe to review.

Before opening a PR or pushing a release-oriented change:

1. Keep secrets out of tracked files.
2. Update docs when setup, env, or deployment behavior changes.
3. Run `npx tsc --noEmit`.
4. Run `npm test`.
5. Run `npm run build`.
6. If Prisma schema changes are involved, include the correct migration flow.

The repo also includes a GitHub Actions workflow in `.github/workflows/ci.yml` that installs dependencies, generates the Prisma client, and builds on pushes and pull requests targeting `main`.

## License

**License not yet specified.**
