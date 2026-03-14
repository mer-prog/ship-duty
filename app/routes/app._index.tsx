import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Select,
  Badge,
  Button,
  InlineStack,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { useTranslation } from "../i18n/context";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  let settings = await prisma.widgetSettings.findUnique({ where: { shop } });
  if (!settings) {
    settings = await prisma.widgetSettings.create({
      data: { shop },
    });
  }

  return json({ settings });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();

  const isActive = formData.get("isActive") === "true";
  const originCountry = (formData.get("originCountry") as string) || "JP";
  const defaultCurrency = (formData.get("defaultCurrency") as string) || "JPY";

  const settings = await prisma.widgetSettings.upsert({
    where: { shop },
    update: { isActive, originCountry, defaultCurrency },
    create: { shop, isActive, originCountry, defaultCurrency },
  });

  return json({ settings });
};

const COUNTRY_CODES = ["JP", "US", "GB", "DE", "FR", "AU", "CA", "KR", "CN", "SG", "TW"];

const CURRENCIES = [
  { label: "JPY", value: "JPY" },
  { label: "USD", value: "USD" },
  { label: "EUR", value: "EUR" },
  { label: "GBP", value: "GBP" },
  { label: "AUD", value: "AUD" },
  { label: "CAD", value: "CAD" },
  { label: "KRW", value: "KRW" },
  { label: "CNY", value: "CNY" },
  { label: "SGD", value: "SGD" },
  { label: "TWD", value: "TWD" },
];

export default function SettingsPage() {
  const { settings } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const { t } = useTranslation();

  const [isActive, setIsActive] = useState(settings.isActive);
  const [originCountry, setOriginCountry] = useState(settings.originCountry);
  const [defaultCurrency, setDefaultCurrency] = useState(
    settings.defaultCurrency,
  );

  const countryOptions = COUNTRY_CODES.map((code) => ({
    label: t(`countries.${code}`),
    value: code,
  }));

  const handleSave = () => {
    const formData = new FormData();
    formData.set("isActive", String(isActive));
    formData.set("originCountry", originCountry);
    formData.set("defaultCurrency", defaultCurrency);
    submit(formData, { method: "post" });
  };

  const toggleActive = () => {
    setIsActive(!isActive);
  };

  return (
    <Page>
      <TitleBar title={t("settings.title")} />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">
                    {t("settings.widgetStatus")}
                  </Text>
                  <Badge tone={isActive ? "success" : "critical"}>
                    {isActive ? t("settings.active") : t("settings.inactive")}
                  </Badge>
                </InlineStack>
                <Button onClick={toggleActive}>
                  {isActive
                    ? t("settings.disableWidget")
                    : t("settings.enableWidget")}
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  {t("settings.basicSettings")}
                </Text>
                <Select
                  label={t("settings.originCountry")}
                  options={countryOptions}
                  value={originCountry}
                  onChange={setOriginCountry}
                />
                <Select
                  label={t("settings.defaultCurrency")}
                  options={CURRENCIES}
                  value={defaultCurrency}
                  onChange={setDefaultCurrency}
                />
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section>
            <InlineStack align="end">
              <Button variant="primary" onClick={handleSave}>
                {t("settings.saveSettings")}
              </Button>
            </InlineStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
