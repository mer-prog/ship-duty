import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { calculateDuty } from "../services/duty-calculator.server";
import { calculateShipping } from "../services/shipping-rates.server";
import prisma from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const body = await request.json();
  const { shop, countryCode, productPrice, weight, category } = body;

  if (!shop || !countryCode || productPrice == null) {
    return json(
      { error: "Missing required fields: shop, countryCode, productPrice" },
      { status: 400 },
    );
  }

  const settings = await prisma.widgetSettings.findUnique({
    where: { shop },
  });

  if (!settings?.isActive) {
    return json({ error: "Widget is disabled for this shop" }, { status: 403 });
  }

  const price = Number(productPrice);
  if (isNaN(price) || price < 0) {
    return json({ error: "Invalid productPrice" }, { status: 400 });
  }

  const duty = await calculateDuty(shop, countryCode, price, category);
  const shipping = await calculateShipping(
    shop,
    countryCode,
    weight ? Number(weight) : 500,
  );

  const totalEstimate =
    Math.round((price + duty.dutyAmount + shipping.shippingRate) * 100) / 100;

  return json(
    {
      productPrice: price,
      duty: {
        rate: duty.dutyRate,
        amount: duty.dutyAmount,
      },
      shipping: {
        rate: shipping.shippingRate,
        currency: shipping.currency,
        weightBand: shipping.weightBand,
      },
      totalEstimate,
      currency: settings.defaultCurrency,
      disclaimer:
        "This is an estimate only. Actual duties and taxes may vary based on customs assessment.",
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    },
  );
};

export const loader = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }
  return json({ error: "Use POST method" }, { status: 405 });
};
