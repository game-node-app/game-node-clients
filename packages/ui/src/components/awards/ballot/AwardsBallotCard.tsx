import { AWARDS_BALLOT_FONT_FAMILY } from "#@/components/awards/ballot/AwardsBallotFonts";
import { isGlobalGOTYCategory } from "#@/components/awards/util/goty";
import {
  GAME_COVER_PLACEHOLDER,
  useGameCoverImage,
} from "#@/components/game/hooks/useGameCoverImage";
import { ImageSize } from "#@/components/game/util/getSizedImageUrl";
import { useTranslation } from "@repo/locales";
import type { Game } from "@repo/wrapper/server";
import { useLayoutEffect, useRef, useState } from "react";

export interface AwardsBallotCardCategory {
  id: number;
  name: string;
  voteGameId: number | null;
  isGOTY?: boolean;
}

export interface AwardsBallotCardProps {
  eventYear: number;
  username?: string;
  categories: readonly AwardsBallotCardCategory[];
  totalCategories: number;
  gamesById: ReadonlyMap<number, Game>;
}

/** "Koei Tecmo · PS5, PC": developer (or publisher) and up to three platform abbreviations. */
export function getBallotGameMetadata(
  game: Game | undefined | null,
): string | null {
  if (!game) {
    return null;
  }

  const company =
    game.involvedCompanies?.find((involved) => involved.developer)?.company
      ?.name ??
    game.involvedCompanies?.find((involved) => involved.publisher)?.company
      ?.name;

  const platforms = (game.platforms ?? [])
    .slice(0, 3)
    .map((platform) => platform.abbreviation || platform.name)
    .filter((platform): platform is string => !!platform)
    .join(", ");

  const parts = [company, platforms].filter((part): part is string => !!part);

  return parts.length > 0 ? parts.join(" · ") : null;
}

function BallotCardCover({
  game,
  width,
  height,
  radius,
  backgroundColor,
}: {
  game: Game | undefined;
  width: number;
  height: number;
  radius: number;
  backgroundColor: string;
}) {
  const { src, onError } = useGameCoverImage(game, ImageSize.COVER_BIG_2X);

  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        overflow: "hidden",
        flexShrink: 0,
        backgroundColor,
      }}
    >
      <img
        src={src ?? GAME_COVER_PLACEHOLDER}
        alt={game?.name ?? ""}
        onError={onError}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    </div>
  );
}

const CARD_HEIGHT = 1920;
const CARD_PADDING_TOP = 80;
const CARD_PADDING_BOTTOM = 72;
const CARD_GAP = 44;
/** Height of the "N categories left" block in the Figma (node 5579:21733). */
const REMAINING_BLOCK_HEIGHT = 171;

/**
 * Native 1080×1920 Awards ballot share card matching the Figma design
 * (`node 5579:21617` / `5579:21691`). Rendered at native size inside
 * `RecapCardPreview` so the exported PNG is pixel-identical regardless of
 * screen size.
 */
