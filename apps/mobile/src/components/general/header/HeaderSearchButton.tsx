import React from "react";
import { Group, Text } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { IonRippleEffect } from "@ionic/react";
import { Link } from "@repo/ui";

const HeaderSearchButton = () => {
  return (
    <Link href={"/search"}>
      <Group className={"gap-1 p-3 relative ion-activatable"}>
        <IonRippleEffect className={"rounded-xl"} />
        <IconSearch strokeWidth={3} size={24} className={"text-dimmed"} />
        <Text className={"text-sm text-dimmed font-medium"}>Search</Text>
      </Group>
    </Link>
  );
};

export { HeaderSearchButton };
