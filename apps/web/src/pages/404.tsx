import { useTranslation } from "@repo/locales";
import { NotFoundView } from "@repo/ui";
import { OpenGraph } from "@/components/general/OpenGraph";

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <OpenGraph title={t("notFoundPage.title")} noIndex />
      <NotFoundView searchHref={"/explore"} />
    </>
  );
};

export default NotFoundPage;
