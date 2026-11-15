import { GameFigureImage } from "#@/components/game/figure/GameFigureImage";
import { ImageSize } from "#@/components/game/util/getSizedImageUrl";
import { RecapCardFooter } from "#@/components/wrapped/card/RecapCardFooter";
import {
  RECAP_CARD_FORMATS,
  type RecapCardFormat,
} from "#@/components/wrapped/card/recapCardFormats";
import { getCapitalizedText } from "#@/util";
import { Box, Text } from "@mantine/core";
import type { Game } from "@repo/wrapper/server";

export interface RecapCoverGridEntry {
  id: number | string;
  game: Game;
  recentPlaytimeSeconds: number;
  totalPlaytimeSeconds: number;
  platformAbbreviation: string;
}

interface Props {
  format: RecapCardFormat;
  userId: string;
  periodText: string;
  cols: number;
  rows: number;
  entries: RecapCoverGridEntry[];
  withRecentPlaytime: boolean;
  withTotalPlaytime: boolean;
  withSource: boolean;
}

const PADDING = 48;
const FOOTER_HEIGHT = 120;
/** Aspect of `GameFigureImage` (264 x 354). */
const COVER_ASPECT = 264 / 354;

/**
 * Cell width that fits the grid in the card: limited by the card width, and by
 * the height left above the footer so every row stays visible in Feed.
 */
export function getCoverGridCellWidth(
  format: RecapCardFormat,
  cols: number,
  rows: number,
): number {
  const { width, height } = RECAP_CARD_FORMATS[format];
  const byWidth = (width - PADDING * 2) / cols;
  const byHeight =
    ((height - PADDING * 2 - FOOTER_HEIGHT) / rows) * COVER_ASPECT;

  return Math.floor(Math.min(byWidth, byHeight));
}

/** The previous Wrapped cover grid, drawn at native card size. */
export function RecapCoverGridCard({
  format,
  userId,
  periodText,
  cols,
  rows,
  entries,
  withRecentPlaytime,
  withTotalPlaytime,
  withSource,
}: Props) {
  const cellWidth = getCoverGridCellWidth(format, cols, rows);

  return (
    <Box
      className={"bg-paper flex flex-col w-full h-full"}
      style={{ padding: PADDING }}
    >
      <Box className={"flex-1 flex justify-center items-start"}>
        <Box
          className={"grid"}
          style={{ gridTemplateColumns: `repeat(${cols}, ${cellWidth}px)` }}
        >
          {entries.slice(0, cols * rows).map((entry) => (
            <div
              key={entry.id}
              className={"pointer-events-none"}
              style={{ width: cellWidth }}
            >
              <GameFigureImage
                game={entry.game}
                imageProps={{ radius: undefined }}
                linkProps={{ onClick: (evt) => evt.preventDefault() }}
                imageSize={ImageSize.COVER_BIG_2X}
              >
                <Box className={"absolute top-2 left-2"}>
                  <Text
                    fw={700}
                    style={{
                      fontSize: Math.max(18, cellWidth / 12),
                      lineHeight: 1.2,
                      textShadow: "1px 1px 2px black",
                    }}
                  >
                    {withRecentPlaytime && (
                      <span>
                        Recent: {Math.ceil(entry.recentPlaytimeSeconds / 3600)}h
                        <br />
                      </span>
                    )}
                    {withTotalPlaytime && (
                      <span>
                        Total: {Math.ceil(entry.totalPlaytimeSeconds / 3600)}h
                        <br />
                      </span>
                    )}
                    {withSource && (
                      <span>
                        {getCapitalizedText(entry.platformAbbreviation)}
                      </span>
                    )}
                  </Text>
                </Box>
              </GameFigureImage>
            </div>
          ))}
        </Box>
      </Box>
      <Box style={{ height: FOOTER_HEIGHT }} className={"flex items-end"}>
        <RecapCardFooter userId={userId} periodText={periodText} />
      </Box>
    </Box>
  );
}
