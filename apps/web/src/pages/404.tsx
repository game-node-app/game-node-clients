import { Button } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { ErrorState } from "@repo/ui";
import { IconCompass, IconHome } from "@tabler/icons-react";
import Link from "next/link";

export default function Page() {
  const { t } = useTranslation();

  return (
    <ErrorState
      className={"min-h-[70vh] justify-center"}
      code={"404"}
      color={"brand"}
      titleOrder={1}
      title={t("errors.pageNotFoundTitle")}
      description={t("errors.pageNotFound")}
      actions={
        <>
          <Button
            component={Link}
            href={"/home"}
            leftSection={<IconHome size={18} />}
          >
            {t("actions.backHome")}
          </Button>
          <Button
            component={Link}
            href={"/explore"}
            variant={"default"}
            leftSection={<IconCompass size={18} />}
          >
            {t("navigation.explore")}
          </Button>
        </>
      }
    />
  );
}
