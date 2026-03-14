import prisma from "../db.server";

export interface ShippingCalculationResult {
  shippingRate: number;
  currency: string;
  countryCode: string;
  weightBand: string;
}

export async function calculateShipping(
  shop: string,
  countryCode: string,
  weightGrams: number = 500,
): Promise<ShippingCalculationResult> {
  const shippingRate = await prisma.shippingRate.findFirst({
    where: {
      shop,
      countryCode,
      minWeight: { lte: weightGrams },
      maxWeight: { gte: weightGrams },
    },
  });

  return {
    shippingRate: shippingRate?.rate ?? 0,
    currency: shippingRate?.currency ?? "USD",
    countryCode,
    weightBand: shippingRate
      ? `${shippingRate.minWeight}g - ${shippingRate.maxWeight}g`
      : "N/A",
  };
}
