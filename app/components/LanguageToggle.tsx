import { Button, InlineStack } from "@shopify/polaris";
import { useTranslation, type Locale } from "../i18n/context";

export function LanguageToggle() {
  const { locale, setLocale, t } = useTranslation();

  const handleToggle = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  return (
    <InlineStack gap="100" blockAlign="center">
      <Button
        size="slim"
        variant={locale === "en" ? "primary" : "secondary"}
        onClick={() => handleToggle("en")}
      >
        {t("language.en")}
      </Button>
      <Button
        size="slim"
        variant={locale === "ja" ? "primary" : "secondary"}
        onClick={() => handleToggle("ja")}
      >
        {t("language.ja")}
      </Button>
    </InlineStack>
  );
}
