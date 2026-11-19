import { Button } from "@mantine/core";
import { useI18nContext } from "@repo/locales";
import type { UIPresenterRegistry } from "@repo/ui";
import type { ComponentProps } from "react";

export function MobileBlogArticleLanguageLink({
  href: _href,
  locale,
  ...props
}: ComponentProps<UIPresenterRegistry["BlogArticleLanguageLink"]>) {
  const { setLanguage } = useI18nContext();

  return (
    <Button
      {...props}
      type="button"
      lang={locale}
      onClick={() => setLanguage(locale)}
    />
  );
}
