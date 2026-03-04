-- UniZy Row-Level Security (RLS) Policies
-- Applied to PostgreSQL tables to enforce data isolation at the database layer.
--
-- IMPORTANT: Prisma connects via the DB owner role, which bypasses RLS by default.
-- To enforce RLS even for the owner, we use FORCE ROW LEVEL SECURITY.
-- 
-- These policies ensure that even if application code has a bug (e.g., missing userId filter),
-- users can only access their own data.

-- ============================================================
-- 1. Enable RLS on key tables
-- ============================================================

ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" FORCE ROW LEVEL SECURITY;

ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" FORCE ROW LEVEL SECURITY;

ALTER TABLE "SupportTicket" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SupportTicket" FORCE ROW LEVEL SECURITY;

ALTER TABLE "SavedHousing" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SavedHousing" FORCE ROW LEVEL SECURITY;

ALTER TABLE "SavedDeal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SavedDeal" FORCE ROW LEVEL SECURITY;

ALTER TABLE "Report" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Report" FORCE ROW LEVEL SECURITY;

-- ============================================================
-- 2. Create application role for Prisma (if not using superuser)
-- ============================================================
-- In production, Prisma should connect as a non-superuser role
-- that has RLS enforced. Example:
--
-- CREATE ROLE unizy_app LOGIN PASSWORD 'secure_password';
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO unizy_app;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO unizy_app;

-- ============================================================
-- 3. Policies for Order table
-- ============================================================

-- Students can only see their own orders
CREATE POLICY order_student_isolation ON "Order"
    FOR ALL
    USING ("userId" = current_setting('app.current_user_id', true)::text)
    WITH CHECK ("userId" = current_setting('app.current_user_id', true)::text);

-- Drivers can see orders assigned to them
CREATE POLICY order_driver_access ON "Order"
    FOR SELECT
    USING (
        "driverId" = current_setting('app.current_user_id', true)::text
    );

-- Admins can see all orders
CREATE POLICY order_admin_access ON "Order"
    FOR ALL
    USING (current_setting('app.current_user_role', true) LIKE 'ADMIN%');

-- ============================================================
-- 4. Policies for Transaction table
-- ============================================================

CREATE POLICY txn_user_isolation ON "Transaction"
    FOR ALL
    USING ("userId" = current_setting('app.current_user_id', true)::text)
    WITH CHECK ("userId" = current_setting('app.current_user_id', true)::text);

-- Providers can see transactions where they are the provider
CREATE POLICY txn_provider_access ON "Transaction"
    FOR SELECT
    USING ("providerId" = current_setting('app.current_user_id', true)::text);

CREATE POLICY txn_admin_access ON "Transaction"
    FOR ALL
    USING (current_setting('app.current_user_role', true) LIKE 'ADMIN%');

-- ============================================================
-- 5. Policies for SupportTicket table
-- ============================================================

CREATE POLICY ticket_user_isolation ON "SupportTicket"
    FOR ALL
    USING ("userId" = current_setting('app.current_user_id', true)::text)
    WITH CHECK ("userId" = current_setting('app.current_user_id', true)::text);

-- Support agents can see tickets assigned to them
CREATE POLICY ticket_agent_access ON "SupportTicket"
    FOR ALL
    USING ("assignedAgentId" = current_setting('app.current_user_id', true)::text);

CREATE POLICY ticket_admin_access ON "SupportTicket"
    FOR ALL
    USING (current_setting('app.current_user_role', true) LIKE 'ADMIN%'
        OR current_setting('app.current_user_role', true) = 'SUPPORT');

-- ============================================================
-- 6. Policies for SavedHousing table
-- ============================================================

CREATE POLICY saved_housing_isolation ON "SavedHousing"
    FOR ALL
    USING ("userId" = current_setting('app.current_user_id', true)::text)
    WITH CHECK ("userId" = current_setting('app.current_user_id', true)::text);

-- ============================================================
-- 7. Policies for SavedDeal table
-- ============================================================

CREATE POLICY saved_deal_isolation ON "SavedDeal"
    FOR ALL
    USING ("userId" = current_setting('app.current_user_id', true)::text)
    WITH CHECK ("userId" = current_setting('app.current_user_id', true)::text);

-- ============================================================
-- 8. Policies for Report table
-- ============================================================

-- Reporters can see their own reports
CREATE POLICY report_reporter_isolation ON "Report"
    FOR ALL
    USING ("reporterId" = current_setting('app.current_user_id', true)::text)
    WITH CHECK ("reporterId" = current_setting('app.current_user_id', true)::text);

CREATE POLICY report_admin_access ON "Report"
    FOR ALL
    USING (current_setting('app.current_user_role', true) LIKE 'ADMIN%');
