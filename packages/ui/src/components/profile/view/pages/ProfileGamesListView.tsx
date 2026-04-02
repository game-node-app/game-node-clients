import React from "react";
import { Button, Center, Stack } from "@mantine/core";
import { RecentCollectionEntriesView } from "#@/components";
import { Link } from "#@/util";
import { useTranslation } from "@repo/locales";

interface Props {
  userId: string;
}

const ProfileGamesListView = ({ userId }: Props) => {
  const { t } = useTranslation();
  return (
    <Stack className={"w-full"}>
      <RecentCollectionEntriesView userId={userId} limit={15} />
      <Center>
        <Link href={`/library/${userId}`}>
          <Button>{t("actions.viewMore")}</Button>
        </Link>
      </Center>
    </Stack>
  );
};

export { ProfileGamesListView };
