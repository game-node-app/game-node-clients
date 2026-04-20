import { CommandCenterGamesContent } from "@/components/general/shell/command-center/content/CommandCenterGamesContent";
import { Code, Flex, Text } from "@mantine/core";
import { Spotlight } from "@mantine/spotlight";
import { useOnMobile, useUserId } from "@repo/ui";
import { IconSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { CommandCenterUsersContent } from "./content/CommandCenterUsersContent";
import { useDebouncedValue } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";

const CommandCenter = () => {
  const { t } = useTranslation();
  const [modifierKey, setModifierKey] = useState("Ctrl");

  const [query, setQuery] = useState("");
  const onMobile = useOnMobile();

  const [debouncedQuery] = useDebouncedValue(query, 400);

  const isQueryEnabled = query != undefined && query.length > 2;

  useEffect(() => {
    const modifierKey =
      navigator.platform.startsWith("Mac") || navigator.platform === "iPhone"
        ? "⌘" // command key
        : "Ctrl"; // control key

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModifierKey(modifierKey);
  }, []);
  return (
    <Spotlight.Root zIndex={200}>
      <Spotlight.Search
        placeholder="Search for games or users..."
        value={query}
        leftSection={<IconSearch />}
        onChange={(evt) => setQuery(evt.target.value)}
      />

      {!onMobile && (
        <Flex className={"px-4 mb-2"}>
          <Text className={"text-xs text-dimmed"}>
            {t("actions.use")} <Code>{modifierKey} + K</Code>{" "}
            {t("actions.toOpenDialogAnytime")}
          </Text>
        </Flex>
      )}
      <Spotlight.ActionsList>
        {!isQueryEnabled && (
          <Spotlight.Empty>
            {t("game.search.startTypingResults")}
          </Spotlight.Empty>
        )}
        <CommandCenterGamesContent
          query={debouncedQuery}
          isQueryEnabled={isQueryEnabled}
        />
        <CommandCenterUsersContent
          query={debouncedQuery}
          isQueryEnabled={isQueryEnabled}
        />
      </Spotlight.ActionsList>
    </Spotlight.Root>
  );
};

export { CommandCenter };
