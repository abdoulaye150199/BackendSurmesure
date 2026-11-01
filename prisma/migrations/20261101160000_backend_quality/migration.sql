ALTER TABLE "User" ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;
CREATE TABLE "ClientNotification" (
  "id" UUID NOT NULL, "clientId" UUID NOT NULL, "orderId" UUID,
  "message" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "readAt" TIMESTAMP(3), CONSTRAINT "ClientNotification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ClientNotification_clientId_createdAt_id_idx" ON "ClientNotification"("clientId", "createdAt" DESC, "id" DESC);
ALTER TABLE "ClientNotification" ADD CONSTRAINT "ClientNotification_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClientNotification" ADD CONSTRAINT "ClientNotification_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- A cancelled appointment must not reserve its old slot.
ALTER TABLE "Appointment" DROP CONSTRAINT IF EXISTS "Appointment_stylistId_startsAt_key";
DROP INDEX IF EXISTS "Appointment_stylistId_startsAt_key";
CREATE UNIQUE INDEX "Appointment_active_slot_key" ON "Appointment"("stylistId", "startsAt") WHERE "status" <> 'cancelled';
