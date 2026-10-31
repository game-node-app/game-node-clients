import { IonRippleEffect } from "@ionic/react";
import { Group, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { Link } from "@repo/ui";
import { IconSearch } from "@tabler/icons-react";

const HeaderSearchButton = () => {
  const { t } = useTranslation();
  return (
    <Link href={"/search"}>
      <Group className={"gap-1 p-3 relative ion-activatable"}>
        <IonRippleEffect className={"rounded-xl"} />
        <IconSearch strokeWidth={3} size={24} className={"text-dimmed"} />
        <Text className={"text-sm text-dimmed font-medium"}>
          {t("common.search")}
        </Text>
      </Group>
    </Link>
  );
};

export { HeaderSearchButton };