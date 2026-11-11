ALTER TABLE "Order" ADD COLUMN "clientConfirmedAt" TIMESTAMP(3);
ALTER TABLE "Measurement" ADD COLUMN "clientConfirmedAt" TIMESTAMP(3);
-- Client-authored sheets are already tied to their authenticated creator.
-- Legacy staff-entered associations require an explicit atelier confirmation.
UPDATE "Measurement" SET "clientConfirmedAt" = "createdAt" WHERE "source" = 'client' AND "clientId" IS NOT NULL;
