import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import {
  AppProvider as PolarisAppProvider,
  Button,
  Card,
  FormLayout,
  Page,
  Text,
  TextField,
  InlineStack,
  Box,
} from "@shopify/polaris";
import polarisTranslations from "@shopify/polaris/locales/en.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { login } from "../../shopify.server";
import { I18nProvider, useTranslation } from "../../i18n/context";
import { LanguageToggle } from "../../components/LanguageToggle";

import { loginErrorMessage } from "./error.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));

  return { errors, polarisTranslations };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));

  return {
    errors,
  };
};

function LoginForm() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [shop, setShop] = useState("");
  const { errors } = actionData || loaderData;
  const { t } = useTranslation();

  return (
    <Page>
      <Box paddingBlockEnd="400">
        <InlineStack align="end">
          <LanguageToggle />
        </InlineStack>
      </Box>
      <Card>
        <Form method="post">
          <FormLayout>
            <Text variant="headingMd" as="h2">
              {t("login.title")}
            </Text>
            <TextField
              type="text"
              name="shop"
              label={t("login.shopDomain")}
              helpText={t("login.shopDomainHint")}
              value={shop}
              onChange={setShop}
              autoComplete="on"
              error={errors.shop}
            />
            <Button submit>{t("login.submit")}</Button>
          </FormLayout>
        </Form>
      </Card>
    </Page>
  );
}

export default function Auth() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <PolarisAppProvider i18n={loaderData.polarisTranslations}>
      <I18nProvider defaultLocale="ja">
        <LoginForm />
      </I18nProvider>
    </PolarisAppProvider>
  );
}
