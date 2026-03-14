import { useCallback, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  TextField,
  Button,
  InlineStack,
  IndexTable,
  Select,
  Banner,
  Modal,
  FormLayout,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { useTranslation } from "../i18n/context";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const dutyRates = await prisma.dutyRate.findMany({
    where: { shop },
    orderBy: [{ countryCode: "asc" }, { category: "asc" }],
  });

  const shippingRates = await prisma.shippingRate.findMany({
    where: { shop },
    orderBy: [{ countryCode: "asc" }, { minWeight: "asc" }],
  });

  return json({ dutyRates, shippingRates });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "upsertDutyRate") {
    const countryCode = formData.get("countryCode") as string;
    const category = (formData.get("category") as string) || "general";
    const rate = parseFloat(formData.get("rate") as string);

    await prisma.dutyRate.upsert({
      where: { shop_countryCode_category: { shop, countryCode, category } },
      update: { rate },
      create: { shop, countryCode, category, rate },
    });
  }

  if (intent === "deleteDutyRate") {
    const id = formData.get("id") as string;
    await prisma.dutyRate.delete({ where: { id } });
  }

  if (intent === "upsertShippingRate") {
    const countryCode = formData.get("countryCode") as string;
    const minWeight = parseInt(formData.get("minWeight") as string, 10);
    const maxWeight = parseInt(formData.get("maxWeight") as string, 10);
    const rate = parseFloat(formData.get("rate") as string);
    const currency = (formData.get("currency") as string) || "USD";

    await prisma.shippingRate.upsert({
      where: {
        shop_countryCode_minWeight_maxWeight: {
          shop,
          countryCode,
          minWeight,
          maxWeight,
        },
      },
      update: { rate, currency },
      create: { shop, countryCode, minWeight, maxWeight, rate, currency },
    });
  }

  if (intent === "deleteShippingRate") {
    const id = formData.get("id") as string;
    await prisma.shippingRate.delete({ where: { id } });
  }

  return json({ success: true });
};

const COUNTRY_OPTIONS = [
  { label: "US", value: "US" },
  { label: "GB", value: "GB" },
  { label: "DE", value: "DE" },
  { label: "FR", value: "FR" },
  { label: "AU", value: "AU" },
  { label: "CA", value: "CA" },
  { label: "KR", value: "KR" },
  { label: "CN", value: "CN" },
  { label: "SG", value: "SG" },
  { label: "TW", value: "TW" },
];

