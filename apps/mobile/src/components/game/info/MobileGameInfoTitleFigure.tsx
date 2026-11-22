import { Box, Center, Stack, Text } from "@mantine/core";
import {
  getCombinedImages,
  getSizedImageUrl,
  GameFigureImage,
  GameInfoTitleFigureProps,
  ImageSize,
} from "@repo/ui";

/**
 * Mobile hero: a screenshot (falls back to artwork) fills the background,
 * fades into the page, and the cover floats on top. It bleeds under the
 * transparent header and out of the page's `ion-padding`.
 */
const MobileGameInfoTitleFigure = ({ game }: GameInfoTitleFigureProps) => {
  const backdropUrl = getSizedImageUrl(
    getCombinedImages(game)[0],
    ImageSize.SCREENSHOT_HUGE,
  );

  return (
    <Box
      className={"relative overflow-hidden bg-media-fade"}
      style={{
        // The parent is a shrink-to-fit flex item (cover-sized), so size the
        // hero explicitly to the full page width, `ion-padding` included.
        width:
          "calc(100% + var(--padding-start, 16px) + var(--padding-end, 16px))",
        maxWidth: "none",
        flex: "none",
        margin:
          "calc(-1 * var(--padding-top, 16px)) calc(-1 * var(--padding-end, 16px)) 0 calc(-1 * var(--padding-start, 16px))",
        paddingTop: "calc(var(--ion-safe-area-top, 0px) + 72px)",
      }}
    >
      {backdropUrl && (
        <Box
          aria-hidden
          className={"absolute inset-0 bg-cover bg-center"}
          style={{
            backgroundImage: `url(${backdropUrl})`,
            filter: "blur(2px) saturate(1.1)",
            transform: "scale(1.05)",
          }}
        />
      )}
      <Stack className={"relative gap-3"}>
        <Center className={"relative z-10 w-full"}>
          <Box className={"w-44 rounded-lg overflow-hidden shadow-xl"}>
            <GameFigureImage game={game} imageSize={ImageSize.COVER_BIG_2X} />
          </Box>
        </Center>
        <Text
          className="relative bg-media-fade px-4 pb-2 text-center text-lg font-semibold text-media before:pointer-events-none before:absolute before:inset-x-0 before:bottom-full before:h-16 before:bg-gradient-to-t before:from-media-fade before:to-transparent"
        >
          {game.name}
        </Text>
      </Stack>
    </Box>
  );
};

export { MobileGameInfoTitleFigure };
