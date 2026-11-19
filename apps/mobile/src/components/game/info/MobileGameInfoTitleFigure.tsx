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
      className={"relative overflow-hidden"}
      style={{
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
            filter: "blur(2px) brightness(0.6) saturate(1.1)",
            transform: "scale(1.05)",
          }}
        />
      )}
      <Box
        aria-hidden
        className={"absolute inset-0"}
        style={{
          background:
            "linear-gradient(to bottom, rgba(11,11,11,0.55) 0%, rgba(11,11,11,0) 35%, #0b0b0b 100%)",
        }}
      />
      <Stack className={"relative gap-3 pb-2"}>
        <Center className={"w-full"}>
          <Box
            className={"w-44 rounded-lg overflow-hidden"}
            style={{ boxShadow: "0 16px 40px rgba(0,0,0,0.6)" }}
          >
            <GameFigureImage game={game} imageSize={ImageSize.COVER_BIG_2X} />
          </Box>
        </Center>
        <Text
          className={"text-center text-white font-semibold text-lg px-4"}
        >
          {game.name}
        </Text>
      </Stack>
    </Box>
  );
};

export { MobileGameInfoTitleFigure };
