# UniZy App

UniZy is a multi-service student platform that unifies university-focused services in one product experience: housing, transport, food & delivery, local offers, and operational support workflows.

This repository contains the UniZy web application built with **Next.js App Router**, **Prisma**, and **PostgreSQL**, with dedicated experiences for students, merchants, providers, drivers, and administrators.

---

## Table of Contents

- [Overview](#overview)
- [Core Product Areas](#core-product-areas)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Run with Docker (Recommended)](#run-with-docker-recommended)
- [Run Locally](#run-locally)
- [Database & Seeding](#database--seeding)
- [Available Scripts](#available-scripts)
- [Authentication, Roles, and Seeded Users](#authentication-roles-and-seeded-users)
- [Quality Assurance](#quality-assurance)
- [Current MVP Limitations](#current-mvp-limitations)
- [Contribution Guidelines](#contribution-guidelines)
- [License](#license)

---

## Overview

UniZy is designed as a campus-first “super app” experience with role-specific portals:

- **Student**: discover and use services.
- **Merchant**: manage menus and order operations.
- **Provider**: manage housing/services inventory and requests.
- **Driver**: handle availability and logistics workflows.
- **Admin**: monitor platform operations and moderation queues.

The current codebase represents an MVP with core flows implemented and some features intentionally deferred for future phases.

---

## Core Product Areas

### Student Experience
- Service hub and navigation
- Delivery marketplace (merchant browsing, cart, checkout, tracking)
- Housing browse/request flows
- Transport booking flows
- Rewards/activity views
- Localization support (English + Egyptian Arabic, RTL/LTR)
- Light/dark theme support

### Supply-Side Portals
- **Merchant Portal**: order queue and menu controls
- **Provider Portal**: listings and lead/request management
- **Driver Portal**: availability, assignment, and earnings views

### Admin Experience
- Operational dashboard and metrics
- Moderation and approval workflows
- Verification queue (MVP simulation)

---

## Technology Stack

- **Framework:** Next.js (App Router)
- **UI:** React + Tailwind CSS
- **State Management:** Zustand
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Session/Auth:** iron-session
- **Media Uploads:** Cloudinary (optional)

---

## Repository Structure

```text
src/
  app/
    (public)/      Public pages
    (auth)/        Login/register/recovery flows
    (student)/     Student modules
    (admin)/       Admin panel
    (driver)/      Driver portal
    (provider)/    Provider portal
    (merchant)/    Merchant portal
  lib/             Shared server/client utilities
  store/           Zustand stores
prisma/
  schema.prisma    Prisma schema
  seed.mjs         Seed script
scripts/           Utility and benchmarking scripts
```

---

## Prerequisites

Before running the project, ensure you have:

- **Node.js** 18+
- **npm** 9+
- **PostgreSQL** (if not using Docker)
- **Docker + Docker Compose** (recommended path)

---

## Environment Configuration

Create a `.env` file at the repository root:

```env
# Required
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/unizy_dev"
SESSION_SECRET="replace-with-a-long-random-string"

# Optional (required only for image uploads)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

> Keep secrets out of source control. Use environment-specific values for local, staging, and production deployments.

---

## Run with Docker (Recommended)

### 1) Start services

```bash
docker compose up --build
```

### 2) Initialize database (first run)

```bash
docker compose exec app npx prisma generate
docker compose exec app npx prisma db push
docker compose exec app npm run seed
```

### 3) Open the app

- http://localhost:3000

---

## Run Locally

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Add `.env` as described in [Environment Configuration](#environment-configuration).

### 3) Apply database setup

```bash
npx prisma generate
npx prisma db push
npm run seed
```

### 4) Start development server

```bash
npm run dev
```

If local startup keeps failing because of stale locks/caches, run:

```bash
npm run doctor:local
```

---

## Database & Seeding

The seed process populates baseline users and data for local testing.

```bash
npm run seed
```

If your schema changes:

```bash
npx prisma generate
npx prisma db push
npm run seed
```

---

## Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build production bundle
npm run start     # Run production server
npm run lint      # Run ESLint
npm run seed      # Seed database via prisma/seed.mjs
npm run doctor:local # Remove stale Next.js lock/cache and verify deps
```

---

## Authentication, Roles, and Seeded Users

After seeding, log in via:

- `/login`

Default seeded password:

- `unizy2026`

Example seeded users (subject to seed script evolution):

- Admin: `admin@unizy.com`
- Driver: `driver1@unizy.com`
- Provider: `provider1@unizy.com`
- Merchant: `merchant_pizza@unizy.com`

---

## Quality Assurance

Use the included QA checklists for manual regression and scenario validation:

- `QA_CORE_CHECKLIST.md` — core user flows and sanity checks
- `QA_BETA_CHECKLIST.md` — deeper edge-case and stress scenarios

---

## Current MVP Limitations

The following areas are intentionally deferred or simulated:

- **Payments:** production payment gateway integration is pending
- **Password reset:** full production reset/email flow is pending
- **OTP/verification:** currently simulated/optional in parts of the product

---

## Contribution Guidelines

Recommended workflow:

1. Create a focused feature branch
2. Keep changes small and testable
3. Update tests/checklists when user-facing behavior changes
4. Run lint and relevant tests before opening a PR

---

## License

This project is currently private/internal MVP codebase. A formal license will be added if/when open-sourced.
