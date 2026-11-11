import Head from "next/head";
import { useTranslation } from "@repo/locales";
import { NotFoundView } from "@repo/ui";

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t("notFoundPage.title")}</title>
      </Head>
      <NotFoundView searchHref={"/explore"} />
    </>
  );
};

export default NotFoundPage;
