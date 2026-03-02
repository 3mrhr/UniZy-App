# UniZy - Main.Task.md (The Infinite Roadmap)

This is the definitive, high-resolution roadmap for UniZy ("The Student Super App"). It serves as the project's single source of truth, detailing every micro-feature, operational layer, and future scalability requirement from **Step 1 until the final production launch**.

---

## 🟢 PART 1: THE COMPLETED JOURNEY (STEP 1 TO NOW)

### phase 1: The Core Foundation & Student UX
- [x] **Project Genesis**: Scaffolded Next.js 15+ App Router project with Tailwind CSS v4.
- [x] **Premium Design System**: 
    - [x] Established "UniZy" color palette (Indigo/Navy/Orange).
    - [x] Implemented Glassmorphism UI components (Backdrop-blur, subtle borders).
    - [x] Configuration of fluid typography and spacing.
- [x] **Global Navigation Shell**:
    - [x] Mobile-first bottom navigation (Home, Hub, Activity, Account).
    - [x] Desktop-responsive sidebar for larger screens.
- [x] **Student Marketplace Scaffolding**:
    - [x] **Housing**: Grid-based property feeds and search layout.
    - [x] **Delivery**: Vendor cards, category tiles, and menu layouts.
    - [x] **Transport**: Ride-booking forms and map-view placeholders.

### phase 2: Branding & Universal i18n
- [x] **Language Engine**: Implemented `LanguageProvider` for English/Arabic switching.
- [x] **RTL/LTR Layouts**: Full UI adaptation for Arabic speakers.
- [x] **Theme Management**: Integrated `next-themes` for Dark/Light mode persistent state.
- [x] **Brand Identity**: Logo generation and premium landing page with animated service blocks.

### phase 3: The "Supply Side" Ecosystem (Provider Portals)
- [x] **Multi-Role Infrastructure**: Database support for Student, Driver, Merchant, Provider, and Admin.
- [x] **Driver Dashboard Hub**: Real-time job toggle, earnings tracker, and task list.
- [x] **Housing Provider Portal**: Dashboard for property management and lead tracking.
- [x] **Merchant Dashboard Hub**: Order management "Kanban" board and store summary.
- [x] **Smart Auth Routing**: Logic that redirects each user type to their specific cockpit on login.

### phase 4: Database & Server Architecture
- [x] **Prisma ORM**: Configured with SQLite (`dev.db`) for lightweight development.
- [x] **Core Schema Design**: 
    - [x] `User` & `Profile` models (Initial fields).
    - [x] `HousingListing`, `Meal`, `Deal`, and `Order` entities.
    - [x] `Review` & `Rating` relationships.
- [x] **Server Actions**: Transitioned from old API routes to secure, direct backend actions.

### phase 5: Hierarchical Administration (The Business Engine)
- [x] **Centralized Admin Portals**: Dedicated, restricted cockpits for every module.
- [x] **Superadmin Master Control**: Global analytics, user management, and moderation queue.
- [x] **Module Admins**: Specialized dashboards for Delivery, Transport, Housing, and Commerce.
- [x] **Admin Test Credentials**: Documented in `admin-credentials.md`.

### phase 16: Authentication & Profile Hardening (Completed) ✅
- [x] **Expanded Student Profile**: Updated User model and Registration flow with University, Faculty, Year, and Gender.
- [x] **OTP Verification UI**: High-fidelity numeric code entry with 60s countdown timer.
- [x] **Digital ID Verification**: Dedicated Student ID photo upload and verification pipeline.
- [x] **Onboarding Refinement**: Multi-step registration feel with role-based field toggling.

---

## ✅ PART 2: THE "GAP" AUDIT (ALL COMPLETED)

### phase 17: Smart Search & Advanced Filtering ✅
- [x] **Global Search Page**: Centralized search across Housing, Meals, and Deals (`/search`).
- [x] **Category Tabs**: Filter by Housing, Deals, or Meals.
- [x] **Price & Sort Filters**: Min/max price range and sort by relevance or price.