export function AwardsBallotCard({
  eventYear,
  username,
  categories,
  totalCategories,
  gamesById,
}: AwardsBallotCardProps) {
  const { t } = useTranslation();
  const upperRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [remainingFits, setRemainingFits] = useState(true);

  const votedCategories = categories.filter(
    (category): category is AwardsBallotCardCategory & { voteGameId: number } =>
      category.voteGameId != null,
  );
  const gotyCategory = votedCategories.find((category) =>
    isGlobalGOTYCategory(category),
  );
  const gridCategories = gotyCategory
    ? votedCategories.filter((category) => category.id !== gotyCategory.id)
    : votedCategories;

  const votedCount = votedCategories.length;
  const totalCount = totalCategories > 0 ? totalCategories : categories.length;
  const remainingCount = Math.max(0, totalCount - votedCount);

  const gotyGame = gotyCategory
    ? gamesById.get(gotyCategory.voteGameId)
    : undefined;
  const gotyMetadata = getBallotGameMetadata(gotyGame);
  const showRemaining = remainingCount > 0 && remainingFits;

  // The card is a fixed 1080x1920 image. A near-complete partial ballot (many
  // rows plus the "N categories left" block) can be taller than the frame;
  // the footer pill already shows the count, so drop the block instead of
  // pushing the footer past the bottom padding.
  useLayoutEffect(() => {
    const upper = upperRef.current;
    const footer = footerRef.current;
    if (!upper || !footer || remainingCount === 0) {
      return;
    }
    const measure = () => {
      const blockHeight = showRemaining
        ? (upper.querySelector<HTMLElement>(
            "[data-awards-ballot-card-remaining]",
          )?.offsetHeight ?? REMAINING_BLOCK_HEIGHT) + CARD_GAP
        : 0;
      const contentWithoutBlock = upper.scrollHeight - blockHeight;
      const available =
        CARD_HEIGHT -
        CARD_PADDING_TOP -
        CARD_PADDING_BOTTOM -
        CARD_GAP -
        footer.offsetHeight;
      setRemainingFits(
        contentWithoutBlock + CARD_GAP + REMAINING_BLOCK_HEIGHT <= available,
      );
    };
    measure();
    let cancelled = false;
    void document.fonts?.ready?.then(() => {
      if (!cancelled) measure();
    });
    return () => {
      cancelled = true;
    };
  });

  return (
    <div
      data-awards-ballot-card
      style={{
        width: 1080,
        height: 1920,
        backgroundColor: "#0b0b0b",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 44,
        padding: "80px 72px 72px 72px",
        boxSizing: "border-box",
        fontFamily: AWARDS_BALLOT_FONT_FAMILY,
        color: "#ffffff",
      }}
    >
      <img
        src={"/img/awards/ballot-glow.svg"}
        alt={""}
        aria-hidden={"true"}
        style={{
          position: "absolute",
          left: 420,
          top: -640,
          width: 1200,
          height: 1200,
          pointerEvents: "none",
          display: "block",
          maxWidth: "none",
          zIndex: 0,
        }}
      />

      <div
        ref={upperRef}
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          gap: 44,
          width: 936,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: 936,
          }}
        >
          <img
            src={"/img/awards/ballot-wordmark.svg"}
            alt={"GameNode"}
            style={{
              width: 300,
              height: 29.644,
              display: "block",
              flexShrink: 0,
            }}
          />
          {username && (
            <span
              data-awards-ballot-card-handle
              style={{
                fontWeight: 700,
                fontSize: 28,
                letterSpacing: "1.7px",
                color: "#adadad",
                lineHeight: "normal",
                whiteSpace: "nowrap",
              }}
            >
              @{username}
            </span>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            width: 936,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: "1.5px",
              // theme-exempt: awards ballot artwork
              color: "#f7896d",
              textTransform: "uppercase",
              lineHeight: "normal",
            }}
          >
            {t("awards.ballot.card.eyebrow", { year: eventYear })}
          </div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 124,
              letterSpacing: "-2.4px",
              color: "#ffffff",
              lineHeight: "normal",
            }}
          >
            {t("awards.ballot.card.title")}
          </div>
          <div
            style={{
              fontWeight: 400,
              fontSize: 32,
              color: "#adadad",
              lineHeight: "normal",
            }}
          >
            {t("awards.ballot.card.subtitle", { year: eventYear })}
          </div>
        </div>

        {gotyCategory && (
          <div
            data-awards-ballot-card-hero
            style={{
              width: 936,
              backgroundColor: "#2e150f",
              // theme-exempt: awards ballot artwork
              border: "2px solid #f15025",
              borderRadius: 40,
              padding: 32,
              display: "flex",
              flexDirection: "row",
              gap: 36,
              alignItems: "center",
              boxSizing: "border-box",
            }}
          >
            <BallotCardCover
              game={gotyGame}
              width={200}
              height={266}
              radius={16}
              backgroundColor={"#161616"}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                minWidth: 0,
                gap: 12,
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 24,
                  letterSpacing: "1.6px",
                  // theme-exempt: awards ballot artwork
                  color: "#f7896d",
                  textTransform: "uppercase",
                  lineHeight: "normal",
                }}
              >
                {gotyCategory.name}
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 88,
                  letterSpacing: "-1.8px",
                  color: "#ffffff",
                  lineHeight: "normal",
                  overflowWrap: "break-word",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {gotyGame?.name}
              </div>
              {gotyMetadata && (
                <div
                  style={{
                    fontWeight: 400,
                    fontSize: 28,
                    color: "#adadad",
                    lineHeight: "normal",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {gotyMetadata}
                </div>
              )}
            </div>
          </div>
        )}

        {gridCategories.length > 0 && (
          <div
            data-awards-ballot-card-grid
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 20,
              width: 936,
            }}
          >
            {gridCategories.map((category) => {
              const game = gamesById.get(category.voteGameId);
              return (
                <div
                  key={category.id}
                  data-awards-ballot-card-row
                  data-category-id={category.id}
                  style={{
                    width: 458,
                    backgroundColor: "#161616",
                    border: "1.5px solid #3d3d3d",
                    borderRadius: 24,
                    padding: 18,
                    display: "flex",
                    flexDirection: "row",
                    gap: 22,
                    alignItems: "center",
                    boxSizing: "border-box",
                  }}
                >
                  <BallotCardCover
                    game={game}
                    width={88}
                    height={118}
                    radius={10}
                    backgroundColor={"#262525"}
                  />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      minWidth: 0,
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 20,
                        letterSpacing: "1.2px",
                        color: "#808080",
                        textTransform: "uppercase",
                        lineHeight: "normal",
                      }}
                    >
                      {category.name}
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 34,
                        letterSpacing: "-0.5px",
                        color: "#ffffff",
                        lineHeight: "normal",
                        overflowWrap: "break-word",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {game?.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showRemaining && (
          <div
            data-awards-ballot-card-remaining
            style={{
              width: 936,
              border: "2px dashed #3d3d3d",
              borderRadius: 28,
              padding: "36px 40px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: 44,
                letterSpacing: "-0.6px",
                color: "#ffffff",
                lineHeight: "normal",
              }}
            >
              {t("awards.ballot.card.remaining", { count: remainingCount })}
            </div>
            <div
              style={{
                fontWeight: 400,
                fontSize: 28,
                color: "#adadad",
                lineHeight: "normal",
              }}
            >
              {t("awards.ballot.card.remainingSubtitle", { year: eventYear })}
            </div>
          </div>
        )}
      </div>

      <div
        ref={footerRef}
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
          width: 936,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            whiteSpace: "nowrap",
          }}
        >
          <div
            style={{
              fontWeight: 600,
              fontSize: 36,
              letterSpacing: "-0.3px",
              color: "#ffffff",
              lineHeight: "normal",
            }}
          >
            {t("awards.ballot.card.footerTitle", { year: eventYear })}
          </div>
          <div
            style={{
              fontWeight: 400,
              fontSize: 26,
              color: "#adadad",
              lineHeight: "normal",
            }}
          >
            {t("awards.ballot.card.footerUrl", { year: eventYear })}
          </div>
        </div>

        <div
          data-awards-ballot-card-pill
          style={{
            backgroundColor: "#2e150f",
            // theme-exempt: awards ballot artwork
            border: "2px solid #f15025",
            borderRadius: 999,
            padding: "16px 28px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxSizing: "border-box",
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: "1.4px",
              // theme-exempt: awards ballot artwork
              color: "#f7896d",
              whiteSpace: "nowrap",
              lineHeight: "normal",
              textTransform: "uppercase",
            }}
          >
            {t("awards.ballot.card.countPill", {
              voted: votedCount,
              total: totalCount,
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
