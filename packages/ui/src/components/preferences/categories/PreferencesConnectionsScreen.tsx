import { useAvailableConnections } from "#@/components/connections/hooks/useAvailableConnections";
import { CenteredErrorMessage } from "#@/components/general/CenteredErrorMessage";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { PreferencesConnectionItem } from "#@/components/preferences/handlers/connections/PreferencesConnectionItem";
import { Link } from "#@/util/link";
import { Anchor, Stack } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useMemo } from "react";

const PreferencesConnectionsScreen = () => {
  const { t } = useTranslation();
  const { isLoading, isError, data } = useAvailableConnections();

  const items = useMemo(() => {
    if (data == undefined) {
      return;
    }

    return data.map((item) => {
      return (
        <PreferencesConnectionItem key={item.type.valueOf()} type={item.type} />
      );
    });
  }, [data]);

  return (
    <Stack w={"100%"} className={"items-center mt-4"}>
      <Stack className={"w-full my-4"}>
        {isLoading && <CenteredLoading />}
        {isError && (
          <CenteredErrorMessage
            message={t("preferences.messages.availableConnectionsError")}
          />
        )}
        {items}
        <Anchor component={Link} href="/mcp">
          {t("mcp.title")}
        </Anchor>
      </Stack>
    </Stack>
  );
};

export { PreferencesConnectionsScreen };
