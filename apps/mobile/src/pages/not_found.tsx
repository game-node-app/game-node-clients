import { AppPage } from "@/components/general/AppPage.tsx";
import { useTranslation } from "@repo/locales";
import { NotFoundView } from "@repo/ui";

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <AppPage title={t("notFoundPage.title")} withSearch={false}>
      {/* Mobile links are tab-relative (see getTabAwareHref). */}
      <NotFoundView homeHref={"/"} searchHref={"/search"} />
    </AppPage>
  );
};

export default NotFoundPage;
