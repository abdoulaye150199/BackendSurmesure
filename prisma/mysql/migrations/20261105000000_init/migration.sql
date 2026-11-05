-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `role` ENUM('CLIENT', 'STYLIST', 'EMPLOYEE', 'ADMIN') NOT NULL DEFAULT 'CLIENT',
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `refreshTokenHash` VARCHAR(191) NULL,
    `sessionVersion` INTEGER NOT NULL DEFAULT 0,
    `profileImage` VARCHAR(191) NOT NULL DEFAULT '',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `mustChangePassword` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_phone_key`(`phone`),
    INDEX `User_role_active_idx`(`role`, `active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StylistProfile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `businessName` VARCHAR(191) NOT NULL,
    `about` VARCHAR(191) NOT NULL DEFAULT '',
    `specialties` JSON NOT NULL,
    `rating` DECIMAL(2, 1) NOT NULL DEFAULT 0,

    UNIQUE INDEX `StylistProfile_userId_key`(`userId`),
    INDEX `StylistProfile_rating_idx`(`rating`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Personnel` (
    `id` VARCHAR(191) NOT NULL,
    `stylistId` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `specialization` VARCHAR(191) NOT NULL,
    `hireDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `active` BOOLEAN NOT NULL DEFAULT true,
    `userId` VARCHAR(191) NULL,

    UNIQUE INDEX `Personnel_userId_key`(`userId`),
    INDEX `Personnel_stylistId_active_idx`(`stylistId`, `active`),
    UNIQUE INDEX `Personnel_stylistId_email_key`(`stylistId`, `email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Measurement` (
    `id` VARCHAR(191) NOT NULL,
    `stylistId` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NULL,
    `clientConfirmedAt` DATETIME(3) NULL,
    `clientName` VARCHAR(191) NOT NULL,
    `modelName` VARCHAR(191) NULL,
    `modelType` VARCHAR(191) NULL,
    `source` ENUM('stylist', 'client', 'employee', 'legacy') NOT NULL DEFAULT 'legacy',
    `validatedAt` DATETIME(3) NULL,
    `validatedById` VARCHAR(191) NULL,
    `clientPhone` VARCHAR(191) NOT NULL,
    `values` JSON NOT NULL,
    `notes` VARCHAR(191) NOT NULL DEFAULT '',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Measurement_stylistId_createdAt_idx`(`stylistId`, `createdAt` DESC),
    INDEX `Measurement_clientId_createdAt_idx`(`clientId`, `createdAt` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `stylistId` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NULL,
    `clientConfirmedAt` DATETIME(3) NULL,
    `clientName` VARCHAR(191) NOT NULL,
    `clientPhone` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `status` ENUM('pending', 'inProgress', 'completed', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
    `totalPrice` DECIMAL(12, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'XOF',
    `notes` VARCHAR(191) NULL,
    `measurements` JSON NOT NULL,
    `durationDays` INTEGER NULL,
    `dueAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Order_stylistId_status_createdAt_idx`(`stylistId`, `status`, `createdAt` DESC),
    INDEX `Order_clientId_createdAt_idx`(`clientId`, `createdAt` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CatalogItem` (
    `id` VARCHAR(191) NOT NULL,
    `stylistId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL DEFAULT '',
    `imageUrl` VARCHAR(191) NOT NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'XOF',
    `availableColors` JSON NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CatalogItem_active_createdAt_idx`(`active`, `createdAt` DESC),
    INDEX `CatalogItem_stylistId_active_idx`(`stylistId`, `active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CatalogLike` (
    `catalogItemId` VARCHAR(191) NOT NULL,
    `visitorId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`catalogItemId`, `visitorId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Appointment` (
    `id` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `stylistId` VARCHAR(191) NOT NULL,
    `service` VARCHAR(191) NOT NULL,
    `startsAt` DATETIME(3) NOT NULL,
    `status` ENUM('pending', 'confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'pending',
    `activeSlot` DATETIME(3) AS (CASE WHEN `status` <> 'cancelled' THEN `startsAt` ELSE NULL END) STORED,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Appointment_clientId_startsAt_idx`(`clientId`, `startsAt`),
    UNIQUE INDEX `Appointment_stylistId_activeSlot_key`(`stylistId`, `activeSlot`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClientNotification` (
    `id` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NULL,
    `message` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `readAt` DATETIME(3) NULL,

    INDEX `ClientNotification_clientId_createdAt_id_idx`(`clientId`, `createdAt` DESC, `id` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StylistProfile` ADD CONSTRAINT `StylistProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Personnel` ADD CONSTRAINT `Personnel_stylistId_fkey` FOREIGN KEY (`stylistId`) REFERENCES `StylistProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Personnel` ADD CONSTRAINT `Personnel_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Measurement` ADD CONSTRAINT `Measurement_stylistId_fkey` FOREIGN KEY (`stylistId`) REFERENCES `StylistProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Measurement` ADD CONSTRAINT `Measurement_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_stylistId_fkey` FOREIGN KEY (`stylistId`) REFERENCES `StylistProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CatalogItem` ADD CONSTRAINT `CatalogItem_stylistId_fkey` FOREIGN KEY (`stylistId`) REFERENCES `StylistProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CatalogLike` ADD CONSTRAINT `CatalogLike_catalogItemId_fkey` FOREIGN KEY (`catalogItemId`) REFERENCES `CatalogItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_stylistId_fkey` FOREIGN KEY (`stylistId`) REFERENCES `StylistProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientNotification` ADD CONSTRAINT `ClientNotification_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientNotification` ADD CONSTRAINT `ClientNotification_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