export default function RatesPage() {
  const { dutyRates, shippingRates } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const { t } = useTranslation();

  // Duty Rate modal state
  const [dutyModalOpen, setDutyModalOpen] = useState(false);
  const [dutyCountry, setDutyCountry] = useState("US");
  const [dutyCategory, setDutyCategory] = useState("general");
  const [dutyRateValue, setDutyRateValue] = useState("0.05");

  // Shipping Rate modal state
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [shippingCountry, setShippingCountry] = useState("US");
  const [shippingMinWeight, setShippingMinWeight] = useState("0");
  const [shippingMaxWeight, setShippingMaxWeight] = useState("500");
  const [shippingRateValue, setShippingRateValue] = useState("15.00");
  const [shippingCurrency, setShippingCurrency] = useState("USD");

  const handleAddDutyRate = useCallback(() => {
    const formData = new FormData();
    formData.set("intent", "upsertDutyRate");
    formData.set("countryCode", dutyCountry);
    formData.set("category", dutyCategory);
    formData.set("rate", dutyRateValue);
    submit(formData, { method: "post" });
    setDutyModalOpen(false);
  }, [submit, dutyCountry, dutyCategory, dutyRateValue]);

  const handleDeleteDutyRate = useCallback(
    (id: string) => {
      const formData = new FormData();
      formData.set("intent", "deleteDutyRate");
      formData.set("id", id);
      submit(formData, { method: "post" });
    },
    [submit],
  );

  const handleAddShippingRate = useCallback(() => {
    const formData = new FormData();
    formData.set("intent", "upsertShippingRate");
    formData.set("countryCode", shippingCountry);
    formData.set("minWeight", shippingMinWeight);
    formData.set("maxWeight", shippingMaxWeight);
    formData.set("rate", shippingRateValue);
    formData.set("currency", shippingCurrency);
    submit(formData, { method: "post" });
    setShippingModalOpen(false);
  }, [
    submit,
    shippingCountry,
    shippingMinWeight,
    shippingMaxWeight,
    shippingRateValue,
    shippingCurrency,
  ]);

  const handleDeleteShippingRate = useCallback(
    (id: string) => {
      const formData = new FormData();
      formData.set("intent", "deleteShippingRate");
      formData.set("id", id);
      submit(formData, { method: "post" });
    },
    [submit],
  );

  const dutyRowMarkup = dutyRates.map(
    (
      {
        id,
        countryCode,
        category,
        rate,
      }: { id: string; countryCode: string; category: string; rate: number },
      index: number,
    ) => (
      <IndexTable.Row id={id} key={id} position={index}>
        <IndexTable.Cell>{countryCode}</IndexTable.Cell>
        <IndexTable.Cell>{category}</IndexTable.Cell>
        <IndexTable.Cell>{(rate * 100).toFixed(1)}%</IndexTable.Cell>
        <IndexTable.Cell>
          <Button
            variant="plain"
            tone="critical"
            onClick={() => handleDeleteDutyRate(id)}
          >
            {t("rates.delete")}
          </Button>
        </IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  const shippingRowMarkup = shippingRates.map(
    (
      {
        id,
        countryCode,
        minWeight,
        maxWeight,
        rate,
        currency,
      }: {
        id: string;
        countryCode: string;
        minWeight: number;
        maxWeight: number;
        rate: number;
        currency: string;
      },
      index: number,
    ) => (
      <IndexTable.Row id={id} key={id} position={index}>
        <IndexTable.Cell>{countryCode}</IndexTable.Cell>
        <IndexTable.Cell>
          {minWeight}g - {maxWeight}g
        </IndexTable.Cell>
        <IndexTable.Cell>
          {currency} {rate.toFixed(2)}
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Button
            variant="plain"
            tone="critical"
            onClick={() => handleDeleteShippingRate(id)}
          >
            {t("rates.delete")}
          </Button>
        </IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  return (
    <Page>
      <TitleBar title={t("rates.title")} />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">
                    {t("rates.dutyRates")}
                  </Text>
                  <Button onClick={() => setDutyModalOpen(true)}>
                    {t("rates.addDutyRate")}
                  </Button>
                </InlineStack>
                {dutyRates.length === 0 ? (
                  <Banner tone="info">
                    <p>{t("rates.noDutyRates")}</p>
                  </Banner>
                ) : (
                  <IndexTable
                    itemCount={dutyRates.length}
                    headings={[
                      { title: t("rates.country") },
                      { title: t("rates.category") },
                      { title: t("rates.rate") },
                      { title: t("rates.actions") },
                    ]}
                    selectable={false}
                  >
                    {dutyRowMarkup}
                  </IndexTable>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">
                    {t("rates.shippingRates")}
                  </Text>
                  <Button onClick={() => setShippingModalOpen(true)}>
                    {t("rates.addShippingRate")}
                  </Button>
                </InlineStack>
                {shippingRates.length === 0 ? (
                  <Banner tone="info">
                    <p>{t("rates.noShippingRates")}</p>
                  </Banner>
                ) : (
                  <IndexTable
                    itemCount={shippingRates.length}
                    headings={[
                      { title: t("rates.country") },
                      { title: t("rates.weightBand") },
                      { title: t("rates.rate") },
                      { title: t("rates.actions") },
                    ]}
                    selectable={false}
                  >
                    {shippingRowMarkup}
                  </IndexTable>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>

      <Modal
        open={dutyModalOpen}
        onClose={() => setDutyModalOpen(false)}
        title={t("rates.addDutyRate")}
        primaryAction={{ content: t("rates.save"), onAction: handleAddDutyRate }}
        secondaryActions={[
          { content: t("rates.cancel"), onAction: () => setDutyModalOpen(false) },
        ]}
      >
        <Modal.Section>
          <FormLayout>
            <Select
              label={t("rates.country")}
              options={COUNTRY_OPTIONS}
              value={dutyCountry}
              onChange={setDutyCountry}
            />
            <TextField
              label={t("rates.category")}
              value={dutyCategory}
              onChange={setDutyCategory}
              autoComplete="off"
            />
            <TextField
              label={t("rates.dutyRateLabel")}
              type="number"
              value={dutyRateValue}
              onChange={setDutyRateValue}
              autoComplete="off"
            />
          </FormLayout>
        </Modal.Section>
      </Modal>

      <Modal
        open={shippingModalOpen}
        onClose={() => setShippingModalOpen(false)}
        title={t("rates.addShippingRate")}
        primaryAction={{
          content: t("rates.save"),
          onAction: handleAddShippingRate,
        }}
        secondaryActions={[
          {
            content: t("rates.cancel"),
            onAction: () => setShippingModalOpen(false),
          },
        ]}
      >
        <Modal.Section>
          <FormLayout>
            <Select
              label={t("rates.country")}
              options={COUNTRY_OPTIONS}
              value={shippingCountry}
              onChange={setShippingCountry}
            />
            <TextField
              label={t("rates.minWeight")}
              type="number"
              value={shippingMinWeight}
              onChange={setShippingMinWeight}
              autoComplete="off"
            />
            <TextField
              label={t("rates.maxWeight")}
              type="number"
              value={shippingMaxWeight}
              onChange={setShippingMaxWeight}
              autoComplete="off"
            />
            <TextField
              label={t("rates.rate")}
              type="number"
              value={shippingRateValue}
              onChange={setShippingRateValue}
              autoComplete="off"
            />
            <TextField
              label={t("rates.currency")}
              value={shippingCurrency}
              onChange={setShippingCurrency}
              autoComplete="off"
            />
          </FormLayout>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
