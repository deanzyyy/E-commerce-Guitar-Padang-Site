-- CreateTable
CREATE TABLE `Order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` VARCHAR(191) NOT NULL,
    `gross_amount` INTEGER NOT NULL,
    `transaction_status` ENUM('PENDING', 'PAID', 'FAILED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    `payment_type` VARCHAR(191) NULL,
    `fraud_status` VARCHAR(191) NULL,
    `paid_at` DATETIME(3) NULL,
    `recipient_name` VARCHAR(191) NOT NULL,
    `recipient_phone` VARCHAR(191) NOT NULL,
    `shipping_address` VARCHAR(191) NOT NULL,
    `payment_method` VARCHAR(191) NOT NULL,
    `items` JSON NOT NULL,
    `subtotal` INTEGER NOT NULL,
    `shipping_cost` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Order_order_id_key`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
