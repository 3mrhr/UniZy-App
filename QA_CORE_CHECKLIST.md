# QA Core Verification Checklist

This checklist verifies the "Product Spine" of UniZy, ensuring the highest leverage flows operate correctly with database-backed data, secure ownership enforcement, and real entity boundaries intact.

## Prerequisites
- Run `npx prisma db push`
- Run `npm run seed` or `node prisma/seed.mjs`
- Use password `Test1234!` for all accounts.

---

## The 10 Essential Click Paths

### 1. Delivery Flow — Student Browsing
- [ ] Log in as `student1@unizy.app`. Navigate to `/delivery`.
- [ ] Verify the list of merchants is populated from the database.
- [ ] Click a merchant to enter the detail page.

### 2. Delivery Flow — Student Cart
- [ ] On the merchant detail page, tap the `+` button on at least two meals.
- [ ] Verify the bottom sliding cart summaries update correctly.

### 3. Delivery Flow — Checkout & Tracking
- [ ] Tap `Checkout`.
- [ ] Verify you are redirected to `/activity/tracking/[id]`.
- [ ] Note the status is `PENDING`.

### 4. Merchant Dashboard — New Orders
- [ ] Open an incognito window and log in as `merchant1@unizy.app`.
- [ ] Navigate to `/merchant`.
- [ ] Verify the Student's order appears in the "New Orders" Kanban column.

### 5. Merchant Dashboard — Status Updates
- [ ] On the same active order, click `Accept`. Verify the order moves columns.
- [ ] Continue clicking the next-action button until the order is `READY`.

### 6. Driver Flow — Available Orders
- [ ] Open another incognito window and log in as `driver1@unizy.app`.
- [ ] Navigate to `/driver`. Click `Go Online`.
- [ ] Verify the `READY` order from step 5 appears under "Available for Pickup".

### 7. Driver Flow — Order Acceptance
- [ ] Click `🚀 Accept & Pick Up` on the order.
- [ ] Ensure the order moves to "Active Delivery" and status is `PICKED_UP`.
- [ ] Verify the student's screen updates to `Driver on the way`.

### 8. Driver Flow — Order Delivery
- [ ] On the driver screen, click `✅ Mark as Delivered`.
- [ ] The order should disappear from active orders and appear under "Delivered Today".
- [ ] Verify the student's screen shows `COMPLETED`.

### 9. Provider Hub — Housing Management
- [ ] Log in as `provider1@unizy.app`. Navigate to `/provider`.
- [ ] Verify the seeded property listings are visible.
- [ ] Check if 'Recent Leads' correctly isolates leads for this provider's listings.

### 10. Admin Portal — Entity Lists
- [ ] Log in as `admin@unizy.app`. Navigate to `/admin/roles`.
- [ ] Verify the user list displays exactly the users generated from the seed (Students, Merchants, Drivers, Providers).

---

## Strict Ownership Verification (Must Not Fail)

- **Merchant Isolation**: `merchant2@unizy.app` must not see orders placed for `merchant1@unizy.app`.
- **Driver Claiming**: Two drivers cannot accept the same `READY` order simultaneously (race condition prevented by conditional DB update).
- **Update Authorization**: A driver cannot call `updateOrderStatus` on an order claimed by another driver.
