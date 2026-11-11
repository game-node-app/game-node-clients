import { Box, Button, Group, Skeleton, Stack, Text } from "@mantine/core";
import { IconCrown } from "@tabler/icons-react";
import { useTranslation } from "@repo/locales";
import { SettingsCard } from "#@/components/settings/common/SettingsCard";
import { SettingsSection } from "#@/components/settings/common/SettingsSection";
import { Link, cn } from "#@/util";
import { useInfiniteSupportersWall } from "../hooks/useInfiniteSupportersWall";
import { useSupporterEntryHref } from "../util/useSupporterEntryHref";
import { useSupporterSettingsHref } from "../util/useSupporterSettingsHref";
import { SupportersWallItem } from "./SupportersWallItem";

const PAGE_LIMIT = 48;
const SETTINGS_LIMIT = 24;
const PAGE_SKELETONS = 12;
const SETTINGS_SKELETONS = 8;

export interface SupportersWallProps {
  /** `page` is the web About section; `settings` is the compact mobile card. */
  variant: "page" | "settings";
}

/**
 * Public list of supporters from `GET /v1/supporters` (design D11). Shows the
 * server's order, offers "Show more" while it reports a next page, and keeps
 * the rest of the page usable when the request fails.
 */
export function SupportersWall({ variant }: SupportersWallProps) {
  const { t } = useTranslation();
  const isPage = variant === "page";
  const limit = isPage ? PAGE_LIMIT : SETTINGS_LIMIT;
  // Both hooks run unconditionally. The web page keeps the sign-in redirect
  // for signed-out visitors; the settings variant must use the app-registered
  // route, since mobile's LinkWrapper prefixes the current tab onto any href.
  const entryHref = useSupporterEntryHref();
  const settingsHref = useSupporterSettingsHref();
  const supporterHref = isPage ? entryHref : settingsHref;
  const wall = useInfiniteSupportersWall({ limit });
  const items = wall.data?.pages.flatMap((page) => page.data) ?? [];

  const gridClassName = isPage
    ? "mt-12 grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-x-4 gap-y-6"
    : "grid grid-cols-4 gap-3";

  const loadingState = (
    <Box
      data-testid={"supporters-wall-loading"}
      className={gridClassName}
      aria-hidden
    >
      {Array.from({ length: isPage ? PAGE_SKELETONS : SETTINGS_SKELETONS }).map(
        (_, index) => (
          <Stack key={index} align={"center"} gap={8} className={"min-w-0"}>
            <Skeleton
              circle
              height={isPage ? 72 : 48}
              width={isPage ? 72 : 48}
            />
          </Stack>
        ),
      )}
    </Box>
  );

  const emptyState = (
    <Stack
      align={"center"}
      gap={8}
      data-testid={"supporters-wall-empty"}
      className={cn("text-center", isPage ? "mt-12" : "py-4")}
    >
      <Box
        className={
          "flex shrink-0 items-center justify-center rounded-[10px] bg-[rgba(151,71,255,0.16)]"
        }
        style={{ width: isPage ? 44 : 36, height: isPage ? 44 : 36 }}
      >
        <IconCrown
          size={isPage ? 22 : 18}
          className={"text-[#c7a6ff]"}
          aria-hidden
        />
      </Box>
      <Text fz={isPage ? 16 : 14} fw={600} lh={"normal"} c={"white"}>
        {t("supporter.wall.empty.title")}
      </Text>
      <Text fz={13} lh={"normal"} className={"text-[#adadad]"}>
        {t("supporter.wall.empty.description")}
      </Text>
      <Button
        component={Link}
        href={supporterHref}
        color={"brand"}
        size={isPage ? "sm" : "xs"}
        className={"mt-1"}
      >
        {t("supporter.wall.empty.cta")}
      </Button>
    </Stack>
  );

  const errorState = (
    <Group
      gap={12}
      justify={"center"}
      data-testid={"supporters-wall-error"}
      className={cn(isPage ? "mt-12" : "py-4")}
    >
      <Text fz={13} lh={"normal"} className={"text-[#adadad]"}>
        {t("supporter.wall.error")}
      </Text>
      <Button
        variant={"default"}
        size={isPage ? "sm" : "xs"}
        onClick={() => void wall.refetch()}
      >
        {t("supporter.wall.retry")}
      </Button>
    </Group>
  );

  const showMore = (
    <Group justify={"center"} className={cn(isPage ? "mt-12" : "mt-4")}>
      <Button
        variant={"default"}
        radius={"xl"}
        size={isPage ? "md" : "xs"}
        loading={wall.isFetchingNextPage}
        onClick={() => void wall.fetchNextPage()}
      >
        {t("supporter.wall.showMore")}
      </Button>
    </Group>
  );

  const body = wall.isLoading ? (
    loadingState
  ) : wall.isError && items.length === 0 ? (
    errorState
  ) : items.length === 0 ? (
    emptyState
  ) : (
    <>
      <Box className={gridClassName}>
        {items.map((item) => (
          <SupportersWallItem key={item.userId} item={item} variant={variant} />
        ))}
      </Box>
      {wall.isError ? errorState : wall.hasNextPage ? showMore : null}
    </>
  );

  if (!isPage) {
    return (
      <SettingsSection
        title={t("supporter.wall.title")}
        description={t("supporter.wall.description")}
      >
        <SettingsCard withDividers={false} className={"p-4"}>
          {body}
        </SettingsCard>
      </SettingsSection>
    );
  }

  return (
    <Box
      component={"section"}
      id={"supporters"}
      className={"w-full bg-[#101010] px-4 py-24"}
    >
      <Box className={"mx-auto w-full max-w-[1100px]"}>
        <Box className={"text-center"}>
          <h2 className={"m-0 font-bold text-4xl sm:text-5xl"}>
            {t("supporter.wall.title")}
          </h2>
          <Text
            component={"p"}
            className={"mt-2 font-light text-base text-[#adadad] sm:text-xl"}
          >
            {t("supporter.wall.description")}
          </Text>
        </Box>
        {body}
      </Box>
    </Box>
  );
}
