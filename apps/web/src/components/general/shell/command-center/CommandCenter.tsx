import { CommandCenterGamesContent } from "@/components/general/shell/command-center/content/CommandCenterGamesContent";
import { Code, Flex, Text } from "@mantine/core";
import { Spotlight } from "@mantine/spotlight";
import { useOnMobile, useUserId } from "@repo/ui";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";

const CommandCenter = () => {
  const modifierKey =
    navigator.platform.startsWith("Mac") || navigator.platform === "iPhone"
      ? "⌘" // command key
      : "Ctrl"; // control key
  const [query, setQuery] = useState("");
  const onMobile = useOnMobile();

  return (
    <Spotlight.Root keepMounted={true} zIndex={200}>
      <Spotlight.Search
        placeholder="Search for games or users..."
        value={query}
        leftSection={<IconSearch />}
        onChange={(evt) => setQuery(evt.target.value)}
      />

      {!onMobile && (
        <Flex className={"px-4 mb-2"}>
          <Text className={"text-xs text-dimmed"}>
            Use <Code>{modifierKey} + K</Code> to open this dialog anytime.
          </Text>
        </Flex>
      )}
      <Spotlight.ActionsList>
        <CommandCenterGamesContent query={query} />
      </Spotlight.ActionsList>
    </Spotlight.Root>
  );
};

export { CommandCenter };