### phase 18: Housing & Transport Micro-Flows ✅
- [x] **Viewing Request Form**: Date/time scheduling at `/housing/[id]/viewing`.
- [x] **Housing Comparison Page**: Side-by-side comparison at `/housing/compare`.
- [x] **Recurring Transport**: Daily commute scheduling with day-of-week selection at `/transport/schedule`.
- [x] **SOS Layer**: Emergency button component with quick-dial contacts (`SOSButton.js`).

### phase 19: Delivery & Parcel Enhancement ✅
- [x] **Parcel Delivery Form**: Full sender/receiver/item form at `/delivery/parcel`.
- [x] **Status Timeline**: Live order tracking with step-by-step timeline at `/activity/tracking`.
- [x] **Reorder Flow**: "Reorder" button on completed orders in tracking view.

### phase 20: Student Hub (Community Engine) ✅
- [x] **Campus Feed**: Social wall with posts, likes, comments, and sharing.
- [x] **Post Categories**: Study Help, Lost & Found, Housing tags.
- [x] **Create Post**: Inline post composer with image attachment.
- [x] **Roommate Finder wizard**: Full lifestyle preference form at `/hub/roommate`.

---

## 🟡 PART 3: BACKEND HARDENING & GROWTH

### phase 21: Auth Hardening ✅
- [x] Install `bcryptjs` and `iron-session` packages.
- [x] Create `src/lib/session.js` with iron-session encrypted cookie config.
- [x] Update schema: add HubPost, Referral, Campaign, Notification models.
- [x] Prisma DB push with new models.
- [x] Rewrite `auth.js` — bcrypt hash on register, compare on login.
- [x] Replace mock JSON cookie with iron-session encrypted sessions.
- [x] Fix `await cookies()` for Next.js 16.
- [x] Auto-generate unique referral code for each new user.
- [x] Process referral codes on registration (award points to both parties).

### phase 22: Hub Moderation Tools ✅
- [x] Create `hub.js` server actions (createPost, getPosts, deletePost, flagPost, getModQueue, approvePost).
- [x] Create `/admin/hub` moderation page with flagged post queue + approve/delete.
- [ ] Wire hub/page.js to real DB posts instead of mock data (future).

### phase 23: Referral Center & Campaign Manager ✅
- [x] Create `referrals.js` server actions (getReferralStats).
- [x] Build referral page UI at `/rewards/referrals` (copy code, history, stats).
- [x] Create `campaigns.js` server actions (createCampaign, getCampaigns, sendCampaign).
- [x] Build `/admin/campaigns` page with campaign builder + audience targeting.

### phase 24: Database & Media Infrastructure ✅
- [x] **PostgreSQL Migration**: Installed PostgreSQL 16 locally, switched Prisma from SQLite to PostgreSQL, pushed schema to `unizy_dev` database.
- [x] **Cloudinary Integration**: Installed SDK, created `upload.js` with `uploadImage`, `deleteImage`, `uploadProfilePicture`, `uploadListingImage`, `uploadVerificationDoc` — smart fallback when unconfigured.

### phase 25: Hub Real Data & Password Reset ✅
- [x] Wire hub/page.js to real DB posts (`getPosts()`, `createPost()`, `flagPost()` actions).
- [x] Connect post composer to `createPost()` with category selector.
- [x] Add "Report" button on posts (calls `flagPost()`).
- [x] Build password reset: `/forgot-password` page (3-step flow), `requestPasswordReset()`, `resetPassword()` actions.
- [x] PasswordReset model added to schema.
- [x] Login page "Forgot?" links to `/forgot-password` instead of alert.

