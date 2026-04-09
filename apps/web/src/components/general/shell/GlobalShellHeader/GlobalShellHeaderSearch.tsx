import React, { useMemo, useState } from "react";
import {
  BaseModalProps,
  buildGameSearchRequestDto,
  GameSearchBar,
  GameSearchViewActions,
  Modal,
  useOnMobile,
  useSearchGames,
  useSearchUsers,
} from "@repo/ui";
import { GlobalShellHeaderSearchContent } from "@/components/general/shell/GlobalShellHeader/GlobalShellHeaderSearchContent";
import { useDebouncedValue } from "@mantine/hooks";
import { ScrollArea, Stack } from "@mantine/core";
import { useTranslation } from "@repo/locales";

interface Props extends BaseModalProps {}

const GlobalShellHeaderSearch = ({ opened, onClose }: Props) => {
  const { t } = useTranslation();
  const onMobile = useOnMobile();
  const [value, setValue] = useState("");
  const [includeExtraContent, setIncludeExtraContent] = useState(false);
  const [debouncedIncludeExtraContent] = useDebouncedValue(
    includeExtraContent,
    400,
  );

  const isQueryEnabled = value != undefined && value.length > 2;

  const searchGamesQuery = useSearchGames(
    {
      ...buildGameSearchRequestDto({
        query: value,
        includeExtraContent: debouncedIncludeExtraContent,
        includeDlcs: debouncedIncludeExtraContent,
      }),
      limit: 10,
    },
    isQueryEnabled,
  );

  const searchUsersQuery = useSearchUsers({
    query: value,
    limit: 10,
  });

  const games = searchGamesQuery.data?.data?.items || [];
  const users = searchUsersQuery.data?.data?.items || [];

  return (
    <Modal
      title={t("shell.search.placeholder")}
      opened={opened}
      onClose={onClose}
      size={"lg"}
      fullScreen={onMobile}
    >
      <Stack className={"w-full h-full gap-4"}>
        <GameSearchBar
          onChange={(v) => {
            setValue(v);
          }}
          withButton={false}
        ></GameSearchBar>
        <GameSearchViewActions
          includeExtraContent={includeExtraContent}
          onExtraContentChange={(v) => {
            setIncludeExtraContent(v);
          }}
        />
        <ScrollArea h={{ base: "80vh", md: "60vh" }}>
          <GlobalShellHeaderSearchContent
            games={games}
            users={users}
            isLoadingGames={
              searchGamesQuery.isLoading || searchGamesQuery.isFetching
            }
          />
        </ScrollArea>
      </Stack>
    </Modal>
  );
};

export { GlobalShellHeaderSearch };
