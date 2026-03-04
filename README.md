# UniZy — Student Super App (MVP)

UniZy is a multi-service platform designed for university students, bringing **Housing**, **Transport**, **Delivery**, **Local Deals**, and **Student Services** into one cohesive experience.

This repository contains the MVP built with **Next.js App Router** and a **Prisma + PostgreSQL** backend, structured around distinct roles:

- **Student** (demand side)
- **Merchant** (restaurants/stores)
- **Provider** (housing/landlords + service providers)
- **Driver** (transport + delivery logistics)
- **Admin** (operations + moderation)

> Note: Payments and Password Reset are intentionally deferred for later phases. Verification/OTP is currently simulated/optional.

---

## Features (High-Level)

### Student App
- Student hub (service menu)
- Delivery marketplace (browse merchants → view menu → cart → checkout → tracking)
- Housing browsing and requests
- Transport booking UI
- Rewards and activity tracking
- i18n: English + Egyptian Arabic (RTL/LTR)
- Dark/Light theming

### Supply Portals
- **Merchant** portal: order management + menu controls
- **Provider** portal: housing listings + lead/request management
- **Driver** portal: availability, assignments, basic earnings/settlements views

### Admin Panel
- Overview dashboard & metrics
- Moderation workflows (e.g., housing approvals)
- Verification queue (simulated/optional)

---

## Tech Stack

- **Framework:** Next.js (App Router)
- **UI:** React + Tailwind CSS
- **State:** Zustand
- **DB:** PostgreSQL
- **ORM:** Prisma
- **Auth/session:** iron-session
- **Media:** Cloudinary (optional; can run without it)

---

## Project Structure

```txt
src/
  app/
    (public)/     Public landing pages
    (auth)/       Login/Register flows
    (student)/    Student application modules
    (admin)/      Admin panel
    (driver)/     Driver portal
    (provider)/   Housing provider / landlord portal
    (merchant)/   Merchant portal
  components/     Reusable UI components
  i18n/           Language dictionaries + provider
prisma/
  schema.prisma   Prisma schema
  seed.mjs        Seed script
docker-compose.yml
Dockerfile
QA_CORE_CHECKLIST.md
QA_BETA_CHECKLIST.md
```

---

## Getting Started (Recommended: Docker)

This repo includes docker-compose.yml with PostgreSQL and the app container.

1) Clone & run

```bash
git clone https://github.com/3mrhr/UniZy-App.git
cd UniZy-App
docker compose up --build
```

2) Initialize DB (first run)

In another terminal:

```bash
docker compose exec app npx prisma generate
docker compose exec app npx prisma db push
docker compose exec app npm run seed
```

3) Open the app
	•	http://localhost:3000

---

## Getting Started (Local Node + Your Own PostgreSQL)

1) Install deps

```bash
npm install
```

2) Create .env

Create a .env file in the repo root:

```env
# Required
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/unizy_dev"
SESSION_SECRET="change-me-to-a-long-random-string"

# Optional (only needed if you enable image uploads)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

3) Prisma setup

```bash
npx prisma generate
npx prisma db push
npm run seed
```

4) Run dev server

```bash
npm run dev
```

---

## Scripts

```bash
npm run dev        # start dev server
npm run build      # build production output
npm run start      # run production server
npm run lint       # eslint
npm run seed       # seed database (prisma/seed.mjs)
```

---

## Login & Roles (Seeded Accounts)

After running npm run seed, log in at:
	•	/login

Default seeded password:
	•	unizy2026

Example seeded accounts (may expand depending on seed script):
	•	Admin: admin@unizy.com
	•	Driver: driver1@unizy.com
	•	Provider: provider1@unizy.com
	•	Merchant: merchant_pizza@unizy.com

---

## QA / Testing

Use the included checklists:
	•	QA_CORE_CHECKLIST.md — core flows (recommended for quick regression testing)
	•	QA_BETA_CHECKLIST.md — deeper scenario coverage (edge cases / “unthinkables”)

---

## Current Intentional Limitations

These are deliberately not final yet:
	•	Payments: deferred (no real gateway behavior required right now)
	•	Password Reset: deferred (no production-ready reset email flow yet)
	•	OTP/Verification: simulated/optional (placeholders allowed)

---

## Contributing / Workflow

Recommended workflow:
	1.	Create a feature branch
	2.	Keep changes small and testable
	3.	Update QA checklist entries when you change user-facing behavior

---

## License

Private/internal MVP (add license later if open-sourcing).