### phase 26: E2E Testing with New Auth ✅
- [x] Test full registration flow (bcrypt hash verified ✅).
- [x] Test login flow with hashed passwords (redirects correctly ✅).
- [x] Test session persistence (iron-session encrypted cookies ✅).
- [x] Test role-based routing after auth (admin → dashboard, student → home ✅).
- [x] All 5 E2E tests passed (recorded in `e2e_auth_test` video).

### phase 27: Production Deployment Prep ✅
- [x] Dockerfile (multi-stage: deps → build → slim runner using node:20-alpine).
- [x] docker-compose.yml (PostgreSQL 16 + app, with health checks).
- [x] .dockerignore.
- [x] GitHub Actions CI/CD workflow (`.github/workflows/ci.yml` — lint, build, test).
- [x] Next.js `standalone` output config + Cloudinary/ui-avatars remote patterns.

### phase 28: Home Services Module ✅
- [x] `ServiceProvider` and `ServiceBooking` models added to Prisma schema.
- [x] `services.js` server actions: listProviders, bookService, getMyBookings, rateProvider, getAdminProviders, approveProvider.
- [x] `/services` page — browse providers by category, call/book actions, booking modal.
- [x] `/admin/services` page — stats dashboard, provider verification (approve/reject).

### phase 29: Housing Cleaning Services ✅
- [x] `CleaningPackage` and `CleaningBooking` models added to Prisma schema.
- [x] `cleaning.js` server actions: listPackages, bookCleaning, getCleaningBookings, getAdminCleaningStats.
- [x] `/services/cleaning` page — package cards, inclusions checklist, booking modal.
- [x] `/admin/cleaning` page — stats dashboard, booking management with confirm action.

### phase 30: Seed All Role Accounts & Final Testing ✅
- [x] Re-seeded all 9 accounts (bcrypt-hashed) — 5 admin, driver, provider, merchant, student.
- [x] Tested each role login → correct dashboard redirect verified (student→/students, superadmin→/admin, driver→/driver, merchant→/merchant, housing admin→/admin/housing).
- [x] Role-based access controls verified.
- [x] `admin-credentials.md` updated with all 9 role credentials.
- [x] 49 routes build clean.

---

## 🚀 PART 4: PREVIOUSLY NOTED FUTURE ITEMS (MERGED INTO ROADMAP BELOW)

> Items from v5.3 (Payment/Wallet, Live Ops, OTP/ID) have been absorbed into the comprehensive roadmap in Part 5.

---

## 🔶 PART 5: FULL PRODUCTION ROADMAP (23 SECTIONS · PHASES 31–53)

> **Priority order: Phase 31 → Phase 53 (sequential)**
> Each phase depends on the previous. Do NOT skip ahead.

---

### Phase 31–32: Foundation & Control (MUST BE FIRST)

#### Phase 31: Roles & Access Control (Global)

- [x] **Finalize role list** in schema + auth:
    - [x] Student
    - [x] Driver / Rider
    - [x] Merchant / Service Provider
    - [x] Housing Provider
    - [x] Meal Partner
    - [x] Support Agent
    - [x] Module Admins: Housing Admin, Transport Admin, Delivery Admin, Deals Admin, Meals Admin
    - [x] Operations Admin
    - [x] Finance Admin
    - [x] Super Admin
- [x] **Add `middleware.js`** — enforce auth on protected routes
- [x] **Role guard per route group** — student, provider, admin, module-admin
- [x] **Module-admin scope enforcement** — each module admin sees only their pricing/commission
- [x] **Remove dev login bypass** from `loginUser()`

**Admin pages required:**
- [x] `/admin/roles-permissions` — Role assignment page
- [x] `/admin/roles-permissions/scopes` — Permission scopes (module-level matrix)
- [x] `/admin/staff` — Add staff user form
- [x] `/admin/staff/assign` — Assign module scope(s) to staff

---

#### Phase 32: Audit Logs (Non-Negotiable)

