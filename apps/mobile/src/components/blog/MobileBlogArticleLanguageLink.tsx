import { useI18nContext } from "@repo/locales";
import type { UIPresenterRegistry } from "@repo/ui";
import type { ComponentProps } from "react";

export function MobileBlogArticleLanguageLink({
  locale,
  render,
}: ComponentProps<UIPresenterRegistry["BlogArticleLanguageLink"]>) {
  const { setLanguage } = useI18nContext();

  return render({
    component: "button",
    type: "button",
    lang: locale,
    onClick: () => setLanguage(locale),
  });
}
