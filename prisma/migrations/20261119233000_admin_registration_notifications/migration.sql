CREATE TABLE "AdminRegistrationRead" (
  "adminId" UUID NOT NULL,
  "stylistUserId" UUID NOT NULL,
  "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminRegistrationRead_pkey" PRIMARY KEY ("adminId", "stylistUserId"),
  CONSTRAINT "AdminRegistrationRead_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AdminRegistrationRead_stylistUserId_fkey" FOREIGN KEY ("stylistUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "AdminRegistrationRead_stylistUserId_idx" ON "AdminRegistrationRead"("stylistUserId");
