CREATE TYPE "MeasurementSource" AS ENUM ('stylist', 'client', 'employee', 'legacy');
ALTER TABLE "Measurement"
ADD COLUMN "source" "MeasurementSource" NOT NULL DEFAULT 'legacy',
ADD COLUMN "validatedAt" TIMESTAMP(3),
ADD COLUMN "validatedById" UUID;
