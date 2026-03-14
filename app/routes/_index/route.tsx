import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import { login } from "../../shopify.server";
import { I18nProvider, useTranslation } from "../../i18n/context";

import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

function IndexContent() {
  const { showForm } = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>{t("index.heading")}</h1>
        <p className={styles.text}>{t("index.tagline")}</p>
        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>{t("index.shopDomain")}</span>
              <input className={styles.input} type="text" name="shop" />
              <span>{t("index.shopDomainHint")}</span>
            </label>
            <button className={styles.button} type="submit">
              {t("index.logIn")}
            </button>
          </Form>
        )}
        <ul className={styles.list}>
          <li>
            <strong>{t("index.feature")}</strong>.{" "}
            {t("index.featureDetail")}
          </li>
          <li>
            <strong>{t("index.feature")}</strong>.{" "}
            {t("index.featureDetail")}
          </li>
          <li>
            <strong>{t("index.feature")}</strong>.{" "}
            {t("index.featureDetail")}
          </li>
        </ul>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider defaultLocale="ja">
      <IndexContent />
    </I18nProvider>
  );
}
