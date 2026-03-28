# UniZy Environment Setup

Use `.env.local` for local development, or configure the same variables directly in Vercel for hosted environments.
`.env.example` is the canonical placeholder-only reference for this repo.

## Launch-critical variables

These are the variables you should treat as required for a working V1 deployment.

| Variable | Required | Why it exists |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Prisma connection string for the PostgreSQL database. |
| `SESSION_SECRET` | Yes | `iron-session` signing secret. Use a strong value with at least 32 characters. |
| `NEXT_PUBLIC_APP_URL` | Yes | Public base URL used for metadata and OAuth callback generation. |
| `CRON_SECRET` | Yes in production | Protects the `/api/cron/sla` route. |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth sign-in client ID. |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth sign-in client secret. |
| `RESEND_API_KEY` | Yes | Transactional email and OTP delivery. |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary upload configuration. |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary upload configuration. |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary upload configuration. |
| `NEXT_PUBLIC_UNIZY_INSTAPAY_PHONE` | Yes for launch | InstaPay destination shown to students during manual wallet top-up. |
| `NEXT_PUBLIC_UNIZY_VODAFONE_PHONE` | Yes for launch | Vodafone Cash destination shown to students during manual wallet top-up. |

## Manual payment notes

UniZy V1 uses manual wallet top-ups rather than a live payment gateway. Students send money externally, upload proof, and finance admins approve requests manually.

- The two `NEXT_PUBLIC_UNIZY_*` payment destination variables are intentionally public because they are rendered in the student wallet UI.
- If either payment destination is missing, the UI shows a clear configuration warning instead of a fake-looking placeholder phone number.
- Housing wallet deduction remains intentionally excluded by product decision for the current launch scope.

## Auth and provider notes

- Google OAuth is enabled through `{NEXT_PUBLIC_APP_URL}/api/auth/callback/google`.
- Apple OAuth is disabled for V1. Do not add `APPLE_CLIENT_ID` or other Apple auth variables unless that flow is intentionally reintroduced later.
- Local non-production builds have a development fallback for `SESSION_SECRET`, but deployed environments should always set a real value.

## Monitoring and operations

| Variable | Required | Why it exists |
| --- | --- | --- |
| `NEXT_PUBLIC_SENTRY_DSN` | Recommended in production | Client-side Sentry error capture. |
| `SENTRY_DSN` | Recommended in production | Server-side Sentry error capture. |
| `PAYMENT_WEBHOOK_SECRET` | Optional for V1 manual flow | Signature verification for the internal payment gateway webhook helper. |
| `RUN_WORKER` | Optional | Feature flag for worker-style runtime tasks. Defaults to `false`. |

The current repo uses DSN-only Sentry wiring. `SENTRY_AUTH_TOKEN` is not required for the tracked configuration because source map upload is disabled in `next.config.mjs`.

## Optional integration stubs

These variables appear in the codebase for optional future integrations and can stay on their defaults for the current launch:

| Area | Variables | Default |
| --- | --- | --- |
| Realtime | `REALTIME_PROVIDER`, `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER` | `REALTIME_PROVIDER=none` |
| Push notifications | `PUSH_PROVIDER`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | `PUSH_PROVIDER=none` |
| Storage alternatives | `STORAGE_PROVIDER`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET` | `STORAGE_PROVIDER=local` |
| Cache | `CACHE_PROVIDER`, `REDIS_URL` | `CACHE_PROVIDER=none` |

## Vercel checklist

1. Set every launch-critical variable in the Vercel project dashboard.
2. Set `NEXT_PUBLIC_APP_URL` to the exact deployed domain for that environment.
3. Use a hosted PostgreSQL connection string for `DATABASE_URL`.
4. Confirm the manual payment destination numbers are real before opening wallet top-ups to students.
5. Run `npx prisma migrate deploy` against the production database after the environment is configured.

## Local development checklist

1. Copy `.env.example` to `.env.local`.
2. Replace all placeholder values with local or shared development credentials.
3. Run `npm install`.
4. Run `npx prisma generate`.
5. Start the app with `npm run dev`.
