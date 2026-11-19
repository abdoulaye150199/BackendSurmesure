CREATE TYPE "SubscriptionPlan" AS ENUM ('ESSENTIEL', 'ATELIER', 'STUDIO');
CREATE TYPE "ApprovalStatus" AS ENUM ('pending', 'approved');

ALTER TABLE "User"
  ADD COLUMN "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'approved',
  ADD COLUMN "requestedPlan" "SubscriptionPlan",
  ADD COLUMN "subscriptionPlan" "SubscriptionPlan",
  ADD COLUMN "approvedAt" TIMESTAMP(3),
  ADD COLUMN "approvedById" UUID;

-- Existing ateliers retain their current tools. New registrations have no assigned plan.
UPDATE "User" SET "subscriptionPlan" = 'STUDIO' WHERE "role" = 'STYLIST';
CREATE INDEX "User_approvalStatus_createdAt_idx" ON "User"("approvalStatus", "createdAt" DESC);
