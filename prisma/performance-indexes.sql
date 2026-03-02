-- UniZy Performance Indexes
-- Add indexes on frequently queried columns for performance optimization.
-- Run this SQL against the production PostgreSQL database.

-- ============================================================
-- 1. User lookups
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_user_role ON "User" (role);
CREATE INDEX IF NOT EXISTS idx_user_email ON "User" (email);
CREATE INDEX IF NOT EXISTS idx_user_phone ON "User" (phone);
CREATE INDEX IF NOT EXISTS idx_user_university ON "User" ("universityId");

-- ============================================================
-- 2. Order queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_order_userId ON "Order" ("userId");
CREATE INDEX IF NOT EXISTS idx_order_driverId ON "Order" ("driverId");
CREATE INDEX IF NOT EXISTS idx_order_status ON "Order" (status);
CREATE INDEX IF NOT EXISTS idx_order_service ON "Order" (service);
CREATE INDEX IF NOT EXISTS idx_order_created ON "Order" ("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_order_user_status ON "Order" ("userId", status);

-- ============================================================
-- 3. Transaction queries (financial reporting)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_txn_userId ON "Transaction" ("userId");
CREATE INDEX IF NOT EXISTS idx_txn_providerId ON "Transaction" ("providerId");
CREATE INDEX IF NOT EXISTS idx_txn_status ON "Transaction" (status);
CREATE INDEX IF NOT EXISTS idx_txn_type ON "Transaction" (type);
CREATE INDEX IF NOT EXISTS idx_txn_created ON "Transaction" ("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_txn_type_status ON "Transaction" (type, status);

-- ============================================================
-- 4. Payment queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_payment_txnId ON "Payment" ("transactionId");
CREATE INDEX IF NOT EXISTS idx_payment_status ON "Payment" (status);
CREATE INDEX IF NOT EXISTS idx_payment_idempotency ON "Payment" ("idempotencyKey");

-- ============================================================
-- 5. Support ticket queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_ticket_userId ON "SupportTicket" ("userId");
CREATE INDEX IF NOT EXISTS idx_ticket_status ON "SupportTicket" (status);
CREATE INDEX IF NOT EXISTS idx_ticket_agentId ON "SupportTicket" ("assignedAgentId");

-- ============================================================
-- 6. Housing listing queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_housing_status ON "HousingListing" (status);
CREATE INDEX IF NOT EXISTS idx_housing_providerId ON "HousingListing" ("providerId");
CREATE INDEX IF NOT EXISTS idx_housing_price ON "HousingListing" (price);

-- ============================================================
-- 7. Settlement queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_settlement_providerId ON "Settlement" ("providerId");
CREATE INDEX IF NOT EXISTS idx_settlement_status ON "Settlement" (status);
CREATE INDEX IF NOT EXISTS idx_settlement_period ON "Settlement" ("periodStart", "periodEnd");

-- ============================================================
-- 8. Reward transaction queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_reward_userId ON "RewardTransaction" ("userId");
CREATE INDEX IF NOT EXISTS idx_reward_type ON "RewardTransaction" (type);
CREATE INDEX IF NOT EXISTS idx_reward_txnId ON "RewardTransaction" ("transactionId");
CREATE INDEX IF NOT EXISTS idx_reward_expiry ON "RewardTransaction" ("expiresAt") WHERE expired = false;

-- ============================================================
-- 9. Wallet queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_wallet_userId ON "Wallet" ("userId");
CREATE INDEX IF NOT EXISTS idx_wallet_txn_walletId ON "WalletTransaction" ("walletId");

-- ============================================================
-- 10. Notification queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_notification_userId ON "Notification" ("userId");
CREATE INDEX IF NOT EXISTS idx_notification_read ON "Notification" ("userId", "isRead");

-- ============================================================
-- 11. Review queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_review_targetId ON "Review" ("targetId");
CREATE INDEX IF NOT EXISTS idx_review_userId ON "Review" ("userId");

-- ============================================================
-- 12. SLA Breach queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_slabreach_status ON "SLABreach" (status);
CREATE INDEX IF NOT EXISTS idx_slabreach_ruleId ON "SLABreach" ("ruleId");

-- ============================================================
-- 13. Driver Zone queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_driverzone_zoneId ON "DriverZone" ("zoneId");
CREATE INDEX IF NOT EXISTS idx_driverzone_driverId ON "DriverZone" ("driverId");

-- ============================================================
-- 14. Audit log queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_auditlog_action ON "AuditLog" (action);
CREATE INDEX IF NOT EXISTS idx_auditlog_created ON "AuditLog" ("createdAt" DESC);
