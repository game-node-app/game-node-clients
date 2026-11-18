import { IonRippleEffect } from "@ionic/react";
import { Group } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { Link } from "@repo/ui";
import { IconSearch } from "@tabler/icons-react";

const HeaderSearchButton = () => {
  const { t } = useTranslation();
  return (
    <Link href={"/search"}>
      <Group className={"gap-1 p-3 relative ion-activatable"}>
        <IonRippleEffect className={"rounded-xl"} />
        <IconSearch
          strokeWidth={3}
          size={24}
          className={"text-dimmed"}
          aria-label={t("common.search")}
        />
      </Group>
    </Link>
  );
};

export { HeaderSearchButton };