- [x] **Create `AuditLog` model** in Prisma: action, module, targetId, adminId, details (JSON), timestamp
- [x] **Auto-log all admin actions:**
    - [x] Price changes
    - [x] Commission changes
    - [x] Refunds issued
    - [x] Payout actions
    - [x] Listing approvals/rejections
    - [x] Account suspensions
    - [x] Manual dispatch overrides
- [x] **Create audit log helper** `logAdminAction(action, module, details)` used in every server action

**Admin pages required:**
- [x] `/admin/audit-logs` — Full log viewer with filters (module, admin, date, action type)

---

### Phase 33–34: Core Transaction Engine (THE BACKBONE)

#### Phase 33: Unified Transaction Center

- [x] **Create `Transaction` model** — single table for ALL service transactions:
    - [x] Housing requests
    - [x] Transport bookings
    - [x] Delivery orders
    - [x] Deals redemptions
    - [x] Meals orders / subscriptions
    - [x] Support tickets (linked)
- [x] **Unify `Order` model** or create join/reference system
- [x] **Transaction ID generation** (e.g. `TXN-2026-XXXXXX`)

**Student pages required:**
- [x] `/activity` — Unified center with tabs: Housing / Transport / Delivery / Deals / Meals / Tickets
- [x] `/activity/[id]` — Status timeline details per transaction

**Admin pages required:**
- [x] `/admin/transactions` — Unified view with global search + filters (module, status, zone, provider, user)

---

#### Phase 34: Status Tracking & Timelines (Standardized)

- [x] **Define master status lifecycle** per service type:
    - [x] Requested → Accepted → Assigned → In Progress → Completed
    - [x] Cancelled / Failed / Refunded
    - [x] Service-specific statuses (e.g. "Ready for Pickup", "Out for Delivery")
- [x] **Status transition validation** — prevent illegal transitions
- [x] **Status history log** — timestamp every transition with actor ID

**Needed across ALL dashboards:**
- [x] Students: status timeline + actions (cancel / reorder / rebook)
- [x] Providers: status update controls (next step buttons)
- [x] Admin: override + force status + reason logging

---

### Phase 35–36: Pricing + Commission Control

#### Phase 35: Pricing System (Dashboard-Controlled)

- [x] **Create `PricingRule` model** — module, service type, base price, fee components, zone, effective date, active flag
- [x] **Support levels:**
    - [x] Global pricing (Super Admin)
    - [x] Module pricing (Module Admin)
    - [x] Zone pricing (optional now, required later)
    - [x] Scheduled pricing (optional — effective date)
- [x] **Fee components:** service fees, delivery fees, ride pricing, housing listing fees, etc.

**Admin pages required:**
- [x] `/admin/pricing` — Master pricing dashboard with tabs: Housing | Transport | Delivery | Deals | Meals
    - [x] Each tab: rules list, add/edit rule, enable/disable, effective date
- [x] `/admin/zones` — Zone list, assign pricing to zones

**Module Admin pages:**
- [x] Housing Admin → `/admin/housing/pricing`
- [x] Transport Admin → `/admin/transport/pricing`
- [x] Delivery Admin → `/admin/delivery/pricing`
- [x] Deals Admin → `/admin/commerce/pricing`
- [x] Meals Admin → `/admin/commerce/pricing` (*merged to commerce context*)

---

#### Phase 36: Commission System (Dashboard-Controlled)

- [x] **Create `CommissionRule` model** — module, provider type, UniZy share %, provider share %, promo subsidy impact, zone, active flag
- [x] **Per-module and per-zone rules**
- [x] **Commission history** — rule versioning with effective dates

**Admin pages required:**
- [x] `/admin/commissions` — Tabs per module, provider type selector, active rules + history

**Module Admin pages:**
- [x] Each module admin gets `[Module] Admin → Commission` sub-page

---

### Phase 37–39: Money Layer (BEFORE "REAL OPERATIONS")

#### Phase 37: Payments (MVP)

