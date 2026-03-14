import { Link } from "@remix-run/react";
import { NavMenu } from "@shopify/app-bridge-react";
import { useTranslation } from "../i18n/context";

export function AppNavMenu() {
  const { t } = useTranslation();

  return (
    <NavMenu>
      <Link to="/app" rel="home">
        {t("nav.settings")}
      </Link>
      <Link to="/app/rates">{t("nav.rates")}</Link>
    </NavMenu>
  );
}
