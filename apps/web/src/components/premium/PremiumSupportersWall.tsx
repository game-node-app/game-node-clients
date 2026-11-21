import { Avatar, Box, Button, Skeleton, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  getS3StoredUpload,
  useInfiniteSupportersWall,
  useSupporterEntryHref,
} from "@repo/ui";
import type { SupporterWallItemDto } from "@repo/wrapper/server";
import Link from "next/link";
import { useState } from "react";
import {
  getWallColumnStyle,
  WALL_INITIAL_VISIBLE,
  WALL_LIMIT,
  WALL_SKELETONS,
} from "../about/aboutClosingMockData";
import styles from "./PremiumMiddle.module.css";
import premiumStyles from "./Premium.module.css";
import { premiumAsset } from "./premiumAssets";

const RING_CLASSES = [
  styles.wallRing0,
  styles.wallRing1,
  styles.wallRing2,
  styles.wallRing3,
  styles.wallRing4,
  styles.wallRing5,
] as const;

const avatarSrc = (item: SupporterWallItemDto) =>
  item.avatar
    ? getS3StoredUpload(`${item.avatar.filename}.${item.avatar.extension}`)
    : undefined;

const WallCard = ({
  item,
  index,
}: {
  item: SupporterWallItemDto;
  index: number;
}) => {
  const { t } = useTranslation();
  const ringClass = RING_CLASSES[index % RING_CLASSES.length];

  return (
    <Link href={`/profile/${item.userId}`} className={styles.wallCard}>
      <span className={`${styles.wallAvatarRing} ${ringClass}`}>
        <Avatar
          src={avatarSrc(item)}
          alt=""
          size={66}
          radius={33}
          className={styles.wallAvatarImage}
          styles={{ image: { objectFit: "cover" } }}
        />
      </span>
      <span className={styles.wallName}>{item.username}</span>
      <span className={styles.wallPill}>
        <img
          src={premiumAsset("3e23f.svg")}
          width={11}
          height={11}
          alt=""
          loading="lazy"
        />
        {t("premium.wall.pill")}
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
      <span className={styles.wallCtaTitle}>{t("premium.wall.ctaTitle")}</span>
      <span className={styles.wallCtaLink}>{t("premium.wall.ctaLink")}</span>
    </Link>
  );
};

const WallSkeletons = () => (
  <div className={styles.wallGrid} aria-hidden="true">
    {Array.from({ length: WALL_SKELETONS }).map((_, index) => (
      <div
        className={`${styles.wallCard} ${styles.wallSkeleton}`}
        key={`premium-wall-skeleton-${index}`}
      >
        <Skeleton circle height={72} width={72} />
        <Skeleton height={15} width={96} radius="xl" />
        <Skeleton height={20} width={64} radius="sm" />
      </div>
    ))}
  </div>
);

/**
 * Section 10 ("As pessoas que mantêm o GameNode online."): public supporters
 * wall backed by `GET /v1/supporters` via `useInfiniteSupportersWall`, with
 * skeletons, error/retry states, mobile "See more" expansion, pagination, and
 * the closing "Seu nome aqui" CTA card.
 */
const PremiumSupportersWall = () => {
  const { t } = useTranslation();
  const supporterHref = useSupporterEntryHref();
  const wall = useInfiniteSupportersWall({ limit: WALL_LIMIT });
  const [expanded, setExpanded] = useState(false);
  const items = wall.data?.pages.flatMap((page) => page.data) ?? [];
  const visibleItems = items.slice(0, WALL_INITIAL_VISIBLE);
  const extraItems = items.slice(WALL_INITIAL_VISIBLE);
  const titleId = "premium-wall-title";

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
      id="premium-wall-grid"
      className={styles.wallGrid}
      style={getWallColumnStyle(1)}
    >
      <WallCtaCard href={supporterHref} />
    </div>
  ) : (
    <>
      <div
        id="premium-wall-grid"
        className={styles.wallGrid}
        style={getWallColumnStyle(items.length + 1)}
        data-expanded={expanded}
      >
        {visibleItems.map((item, index) => (
          <WallCard item={item} index={index} key={item.userId} />
        ))}
        {extraItems.length > 0 ? (
          <div className={styles.wallRest}>
            {extraItems.map((item, index) => (
              <WallCard
                item={item}
                index={WALL_INITIAL_VISIBLE + index}
                key={item.userId}
              />
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
            aria-controls="premium-wall-grid"
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
    </>
  );

  const hasLoadMore =
    !wall.isLoading && !(wall.isError && items.length === 0) && wall.hasNextPage;

  return (
    <Box
      component="section"
      className={styles.wallSection}
      aria-labelledby={titleId}
    >
      <div className={styles.wallGlow} aria-hidden="true" />
      <div className={`${premiumStyles.container} ${styles.wallContainer}`}>
        <header className={styles.wallHeader}>
          <div className={styles.wallHeaderCopy}>
            <p className={premiumStyles.eyebrow}>{t("premium.wall.eyebrow")}</p>
            <Title order={2} id={titleId} className={styles.wallTitle}>
              {t("premium.wall.title")}
            </Title>
          </div>
          <p className={styles.wallDescription}>
            {t("premium.wall.description")}
          </p>
        </header>

        {body}

        <div className={styles.wallFooter}>
          <p className={styles.wallNote}>{t("premium.wall.note")}</p>
          {hasLoadMore ? (
            <Button
              variant="default"
              className={`${styles.wallLoadMoreButton} ${
                !expanded && items.length > WALL_INITIAL_VISIBLE
                  ? styles.wallLoadMoreCollapsed
                  : ""
              }`}
              loading={wall.isFetchingNextPage}
              onClick={() => void wall.fetchNextPage()}
            >
              {t("supporter.wall.showMore")}
            </Button>
          ) : null}
        </div>
      </div>
    </Box>
  );
};

export { PremiumSupportersWall };
