ALTER TYPE "UserRole" ADD VALUE 'EMPLOYEE';

ALTER TABLE "Personnel"
ADD COLUMN "userId" UUID;

CREATE UNIQUE INDEX "Personnel_userId_key" ON "Personnel"("userId");

ALTER TABLE "Personnel"
ADD CONSTRAINT "Personnel_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Measurement"
ALTER COLUMN "clientId" DROP NOT NULL;
