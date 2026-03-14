import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SHOP = "ryo-dev-plus.myshopify.com";

const dutyRates = [
  { countryCode: "US", category: "general", rate: 0.05 },
  { countryCode: "GB", category: "general", rate: 0.04 },
  { countryCode: "DE", category: "general", rate: 0.04 },
  { countryCode: "FR", category: "general", rate: 0.04 },
  { countryCode: "AU", category: "general", rate: 0.05 },
  { countryCode: "CA", category: "general", rate: 0.05 },
  { countryCode: "KR", category: "general", rate: 0.08 },
  { countryCode: "CN", category: "general", rate: 0.10 },
  { countryCode: "SG", category: "general", rate: 0.00 },
  { countryCode: "TW", category: "general", rate: 0.06 },
];

const shippingRates = [
  // US
  { countryCode: "US", minWeight: 0, maxWeight: 500, rate: 15.0, currency: "USD" },
  { countryCode: "US", minWeight: 501, maxWeight: 1000, rate: 22.0, currency: "USD" },
  { countryCode: "US", minWeight: 1001, maxWeight: 2000, rate: 35.0, currency: "USD" },
  // GB
  { countryCode: "GB", minWeight: 0, maxWeight: 500, rate: 12.0, currency: "USD" },
  { countryCode: "GB", minWeight: 501, maxWeight: 1000, rate: 20.0, currency: "USD" },
  { countryCode: "GB", minWeight: 1001, maxWeight: 2000, rate: 32.0, currency: "USD" },
  // DE
  { countryCode: "DE", minWeight: 0, maxWeight: 500, rate: 13.0, currency: "USD" },
  { countryCode: "DE", minWeight: 501, maxWeight: 1000, rate: 21.0, currency: "USD" },
  { countryCode: "DE", minWeight: 1001, maxWeight: 2000, rate: 33.0, currency: "USD" },
  // FR
  { countryCode: "FR", minWeight: 0, maxWeight: 500, rate: 13.0, currency: "USD" },
  { countryCode: "FR", minWeight: 501, maxWeight: 1000, rate: 21.0, currency: "USD" },
  { countryCode: "FR", minWeight: 1001, maxWeight: 2000, rate: 33.0, currency: "USD" },
  // AU
  { countryCode: "AU", minWeight: 0, maxWeight: 500, rate: 18.0, currency: "USD" },
  { countryCode: "AU", minWeight: 501, maxWeight: 1000, rate: 28.0, currency: "USD" },
  { countryCode: "AU", minWeight: 1001, maxWeight: 2000, rate: 42.0, currency: "USD" },
  // CA
  { countryCode: "CA", minWeight: 0, maxWeight: 500, rate: 14.0, currency: "USD" },
  { countryCode: "CA", minWeight: 501, maxWeight: 1000, rate: 22.0, currency: "USD" },
  { countryCode: "CA", minWeight: 1001, maxWeight: 2000, rate: 34.0, currency: "USD" },
  // KR
  { countryCode: "KR", minWeight: 0, maxWeight: 500, rate: 10.0, currency: "USD" },
  { countryCode: "KR", minWeight: 501, maxWeight: 1000, rate: 16.0, currency: "USD" },
  { countryCode: "KR", minWeight: 1001, maxWeight: 2000, rate: 25.0, currency: "USD" },
  // CN
  { countryCode: "CN", minWeight: 0, maxWeight: 500, rate: 10.0, currency: "USD" },
  { countryCode: "CN", minWeight: 501, maxWeight: 1000, rate: 16.0, currency: "USD" },
  { countryCode: "CN", minWeight: 1001, maxWeight: 2000, rate: 25.0, currency: "USD" },
  // SG
  { countryCode: "SG", minWeight: 0, maxWeight: 500, rate: 12.0, currency: "USD" },
  { countryCode: "SG", minWeight: 501, maxWeight: 1000, rate: 18.0, currency: "USD" },
  { countryCode: "SG", minWeight: 1001, maxWeight: 2000, rate: 28.0, currency: "USD" },
  // TW
  { countryCode: "TW", minWeight: 0, maxWeight: 500, rate: 10.0, currency: "USD" },
  { countryCode: "TW", minWeight: 501, maxWeight: 1000, rate: 16.0, currency: "USD" },
  { countryCode: "TW", minWeight: 1001, maxWeight: 2000, rate: 25.0, currency: "USD" },
];

async function main() {
  console.log("Seeding duty rates...");
  for (const dr of dutyRates) {
    await prisma.dutyRate.upsert({
      where: {
        shop_countryCode_category: {
          shop: SHOP,
          countryCode: dr.countryCode,
          category: dr.category,
        },
      },
      update: { rate: dr.rate },
      create: { shop: SHOP, ...dr },
    });
  }
  console.log(`  ${dutyRates.length} duty rates upserted.`);

  console.log("Seeding shipping rates...");
  for (const sr of shippingRates) {
    await prisma.shippingRate.upsert({
      where: {
        shop_countryCode_minWeight_maxWeight: {
          shop: SHOP,
          countryCode: sr.countryCode,
          minWeight: sr.minWeight,
          maxWeight: sr.maxWeight,
        },
      },
      update: { rate: sr.rate, currency: sr.currency },
      create: { shop: SHOP, ...sr },
    });
  }
  console.log(`  ${shippingRates.length} shipping rates upserted.`);

  console.log("Seeding widget settings...");
  await prisma.widgetSettings.upsert({
    where: { shop: SHOP },
    update: {},
    create: {
      shop: SHOP,
      isActive: true,
      originCountry: "JP",
      defaultCurrency: "JPY",
    },
  });
  console.log("  Widget settings created.");

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