- [x] **Create `Payment` model** — transaction ref, amount, method (COD/CASH/CARD), status (PENDING/PAID/FAILED), paidAt
- [x] **Support at minimum:**
    - [x] COD for delivery
    - [x] Cash for rides
    - [x] Manual "mark as paid"
    - [x] Payment status tracking
- [ ] **(Future)** Payment gateway integration — Stripe / Paymob

**Admin pages required:**
- [x] `/admin/payments` — Payment list + status editor (with audit log)

**Student pages required:**
- [x] Receipt / payment status screen per transaction (inside `/activity/[id]`)

---

#### Phase 38: Refunds & Adjustments

- [x] **Create `Refund` model** — transaction ref, amount, type (FULL/PARTIAL), reason, status (REQUESTED/APPROVED/REJECTED/PROCESSED), approvedBy
- [x] **Automatic status updates** on parent transaction
- [ ] **(Future)** Wallet refund credits

**Admin pages required:**
- [x] `/admin/refunds` — Request list, approve/reject, detail page

**Support pages required:**
- [x] Support → Refund Requests — create refund request linked to transaction

---

#### Phase 39: Settlement & Payout Engine

- [x] **Create `Settlement` model** — provider ref, period, gross, commission, net, status (PENDING/PROCESSING/PAID/FAILED)
- [x] **Create `Payout` model** — settlement ref, amount, method, reference, paidAt
- [x] **Track payables to:** Drivers, Merchants, Housing Providers, Meal Partners
- [x] **Track:** completed payouts, failed payouts, outstanding balances

**Admin pages required:**
- [x] `/admin/finance/settlements` — By provider type / provider / date range
- [x] `/admin/finance/payouts` — Payout queue, mark paid, payout history
- [x] `/admin/finance/reports` — Revenue & commission reports per module, per day/week/month

**Provider dashboards required:**
- [x] Driver → `/driver/earnings` (real settlement data)
- [x] Merchant → `/merchant/earnings`
- [x] Housing Provider → `/provider/earnings`
- [ ] Meal Partner → earnings page
- [x] *(All tied to Settlement model, not mock totals)*

---

### Phase 40–42: Operational Layer ("Run the Business")

#### Phase 40: Dispatch System (Manual First, Then Smart)

- [x] **Create `Dispatch` model** — order ref, assigned driver, status, assigned by, delay reason, override flag
- [x] **Support for:** Transport rides, Delivery riders, Parcel requests

**Admin pages required:**
- [x] `/admin/dispatch` — Tabs: Transport | Delivery | Parcel
    - [x] Assign/reassign driver
    - [x] Delay reason logging
    - [x] Manual override actions

**Driver dashboard:**
- [x] Job request screen + accept/decline buttons
- [x] Active job screen + status update buttons

---

#### Phase 41: Verification Center

- [ ] **Full verification workflows:**
    - [ ] Driver documents (license, vehicle registration)
    - [ ] Merchant documents (business license, food permit)
    - [ ] Housing provider documents (ownership deed)
    - [ ] Listing moderation (housing photos, descriptions)
    - [ ] Student ID verification (OTP + ID upload — currently mock)
- [ ] **OTP system:** Generate 6-digit code, store with expiry, send via SMS/email (Twilio/SendGrid)
- [ ] **ID upload:** Save to Cloudinary, set status to PENDING_VERIFICATION
- [ ] **`verificationStatus` field** on User: UNVERIFIED → PENDING → VERIFIED → REJECTED

**Admin pages required:**
- [ ] `/admin/verifications` — Tabs: Drivers | Providers | Merchants | Students
- [ ] `/admin/listings-moderation` — Approve/reject housing listings, flag suspicious

---

#### Phase 42: SLA Rules & Monitoring

- [ ] **Create `SLARule` model** — module, metric (acceptance_time, assignment_time, response_time, approval_time), threshold, breach action
- [ ] **SLA tracking engine** — detect breaches in real-time
- [ ] **Breach notifications** — alert admins on SLA violations

