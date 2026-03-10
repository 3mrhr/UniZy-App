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

- **Student**: Discover and use services.
- **Merchant**: Manage menus and order operations.
- **Supply-Side Partners**: Integrated portal for House Owners, Cleaners, and Service Providers.
- **Driver**: Handle availability and logistics workflows.
- **Admin**: 10 specialized oversight roles (Finance, Support, Ops, Moderator, Meals, Driver, Housing, Cleaner, Service Provider, and Super Admin).
- **Guest**: Browse-only experience for housing; limited delivery ordering.

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
- **UI:** React + Vanilla CSS (Premium Design)
- **State Management:** Zustand
- **Database:** Supabase (PostgreSQL)
- **ORM:** Prisma
- **Session/Auth:** iron-session
- **Media Uploads:** Cloudinary (Full Integration)

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
# Database (Supabase)
DATABASE_URL="postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-1-eu-west-2.pooler.supabase.com:5432/postgres?sslmode=require"

# Session
SESSION_SECRET="your-long-random-secret"

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
CLOUDINARY_URL="cloudinary://[API_KEY]:[API_SECRET]@[CLOUD_NAME]"

# External APIs
RESEND_API_KEY="re_..."
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
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

Example seeded users (password: `Test1234!`):

- **Super Admin**: `admin@unizy.app` (God mode)
- **Finance Admin**: `finance@unizy.app` (Wallet/Rewards control)
- **Support Admin**: `support@unizy.app` (ID Verification control)
- **Students**: `student1@unizy.app` ... `student10@unizy.app`
- **Merchants**: `merchant1@unizy.app` ... `merchant5@unizy.app`
- **Drivers**: `driver1@unizy.app` ... `driver5@unizy.app`
- **Partners**: Consolidated login for Cleaners, Service Providers, and House Owners.
- **Guests**: Limited browse/delivery access without registration.

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
