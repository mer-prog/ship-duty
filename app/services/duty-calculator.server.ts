import prisma from "../db.server";

export interface DutyCalculationResult {
  dutyRate: number;
  dutyAmount: number;
  countryCode: string;
  category: string;
}

export async function calculateDuty(
  shop: string,
  countryCode: string,
  productPrice: number,
  category: string = "general",
): Promise<DutyCalculationResult> {
  const dutyRate = await prisma.dutyRate.findUnique({
    where: {
      shop_countryCode_category: { shop, countryCode, category },
    },
  });

  // Fall back to "general" category if specific category not found
  let rate = dutyRate?.rate ?? 0;
  if (!dutyRate && category !== "general") {
    const generalRate = await prisma.dutyRate.findUnique({
      where: {
        shop_countryCode_category: {
          shop,
          countryCode,
          category: "general",
        },
      },
    });
    rate = generalRate?.rate ?? 0;
  }

  return {
    dutyRate: rate,
    dutyAmount: Math.round(productPrice * rate * 100) / 100,
    countryCode,
    category,
  };
}