**Admin pages required:**
- [ ] `/admin/sla` — Breach list + SLA settings per module

---

### Phase 43–44: User Experience Completion (Student App)

#### Phase 43: Home + Services Navigation (Final Structure)

- [ ] Finalize student home dashboard layout
- [ ] Services hub with all 6 modules accessible
- [ ] Bottom navigation structure finalized: Home | Services | Hub | Activity | Account
- [ ] Global search bar accessible from all pages

---

#### Phase 44: Complete Each Module End-to-End

**Housing — still needed:**
- [ ] Search filters fully working (DB-side)
- [ ] Listing detail fully completed (all fields)
- [ ] Save favorites (saved listings)
- [ ] Request viewing (backend-wired)
- [ ] Request booking/interest
- [ ] Provider chat/relay (optional)
- [ ] Reviews + report listing
- [ ] Compare listings (wired to real data)
- [ ] My housing requests page

**Transport — still needed:**
- [ ] Ride estimate + confirm (pricing API)
- [ ] Live ride status page (real-time)
- [ ] Rate driver
- [ ] Cancellation rules + enforcement
- [ ] SOS / safety button (wired to backend)

**Delivery — still needed:**
- [ ] Merchant browse (real DB data)
- [ ] Item detail page
- [ ] Cart + checkout flow
- [ ] Delivery tracking (real status updates)
- [ ] Reorder (wired)
- [ ] Parcel flow end-to-end

**Deals — still needed:**
- [ ] Deal browse + filter (✅ exists — verify working)
- [ ] Deal detail page (✅ exists — verify)
- [ ] Redeem flow (promo code validation + usage tracking)
- [ ] Saved deals page (✅ exists)
- [ ] Redemption history

**Meals — still needed:**
- [ ] Meal browse (✅ exists — needs data)
- [ ] Meal plans (subscription flow if included)
- [ ] Pause/skip subscription (if included)
- [ ] Order meal + cart

---

### Phase 45–46: Support + Trust + Safety

#### Phase 45: Support Ticketing System (Real Workflow)

- [ ] **Expand `SupportTicket` model** — add: assignedTo, escalatedTo, attachments (JSON), linkedTransactionId
- [ ] **Ticket lifecycle:** OPEN → ASSIGNED → IN_PROGRESS → ESCALATED → RESOLVED → CLOSED
- [ ] **Assignment to support agents**
- [ ] **Escalation rules** (auto-escalate after X hours)
- [ ] **File attachments** on tickets

**Student pages:**
- [ ] Help center (FAQ + knowledge base)
- [ ] Submit ticket form (with attachment)
- [ ] Ticket status page
- [ ] Live chat shortcut (optional / future)

**Support Dashboard:**
- [ ] `/support/inbox` — Ticket inbox
- [ ] `/support/ticket/[id]` — Ticket details + actions
- [ ] `/support/escalations` — Escalation queue
- [ ] `/support/refunds` — Create refund request linked to transaction

**Admin pages:**
- [ ] `/admin/support-center` — SLA tracking, assignment rules, escalation settings

---

#### Phase 46: Trust, Reporting, and Abuse Handling

- [ ] **Create `Report` model** — type (DRIVER/MERCHANT/LISTING/HUB_POST), targetId, reporterId, reason, status
- [ ] **Report flows:**
    - [ ] Report driver
    - [ ] Report merchant
    - [ ] Report listing
    - [ ] Report hub content
- [ ] **(Future)** Internal trust scores

**Admin pages:**
- [ ] `/admin/reports` — Reports & abuse viewer, filters by module, action buttons (warn/ban/remove/hide)

---

### Phase 47–49: Growth Layer

#### Phase 47: Referral System (Enhancement)

- [ ] ✅ Personal referral code (exists)
- [ ] ✅ Track invites (exists)
- [ ] **Add:** Reward conditions (e.g. referral only counts after first order)
- [ ] **Add:** Fraud prevention (cap referrals per day, block self-referral patterns)

