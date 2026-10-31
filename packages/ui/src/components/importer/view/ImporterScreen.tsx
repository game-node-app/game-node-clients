import {
  CenteredErrorMessage,
  GameSelectView,
  ImporterCollectionSelect,
  useImporterEntries,
  useOwnUserConnectionByType,
  useUserId,
} from "#@/components";
import { getErrorMessage, getPageAsOffset, getServerStoredIcon } from "#@/util";
import {
  Box,
  Button,
  Flex,
  Group,
  Image,
  Modal,
  Select,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";
import {
  Game,
  ImporterBatchImportRequestDto,
  ImporterBatchStatusRequestDto,
  ImporterService,
} from "@repo/wrapper/server";
import { IconCheck, IconExclamationCircle } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

const DEFAULT_LIMIT = 20;

const VALID_SOURCES = ["steam", "psn", "xbox"] as const;
type ImporterSource = (typeof VALID_SOURCES)[number];

interface Props {
  source: string;
}

const ImporterScreen = ({ source }: Props) => {
  const { t } = useTranslation();
  const userId = useUserId();
  const queryClient = useQueryClient();

  // Normalize / validate source
  const isValidSource = VALID_SOURCES.includes(source as ImporterSource);
  const normalizedSource = source as ImporterSource;
  const sourceName = source
    ? source.charAt(0).toUpperCase() + source.slice(1)
    : "";

  // Local state
  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>(
    [],
  );
  const [initialStatus, setInitialStatus] =
    useState<ImporterBatchImportRequestDto.status>(
      ImporterBatchImportRequestDto.status.PLANNED,
    );
  // Map of externalGameId -> gameId
  const [selectedMap, setSelectedMap] = useState<Record<number, number>>({});
  const [isConfirmImportAllOpen, setIsConfirmImportAllOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset when source changes
  useEffect(() => {
    setPage(1);
    setSearchQuery(undefined);
    setSelectedMap({});
    setSelectedCollectionIds([]);
    setInitialStatus(ImporterBatchImportRequestDto.status.PLANNED);
    setIsConfirmImportAllOpen(false);
  }, [source]);

  // Queries
  const importerEntriesQuery = useImporterEntries({
    source,
    excludeInLibrary: true,
    limit: DEFAULT_LIMIT,
    offset: getPageAsOffset(page, DEFAULT_LIMIT),
    search: searchQuery,
  });

  const connectionQuery = useOwnUserConnectionByType(
    normalizedSource as import("@repo/wrapper/server").ConnectionCreateDto.type,
  );

  // Visible games deduplicated by game.id
  const visibleGames = useMemo(() => {
    if (!importerEntriesQuery.data?.data) return [];
    const seen = new Set<number>();
    const games: Game[] = [];
    for (const entry of importerEntriesQuery.data.data) {
      if (entry.game && !seen.has(entry.game.id)) {
        seen.add(entry.game.id);
        games.push(entry.game);
      }
    }
    return games;
  }, [importerEntriesQuery.data?.data]);

  const currentEntries = importerEntriesQuery.data?.data || [];
  const visibleExternalIds = useMemo(
    () => importerEntriesQuery.data?.data.map((entry) => entry.id) ?? [],
    [importerEntriesQuery.data?.data],
  );

  // Total count for Import All
  const totalUnfiltered = useMemo(() => {
    if (
      !searchQuery &&
      importerEntriesQuery.data?.pagination?.totalItems != null
    ) {
      return importerEntriesQuery.data.pagination.totalItems;
    }
    return connectionQuery.data?.unprocessedCount;
  }, [
    searchQuery,
    importerEntriesQuery.data?.pagination?.totalItems,
    connectionQuery.data?.unprocessedCount,
  ]);

  const selectedCount = Object.keys(selectedMap).length;

  const isAllGamesSelected =
    visibleExternalIds.length > 0 &&
    visibleExternalIds.every((id) => selectedMap[id] !== undefined);

  // Selection handlers
  const handleSelection = (gameId: number) => {
    if (isProcessing) return;
    const matchingEntries = currentEntries.filter(
      (e) => (e.gameId || e.game?.id) === gameId,
    );
    if (matchingEntries.length === 0) return;

    const allSelected = matchingEntries.every(
      (e) => selectedMap[e.id] !== undefined,
    );

    setSelectedMap((prev) => {
      const next = { ...prev };
      if (allSelected) {
        matchingEntries.forEach((e) => {
          delete next[e.id];
        });
      } else {
        matchingEntries.forEach((e) => {
          next[e.id] = e.gameId || e.game?.id || gameId;
        });
      }
      return next;
    });
  };

  const handleSelectPage = () => {
    if (isProcessing || visibleExternalIds.length === 0) return;

    setSelectedMap((prev) => {
      const next = { ...prev };
      if (isAllGamesSelected) {
        // Subtract visible items
        visibleExternalIds.forEach((id) => {
          delete next[id];
        });
      } else {
        // Union visible items
        currentEntries.forEach((e) => {
          next[e.id] = e.gameId || e.game?.id;
        });
      }
      return next;
    });
  };

  const clearSelection = () => {
    if (isProcessing) return;
    setSelectedMap({});
  };

  const checkIsSelected = (gameId: number) => {
    const matchingEntries = currentEntries.filter(
      (e) => (e.gameId || e.game?.id) === gameId,
    );
    if (matchingEntries.length > 0) {
      return matchingEntries.every((e) => selectedMap[e.id] !== undefined);
    }
    return Object.values(selectedMap).includes(gameId);
  };

  const buildLoadingSkeletons = useCallback(() => {
    return new Array(10)
      .fill(0)
      .map((_, i) => <Skeleton key={i} className={"w-full h-48 mt-4"} />);
  }, []);

  const invalidateCaches = () => {
    queryClient.invalidateQueries({ queryKey: ["importer", "entries"] });
    queryClient.invalidateQueries({ queryKey: ["connections", "own"] });
    queryClient.invalidateQueries({ queryKey: ["collection-entries"] });
  };

  // Actions
  const handleImportSelected = async () => {
    const externalGameIds = Object.keys(selectedMap).map(Number);
    if (externalGameIds.length === 0 || isProcessing) return;

    setIsProcessing(true);
    const notifId = notifications.show({
      loading: true,
      message: t("importer.messages.applyingChanges"),
      autoClose: false,
      withCloseButton: false,
    });

    try {
      const result = await ImporterService.importerControllerImportBatchV1(
        normalizedSource,
        {
          externalGameIds,
          status: initialStatus,
          collectionIds: selectedCollectionIds,
        },
      );

      const message =
        result.importedCount === 0 && result.skippedCount === 0
          ? t("importer.messages.importAllZero")
          : result.skippedCount > 0
            ? t("importer.messages.importBatchSuccessWithSkipped", {
                importedCount: result.importedCount,
                skippedCount: result.skippedCount,
              })
            : t("importer.messages.importBatchSuccess", {
                importedCount: result.importedCount,
              });

      notifications.update({
        id: notifId,
        color: "green",
        message,
        title: t("notifications.titles.changesApplied"),
        icon: <IconCheck size={18} />,
        loading: false,
        autoClose: 4000,
        withCloseButton: true,
      });

      clearSelection();
      setPage(1);
      invalidateCaches();
    } catch (err: unknown) {
      notifications.update({
        id: notifId,
        color: "red",
        title: t("importer.messages.syncFailed"),
        message: getErrorMessage(err) || t("importer.messages.importFailed"),
        loading: false,
        autoClose: 10000,
        withCloseButton: true,
        icon: <IconExclamationCircle size={18} />,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportAll = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    const notifId = notifications.show({
      loading: true,
      message: t("importer.messages.applyingChanges"),
      autoClose: false,
      withCloseButton: false,
    });

    try {
      const result = await ImporterService.importerControllerImportBatchV1(
        normalizedSource,
        {
          importAll: true,
          status: initialStatus,
          collectionIds: selectedCollectionIds,
        },
      );

      const message =
        result.importedCount === 0 && result.skippedCount === 0
          ? t("importer.messages.importAllZero")
          : result.skippedCount > 0
            ? t("importer.messages.importBatchSuccessWithSkipped", {
                importedCount: result.importedCount,
                skippedCount: result.skippedCount,
              })
            : t("importer.messages.importBatchSuccess", {
                importedCount: result.importedCount,
              });

      notifications.update({
        id: notifId,
        color: "green",
        message,
        title: t("notifications.titles.changesApplied"),
        icon: <IconCheck size={18} />,
        loading: false,
        autoClose: 4000,
        withCloseButton: true,
      });

      setIsConfirmImportAllOpen(false);
      clearSelection();
      setPage(1);
      invalidateCaches();
    } catch (err: unknown) {
      notifications.update({
        id: notifId,
        color: "red",
        title: t("importer.messages.syncFailed"),
        message: getErrorMessage(err) || t("importer.messages.importFailed"),
        loading: false,
        autoClose: 10000,
        withCloseButton: true,
        icon: <IconExclamationCircle size={18} />,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleIgnoreSelected = async () => {
    const externalGameIds = Object.keys(selectedMap).map(Number);
    if (externalGameIds.length === 0 || isProcessing) return;

    setIsProcessing(true);
    const notifId = notifications.show({
      loading: true,
      message: t("importer.messages.applyingChanges"),
      autoClose: false,
      withCloseButton: false,
    });

    try {
      await ImporterService.importerControllerChangeStatusBatchV1({
        source: normalizedSource as ImporterBatchStatusRequestDto.source,
        externalGameIds,
        status: ImporterBatchStatusRequestDto.status.IGNORED,
      });

      notifications.update({
        id: notifId,
        color: "green",
        message: t("importer.messages.ignoreSuccess", {
          count: externalGameIds.length,
        }),
        title: t("notifications.titles.changesApplied"),
        icon: <IconCheck size={18} />,
        loading: false,
        autoClose: 4000,
        withCloseButton: true,
      });

      clearSelection();
      setPage(1);
      invalidateCaches();
    } catch (err: unknown) {
      notifications.update({
        id: notifId,
        color: "red",
        title: t("importer.messages.syncFailed"),
        message: getErrorMessage(err) || t("importer.messages.ignoreFailed"),
        loading: false,
        autoClose: 10000,
        withCloseButton: true,
        icon: <IconExclamationCircle size={18} />,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Status options for Select
  const statusOptions = [
    {
      value: ImporterBatchImportRequestDto.status.PLANNED,
      label: t("collectionEntry.statuses.planned"),
    },
    {
      value: ImporterBatchImportRequestDto.status.PLAYING,
      label: t("collectionEntry.statuses.playing"),
    },
    {
      value: ImporterBatchImportRequestDto.status.FINISHED,
      label: t("collectionEntry.statuses.finished"),
    },
    {
      value: ImporterBatchImportRequestDto.status.ONGOING,
      label: t("collectionEntry.statuses.ongoing"),
    },
    {
      value: ImporterBatchImportRequestDto.status.DROPPED,
      label: t("collectionEntry.statuses.dropped"),
    },
  ];

  if (!isValidSource) {
    return (
      <CenteredErrorMessage message={`Invalid importer source: ${source}`} />
    );
  }

  const isLoading = importerEntriesQuery.isLoading;
  const isEntriesError = importerEntriesQuery.isError;
  const isConnectionError = connectionQuery.isError;
  const isEmpty =
    !isLoading &&
    !isEntriesError &&
    (importerEntriesQuery.data == null ||
      importerEntriesQuery.data.data.length === 0);

  return (
    <Flex justify={"center"} p={0} wrap={"wrap"}>
      <Box className={"w-full flex flex-col p-4"}>
        <Group className={"w-full border-[#302D2D] border-2 py-2 px-4"}>
          <Group className={"w-full lg:w-6/12 flex-nowrap"}>
            <Image src={getServerStoredIcon(source)} w={48} h={48} />
            <Stack gap={4}>
              <Title size={"h4"}>{t("importer.title")}</Title>
              <Text>{t("importer.description")}</Text>
            </Stack>
          </Group>

          <Stack className={"w-full lg:ms-auto lg:w-5/12"} gap={"xs"}>
            <Select
              label={t("importer.status.initialStatus")}
              description={t("importer.status.initialStatusHint")}
              data={statusOptions}
              value={initialStatus}
              onChange={(val) => {
                if (val)
                  setInitialStatus(val as ImporterBatchImportRequestDto.status);
              }}
              disabled={isProcessing}
            />

            <ImporterCollectionSelect
              userId={userId}
              onChange={(values) => setSelectedCollectionIds(values)}
              description={t("importer.collectionsHint")}
            />
          </Stack>

          <Group justify="center" w="100%" mt="xs" gap="sm">
            <Button
              type="button"
              disabled={selectedCount === 0 || isProcessing}
              loading={isProcessing}
              onClick={handleImportSelected}
              aria-label={t("importer.buttons.importSelected")}
            >
              {t("importer.buttons.importSelected")}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isProcessing}
              onClick={() => setIsConfirmImportAllOpen(true)}
              aria-label={
                totalUnfiltered != null
                  ? t("importer.buttons.importAllCount", {
                      count: totalUnfiltered,
                    })
                  : t("importer.buttons.importAll")
              }
            >
              {totalUnfiltered != null
                ? t("importer.buttons.importAllCount", {
                    count: totalUnfiltered,
                  })
                : t("importer.buttons.importAll")}
            </Button>
          </Group>
        </Group>

        <Stack className={"mt-4 w-full grow"}>
          {isEntriesError && (
            <CenteredErrorMessage
              message={getErrorMessage(importerEntriesQuery.error)}
            />
          )}
          {isConnectionError && (
            <CenteredErrorMessage
              message={getErrorMessage(connectionQuery.error)}
            />
          )}

          {/* Search bar is ALWAYS accessible */}
          <Group className={"items-end"}>
            <GameSelectView.Actions
              isAllGamesSelected={isAllGamesSelected}
              onSelectAll={handleSelectPage}
            />
            <GameSelectView.SearchBar
              onSearch={(query) => {
                setPage(1);
                setSearchQuery(query);
              }}
              onClear={() => {
                setPage(1);
                setSearchQuery(undefined);
              }}
            />
          </Group>

          {isEmpty && (
            <Stack align="center" justify="center" py="xl">
              {searchQuery ? (
                <CenteredErrorMessage
                  message={t("importer.emptyStates.searchEmpty")}
                />
              ) : connectionQuery.data?.lastSyncedAt ? (
                <>
                  <CenteredErrorMessage
                    message={t("importer.emptyStates.allDone")}
                  />
                  <Text c="dimmed" size="sm" ta="center">
                    {t("importer.emptyStates.privacyTip")}
                  </Text>
                </>
              ) : (
                <>
                  <CenteredErrorMessage
                    message={t("importer.emptyStates.firstSync")}
                  />
                  <Text c="dimmed" size="sm" ta="center">
                    {t("importer.emptyStates.privacyTip")}
                  </Text>
                </>
              )}
            </Stack>
          )}

          {!isEmpty && (
            <GameSelectView>
              <GameSelectView.Content
                items={visibleGames}
                checkIsSelected={checkIsSelected}
                onSelected={handleSelection}
                excludeItemsInLibrary={false}
              >
                {isLoading && buildLoadingSkeletons()}
              </GameSelectView.Content>

              <Box className={"mt-auto"}>
                <GameSelectView.Pagination
                  paginationInfo={importerEntriesQuery.data?.pagination}
                  page={page}
                  onPaginationChange={(selectedPage) => {
                    setPage(selectedPage);
                  }}
                />
              </Box>
            </GameSelectView>
          )}
        </Stack>

        {/* Sticky Action Bar (Task 3.6) */}
        {selectedCount > 0 && (
          <Box
            role="region"
            aria-label={t("importer.selection.actionsAriaLabel")}
            className={
              "sticky bottom-0 z-10 w-full bg-[#1A1A1A] border-t border-[#302D2D] p-3 shadow-lg pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]"
            }
          >
            <Group justify="space-between" align="center" wrap="wrap" gap="sm">
              <Text fw={500} aria-live="polite">
                {t("importer.selection.selectedCount", {
                  count: selectedCount,
                })}
              </Text>
              <Group gap="xs">
                <Button
                  variant="subtle"
                  color="gray"
                  onClick={clearSelection}
                  disabled={isProcessing}
                  aria-label={t("importer.buttons.clearSelection")}
                >
                  {t("importer.buttons.clearSelection")}
                </Button>
                <Button
                  variant="default"
                  color="red"
                  onClick={handleIgnoreSelected}
                  loading={isProcessing}
                  disabled={isProcessing}
                  aria-label={t("importer.buttons.ignoreSelected")}
                >
                  {t("importer.buttons.ignoreSelected")}
                </Button>
                <Button
                  onClick={handleImportSelected}
                  loading={isProcessing}
                  disabled={isProcessing}
                  aria-label={t("importer.buttons.importSelected")}
                >
                  {t("importer.buttons.importSelected")}
                </Button>
              </Group>
            </Group>
          </Box>
        )}

        {/* Import All Confirmation Modal (Task 3.2) */}
        <Modal
          opened={isConfirmImportAllOpen}
          onClose={() => !isProcessing && setIsConfirmImportAllOpen(false)}
          title={t("importer.confirmImportAll.title")}
          centered
        >
          <Stack gap="md">
            <Text>
              {totalUnfiltered != null
                ? t("importer.confirmImportAll.message", {
                    count: totalUnfiltered,
                    source: sourceName,
                  })
                : t("importer.confirmImportAll.messageUnknownCount", {
                    source: sourceName,
                  })}
            </Text>
            <Text size="sm" c="dimmed">
              {t("importer.confirmImportAll.scopeWarning")}
            </Text>
            <Group gap="xs">
              <Text fw={500}>{t("importer.confirmImportAll.statusLabel")}</Text>
              <Text>
                {statusOptions.find((s) => s.value === initialStatus)?.label}
              </Text>
            </Group>
            <Group gap="xs">
              <Text fw={500}>
                {t("importer.confirmImportAll.collectionsLabel")}
              </Text>
              <Text>
                {selectedCollectionIds.length > 0
                  ? `${selectedCollectionIds.length} selected`
                  : t("importer.confirmImportAll.none")}
              </Text>
            </Group>
            <Group justify="flex-end" mt="md">
              <Button
                variant="subtle"
                onClick={() => setIsConfirmImportAllOpen(false)}
                disabled={isProcessing}
              >
                {t("importer.buttons.cancel")}
              </Button>
              <Button
                onClick={handleImportAll}
                loading={isProcessing}
                disabled={isProcessing}
              >
                {t("importer.buttons.confirm")}
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Box>
    </Flex>
  );
};

export { ImporterScreen };
