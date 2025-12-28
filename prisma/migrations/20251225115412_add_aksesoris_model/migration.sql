-- CreateTable
CREATE TABLE `Aksesoris` (
    `id_aksesoris` INTEGER NOT NULL AUTO_INCREMENT,
    `product_name` VARCHAR(191) NOT NULL,
    `product_price` INTEGER NOT NULL,
    `Category` ENUM('STRINGS', 'PICK', 'CAPO', 'TUNER', 'CASE', 'STRAP', 'CABLE', 'AMPLIFIER') NOT NULL,
    `description` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_aksesoris`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