**Admin pages:**
- [ ] `/admin/referrals` — Performance dashboard + abuse detection

---

#### Phase 48: Promotions / Coupons

- [ ] **Create `Promo` model** — code, type (PERCENT/FIXED), value, module, budget cap, usage cap, expiry, active
- [ ] **Promo validation** on checkout / booking
- [ ] **Budget tracking** — auto-disable when cap reached

**Admin pages:**
- [ ] `/admin/promotions` — Create/edit promo, usage analytics, budget tracking

---

#### Phase 49: Notifications Center (Full)

- [ ] **Wire `Notification` table** to student UI (currently mock)
- [ ] **Module-based triggers** — auto-generate notifications for:
    - [ ] Order status changes
    - [ ] Verification updates
    - [ ] Referral rewards
    - [ ] Campaign broadcasts
    - [ ] SLA breaches (admin)
- [ ] **Broadcast messages** (already exists via campaigns)

**Student pages:**
- [ ] `/notifications` — Real notification list from DB
- [ ] `/account/notification-preferences` — Opt-in/out per category

**Admin pages:**
- [ ] `/admin/notifications` — Broadcast tool + segment targeting

---

### Phase 50: Intelligence & Analytics

#### Phase 50: Analytics & Reports

- [ ] **Real admin dashboard stats** — replace all hardcoded numbers with live DB counts
- [ ] **Metrics:**
    - [ ] User growth (registrations over time)
    - [ ] Order trends (daily/weekly/monthly)
    - [ ] Service popularity (by module)
    - [ ] Provider performance (ratings, completion rate)
    - [ ] Failed order reasons
    - [ ] Complaint analytics
- [ ] **(Future)** CSV/PDF export

**Admin pages:**
- [ ] `/admin/analytics` — Tabs per module, charts, date range picker

---

### Phase 51–53: Go-Live Readiness

#### Phase 51: Policies & Rules Screens

- [ ] ✅ Terms of Service page (exists)
- [ ] ✅ Privacy Policy page (exists)
- [ ] **Add:** Refund policy page
- [ ] **Add:** Community guidelines page
- [ ] **Add:** Rewards rules page
- [ ] **Add:** Cancellation policy page
- [ ] **Add:** Legal section in Account page linking all policies

---

#### Phase 52: Data QA & Reliability

- [ ] Remove ALL mock/hardcoded data from admin dashboards
- [ ] Ensure proper empty states on every list page
- [ ] Ensure loading spinners on every async page
- [ ] Ensure error states render gracefully
- [ ] Harden all forms — proper validation (email format, password strength, required fields)
- [ ] Verify every button leads somewhere correct (route-archive re-test)
- [ ] Fix `meals.js` PrismaClient singleton issue

---

#### Phase 53: Launch Checklist

- [ ] Super Admin configuration screens completed
- [ ] Pricing set for all modules
- [ ] Commission set for all modules
- [ ] Support team roles set up
- [ ] Provider onboarding flow working end-to-end
- [ ] Manual dispatch tested and working
- [ ] End-to-end flow tested for each service:
    - [ ] Housing: browse → view → request → approve → complete
    - [ ] Transport: book → dispatch → ride → rate → settle
    - [ ] Delivery: browse → cart → order → track → deliver → rate
    - [ ] Deals: browse → save → redeem → track
    - [ ] Meals: browse → order → deliver → rate
- [ ] All role logins verified
- [ ] Auth middleware blocking unauthenticated access
- [ ] Production environment variables configured
- [ ] Cloudinary configured and tested
- [ ] Database production instance provisioned
- [ ] SSL/HTTPS configured
- [ ] Deployment pipeline working

---

**Main.Task Revision:** v6.0 | **Last Updated:** 2026-03-02 | **Status:** 🟢 CORE BUILT (Phase 1–30) · 🔶 ROADMAP PLANNED (Phase 31–53)
