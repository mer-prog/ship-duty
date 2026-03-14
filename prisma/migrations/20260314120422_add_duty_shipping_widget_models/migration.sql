-- CreateTable
CREATE TABLE "DutyRate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "rate" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "ShippingRate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "minWeight" INTEGER NOT NULL,
    "maxWeight" INTEGER NOT NULL,
    "rate" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD'
);

-- CreateTable
CREATE TABLE "WidgetSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "originCountry" TEXT NOT NULL DEFAULT 'JP',
    "defaultCurrency" TEXT NOT NULL DEFAULT 'JPY'
);

-- CreateIndex
CREATE UNIQUE INDEX "DutyRate_shop_countryCode_category_key" ON "DutyRate"("shop", "countryCode", "category");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingRate_shop_countryCode_minWeight_maxWeight_key" ON "ShippingRate"("shop", "countryCode", "minWeight", "maxWeight");

-- CreateIndex
CREATE UNIQUE INDEX "WidgetSettings_shop_key" ON "WidgetSettings"("shop");
