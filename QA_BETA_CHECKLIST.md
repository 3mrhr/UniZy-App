# UniZy Beta QA Checklist

This document provides a systematic, role-based, end-to-end testing flow to verify that UniZy is beta-ready. All critical flows listed here must pass before inviting external beta testers.

## 1. Test Accounts (from Seed Data)

*Password for all accounts:* `unizy2026`

| Role | Name | Email | Persona |
| :--- | :--- | :--- | :--- |
| **Admin** | Super Admin | `admin@unizy.com` | Manages users, roles, and platform settings. |
| **Student** | Student 1 | `student1@unizy.com` | End-user browsing deals, ordering food, requesting housing. |
| **Student** | Student 2 | `student2@unizy.com` | End-user for testing order isolation. |
| **Merchant** | Pizza Palace | `merchant_pizza@unizy.com` | Restaurant owner managing a menu and receiving orders. |
| **Merchant** | UniZy Meals | `merchant_unizy@unizy.com` | Restaurant owner for testing order isolation. |
| **Driver** | Driver 1 | `driver1@unizy.com` | Dispatch rider picking up and delivering orders. |
| **Provider** | Provider 1 | `provider1@unizy.com` | Housing provider managing listings and leads. |

---

## 2. Core End-to-End Flows (Acceptance Tests)

### Flow A: Food Delivery (Student → Merchant → Driver)
1. **[Student]** Log in as `student1@unizy.com`. Navigate to `/delivery`.
2. **[Student]** Select a Merchant (e.g., Pizza Palace), add meals to cart, and checkout.
3. **[Student]** Verify redirection to the live tracking page (`/activity/tracking/[id]`). Status should be `PENDING`.
4. **[Merchant]** In a new incognito window, log in as `merchant_pizza@unizy.com`. Navigate to `/merchant`.
5. **[Merchant]** Verify the order appears in the "New Orders" column.
6. **[Merchant]** Move the order from `PENDING` → `ACCEPTED` → `PREPARING` → `READY`.
7. **[Driver]** In another window, log in as `driver1@unizy.com`. Navigate to `/driver`.
8. **[Driver]** Ensure driver state is "Online". Verify the order appears under "Available Orders".
9. **[Driver]** Click "Accept Job". Verify the order moves to "Active Delivery" and status is `PICKED_UP`.
10. **[Student]** Check tracking page. Status should reflect `Driver on the way` (IN_TRANSIT/PICKED_UP) and show driver details.
11. **[Driver]** Click "Mark Delivered".
12. **[Student]** Check tracking page. Status should be `COMPLETED` and prompt for a rating.

### Flow B: Housing Provider (Provider → Student)
1. **[Provider]** Log in as `provider1@unizy.com`. Navigate to `/provider`. 
2. **[Provider]** Verify previously seeded listings appear under "My Properties".
3. **[Student]** Log in as `student1@unizy.com`. Navigate to `/housing` and find a listing owned by Provider 1.
4. **[Student]** Click "Request Viewing" or submit a lead.
5. **[Provider]** Refresh `/provider`. Verify a new lead appears in the "Recent Leads" section with status `PENDING`.
6. **[Provider]** Accept the lead. Verify the UI updates to `ACCEPTED`.

### Flow C: Admin User Management
1. **[Admin]** Log in as `admin@unizy.com`. Navigate to `/admin/roles`.
2. **[Admin]** Verify the table is populated with real data from the database (not MOCK_USERS).
3. **[Admin]** Use the search bar to find a specific user by email.
4. **[Admin]** Verify role counts match the seed data.

---

## 3. "Unthinkable" Tests (Edge Cases & Security)

### Ownership Enforcement
- **Cross-Merchant Order Manipulation:**
  - *Test:* Log in as `merchant_unizy@unizy.com`. Use an API tool (like Postman or browser console) to attempt to call `updateMerchantOrderStatus` using an `orderId` that belongs to `merchant_pizza@unizy.com`.
  - *Expected Result:* The action must fail with an authorization error (Order does not belong to this merchant).
- **Cross-Driver Order Manipulation:**
  - *Test:* Log in as `driver2@unizy.com`. Attempt to call `updateOrderStatus` for an order already accepted by `driver1`.
  - *Expected Result:* The action must fail with an ownership error.

### State Machine Constraints
- **Skipping States:**
  - *Test:* As a merchant, attempt to mark an order `DELIVERED` directly before it is picked up by a driver.
  - *Expected Result:* Action blocked by state machine rules in `updateMerchantOrderStatus`.
- **Double Acceptance:**
  - *Test:* Two drivers attempt to "Accept" the same `READY` order simultaneously.
  - *Expected Result:* The `updateMany` conditional logic should ensure only the first request succeeds (changes state out of READY and sets driverId). The second driver gets a failure response.

### Missing Data Resiliency
- **Tracking an Invalid Order:**
  - *Test:* Navigate manually to `/activity/tracking/invalid-uuid-1234`.
  - *Expected Result:* The UI safely renders "Order Not Found" rather than crashing with a 500 error.
