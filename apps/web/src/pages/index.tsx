import { Anchor, Box, Paper, Stack, Text } from "@mantine/core";
import { LandingHeader } from "@/components/general/header/LandingHeader";
import { useEffect } from "react";
import { useUserId } from "@repo/ui";
import { useRouter } from "next/router";
import { useTranslation } from "@repo/locales";

const Home = () => {
  const { t } = useTranslation();
  const userId = useUserId();
  const router = useRouter();

  useEffect(() => {
    if (userId) {
      router.push("/home");
    }
  }, [router, userId]);

  return (
    <>
      <LandingHeader />
      <Box className="w-full h-[85lvh] lg:h-lvh flex flex-col items-center justify-between bg-[url(../../public/img/bg_landing.jpg)] bg-cover bg-no-repeat pt-[180px]">
        <Box>
          <h1 className="text-center font-bold text-3xl lg:text-6xl lg:leading-[4.6rem]">
            {t("landing.headlineAlt")}
          </h1>
          <h3 className="text-center text-xl lg:leading-[120px] mt-6 lg:mt-0 font-light mb-12">
            {t("landing.subheadline")}
          </h3>
        </Box>

        <picture className="overflow-hidden">
          <source
            media="(max-width: 679px)"
            srcSet="/img/mock.png"
            width="220"
            className="pointer-events-none"
          />
          <source media="(min-width: 680px)" srcSet="/img/mock_desk.png" />
          <img
            src="/img/mock_desk.png"
            alt="Profile"
            className="overflow-hidden object-cover pointer-events-none"
            loading="lazy"
          />
        </picture>
      </Box>

      <Box className="bg-gradient-to-b from-[#212121]to-[#090909]w-full h-full flex justify-center mt-24">
        <Box className="lg:h-[340px] flex items-center gap-4 flex-col lg:flex-row">
          <Box className="flex flex-col items-center gap-5">
            <Box className="w-[150px] h-[150px] relative">
              <img
                loading={"lazy"}
                alt={"Box animated gif"}
                src="/img/vergil-compressed.gif"
                className="w-full h-full object-cover rounded-[5px]"
              />
              <Text className="absolute inset-0 flex items-center justify-center text-[30px]">
                1
              </Text>
            </Box>
            <Text>{t("landing.features.addGames")}</Text>
          </Box>
          <img
            src="/img/line_space.png"
            alt="space"
            className="h-[1px] mb-5 hidden lg:block"
          />
          <Box className="flex flex-col items-center gap-5 px-4 z-10">
            <Box className="w-[150px] h-[150px] relative">
              <img
                loading={"lazy"}
                alt={"Box animated gif"}
                src="/img/mh-compressed.gif"
                className="w-full h-full object-cover rounded-[5px]"
              />
              <Text className="absolute inset-0 flex items-center justify-center text-[30px]">
                2
              </Text>
            </Box>
            <Text className="font-bold text-[16px]">
              {t("landing.features.makeReviews")}
            </Text>
          </Box>

          <img
            src="/img/line_space.png"
            alt="space"
            className="h-[1px] mb-5 hidden lg:block"
          />
          <Box className="flex flex-col items-center gap-5">
            <Box className="w-[150px] h-[150px] relative">
              <img
                loading={"lazy"}
                alt={"Box animated gif"}
                src="/img/valorant-compressed.gif"
                className="w-full h-full object-cover rounded-[5px]"
              />
              <Text className="absolute inset-0 flex items-center justify-center text-[30px]">
                3
              </Text>
            </Box>
            <Text>{t("landing.features.shareWorld")}</Text>
          </Box>
        </Box>
      </Box>

      <Box className="lg:h-[500px] lg:mt-0 flex flex-col justify-between">
        <h2 className="text-center text-xl lg:text-2xl font-light px-4 lg:px-[22rem] my-20">
          {t("landing.featureDescription")}
        </h2>

        <Box className="flex flex-col items-center px-4 lg:mb-24 lg:mt-24">
          <h3 className="text-center font-medium text-[20px] mb-2">
            {t("landing.platforms.description")}
          </h3>

          <img
            className={"pointer-events-none"}
            src="/img/about_us/platforms.svg"
            alt="platforms"
          />

          <h3 className="text-center font-medium text-[16px] mt-4 mb-2">
            {t("landing.platforms.soon")}
          </h3>

          <img
            className={"pointer-events-none"}
            src="/img/about_us/soon.svg"
            alt="soon"
          />
        </Box>

        <Stack className={"w-full items-center justify-center lg:mt-16 mt-12"}>
          <h3 className="text-center font-medium text-[20px]">
            {t("landing.mobile.titleAlt")}
          </h3>
          <Anchor href="https://play.google.com/store/apps/details?id=app.gamenode">
            <img
              alt={"Get it on Google Play badge"}
              src={"/img/google_play_badge_english.png"}
            />
          </Anchor>
          <Text className={"text-dimmed text-sm"}>
            {t("landing.mobile.soonIOS")}
          </Text>
        </Stack>

        <footer className="mt-20">
          <Paper className="bg-[#191919] h-20">
            <Box className="h-full flex justify-between items-center lg:px-20">
              <img
                src="/img/main-logo.png"
                alt="Game Node Logo"
                width="99"
                height="40"
                className="hidden lg:block"
              />

              <a
                href="https://patreon.com/GameNodeApp"
                target="_blank"
                className="lg:hidden pl-4"
              >
                <img src="/img/patreon_footer.png" alt="patreon" />
              </a>

              <Box className="flex flex-row gap-[28px] items-center pr-4 lg:pr-0">
                <a
                  href="https://patreon.com/GameNodeApp"
                  target="_blank"
                  className="hidden lg:block"
                >
                  <img src="/img/patreon_footer.png" alt="patreon" />
                </a>
                <a href="https://github.com/game-node-app" target="_blank">
                  <img src="/img/github_footer.png" alt="github" />
                </a>
                <a href="https://discord.gg/kcAT562B5A" target="_blank">
                  <img src="/img/discord_footer.png" alt="discord" />
                </a>
                <a href="https://x.com/gamenodeapp" target="_blank">
                  <img src="/img/x_footer.png" alt="X" />
                </a>
              </Box>
            </Box>
          </Paper>
        </footer>
      </Box>
    </>
  );
};

export default Home;
