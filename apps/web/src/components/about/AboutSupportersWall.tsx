import { Avatar, Box, Button, Skeleton } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  getS3StoredUpload,
  useInfiniteSupportersWall,
  useSupporterEntryHref,
} from "@repo/ui";
import type { SupporterWallItemDto } from "@repo/wrapper/server";
import Link from "next/link";
import { useState } from "react";
import styles from "./AboutClosing.module.css";
import { aboutAsset } from "./aboutAssets";
import {
  getWallColumnStyle,
  WALL_INITIAL_VISIBLE,
  WALL_LIMIT,
  WALL_SKELETONS,
} from "./aboutClosingMockData";

const avatarSrc = (item: SupporterWallItemDto) =>
  item.avatar
    ? getS3StoredUpload(`${item.avatar.filename}.${item.avatar.extension}`)
    : undefined;

const WallCard = ({ item }: { item: SupporterWallItemDto }) => {
  const { t } = useTranslation();

  return (
    <Link href={`/profile/${item.userId}`} className={styles.wallCard}>
      <span className={styles.wallAvatarRing}>
        <Avatar
          src={avatarSrc(item)}
          alt=""
          size={58}
          radius={29}
          className={styles.wallAvatarImage}
          styles={{ image: { objectFit: "cover" } }}
        />
      </span>
      <span className={styles.wallName}>{item.username}</span>
      <span className={styles.wallPill}>
        <img
          src={aboutAsset("icon-crown-premium.svg")}
          width={11}
          height={11}
          alt=""
          loading="lazy"
        />
        {t("about.wall.pill")}
      </span>
    </Link>
  );
};

const WallCtaCard = ({ href }: { href: string }) => {
  const { t } = useTranslation();

  return (
    <Link href={href} className={styles.wallCta}>
      <span className={styles.wallCtaPlus} aria-hidden="true">
        +
      </span>
      <span className={styles.wallCtaTitle}>
        {t("about.wall.emptyCard.title")}
      </span>
      <span className={styles.wallCtaLink}>
        {t("about.wall.emptyCard.cta")}
      </span>
    </Link>
  );
};

const WallSkeletons = () => (
  <div className={styles.wallGrid} aria-hidden="true">
    {Array.from({ length: WALL_SKELETONS }).map((_, index) => (
      <div
        className={`${styles.wallCard} ${styles.wallSkeleton}`}
        key={`wall-skeleton-${index}`}
      >
        <Skeleton circle height={64} width={64} />
        <Skeleton height={15} width={96} radius="xl" />
        <Skeleton height={20} width={64} radius="sm" />
      </div>
    ))}
  </div>
);

/**
 * Premium supporters wall (design D3). The real public list comes from
 * `GET /v1/supporters`; cards link to each profile and the dashed card closes
 * the grid with the subscription flow. On narrow screens only the first seven
 * supporters and the CTA are shown until "See more" expands the rest.
 */
const AboutSupportersWall = () => {
  const { t } = useTranslation();
  const supporterHref = useSupporterEntryHref();
  const wall = useInfiniteSupportersWall({ limit: WALL_LIMIT });
  const [expanded, setExpanded] = useState(false);
  const items = wall.data?.pages.flatMap((page) => page.data) ?? [];
  const visibleItems = items.slice(0, WALL_INITIAL_VISIBLE);
  const extraItems = items.slice(WALL_INITIAL_VISIBLE);
  const titleId = "about-wall-title";

  const errorState = (
    <div className={styles.wallState} role="alert">
      <p className={styles.wallStateText}>{t("supporter.wall.error")}</p>
      <Button
        variant="default"
        size="sm"
        onClick={() => void wall.refetch()}
      >
        {t("supporter.wall.retry")}
      </Button>
    </div>
  );

  const body = wall.isLoading ? (
    <WallSkeletons />
  ) : wall.isError && items.length === 0 ? (
    errorState
  ) : items.length === 0 ? (
    <div
      id="about-wall-grid"
      className={styles.wallGrid}
      style={getWallColumnStyle(1)}
    >
      <WallCtaCard href={supporterHref} />
    </div>
  ) : (
    <>
      <div
        id="about-wall-grid"
        className={styles.wallGrid}
        style={getWallColumnStyle(items.length + 1)}
        data-expanded={expanded}
      >
        {visibleItems.map((item) => (
          <WallCard item={item} key={item.userId} />
        ))}
        {extraItems.length > 0 ? (
          <div className={styles.wallRest}>
            {extraItems.map((item) => (
              <WallCard item={item} key={item.userId} />
            ))}
          </div>
        ) : null}
        <WallCtaCard href={supporterHref} />
      </div>

      {!expanded && items.length > WALL_INITIAL_VISIBLE ? (
        <div className={styles.wallSeeMoreWrap}>
          <Button
            variant="default"
            className={styles.wallSeeMore}
            onClick={() => setExpanded(true)}
            aria-expanded={false}
            aria-controls="about-wall-grid"
          >
            {t("actions.seeMore")}
          </Button>
        </div>
      ) : null}

      {wall.isError ? (
        <div className={styles.wallInlineError}>
          <p className={styles.wallInlineErrorText}>
            {t("supporter.wall.error")}
          </p>
          <Button
            variant="default"
            size="sm"
            onClick={() => void wall.refetch()}
          >
            {t("supporter.wall.retry")}
          </Button>
        </div>
      ) : null}

      {wall.hasNextPage ? (
        <div
          className={`${styles.wallLoadMore} ${
            !expanded && items.length > WALL_INITIAL_VISIBLE
              ? styles.wallLoadMoreCollapsed
              : ""
          }`}
        >
          <Button
            variant="default"
            radius={8}
            loading={wall.isFetchingNextPage}
            onClick={() => void wall.fetchNextPage()}
          >
            {t("supporter.wall.showMore")}
          </Button>
        </div>
      ) : null}
    </>
  );

  return (
    <Box
      component="section"
      className={styles.wallSection}
      aria-labelledby={titleId}
    >
      <div className={styles.shell}>
        <header className={styles.wallHeader}>
          <div>
            <p className={styles.wallEyebrow}>{t("about.wall.eyebrow")}</p>
            <h2 id={titleId} className={styles.wallTitle}>
              {t("about.wall.title")}
            </h2>
          </div>
          <p className={styles.wallDescription}>
            {t("about.wall.description")}
          </p>
        </header>

        {body}

        <p className={styles.wallNote}>{t("about.wall.note")}</p>
      </div>
    </Box>
  );
};

export { AboutSupportersWall };
