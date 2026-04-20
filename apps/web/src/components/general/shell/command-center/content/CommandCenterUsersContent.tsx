import { Stack } from "@mantine/core";
import { Spotlight } from "@mantine/spotlight";
import { useSearchUsers } from "@repo/ui";
import React from "react";
import { CommandCenterUserAction } from "../action/CommandCenterUserAction";
import { useTranslation } from "@repo/locales";

interface Props {
  query: string;
  isQueryEnabled: boolean;
}

const CommandCenterUsersContent = ({ query, isQueryEnabled }: Props) => {
  const { t } = useTranslation();

  const usersQuery = useSearchUsers(
    {
      query,
      limit: 10,
    },
    isQueryEnabled,
  );

  const users = usersQuery.data?.data?.items || [];

  if (!isQueryEnabled) {
    return null;
  }

  return (
    <Spotlight.ActionsGroup label="Users">
      <Stack className={"px-4 gap-2 mt-2"}>
        {users.map((user) => (
          <CommandCenterUserAction key={user.userId} userId={user.userId!} />
        ))}

        {isQueryEnabled && !usersQuery.isLoading && users.length === 0 && (
          <Spotlight.Empty>{t("profile.search.noUsersFound")}</Spotlight.Empty>
        )}
      </Stack>
    </Spotlight.ActionsGroup>
  );
};

export { CommandCenterUsersContent };
