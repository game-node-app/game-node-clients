import { Box, Button, Paper, Stack } from "@mantine/core";
import { LandingHeader } from "@/components/general/header/LandingHeader";
import { useTranslation } from "@repo/locales";

const AboutPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <LandingHeader />
      <Box className="w-full flex flex-col items-center bg-[url(../../public/img/bg_landing.jpg)] bg-cover bg-no-repeat">
        <Box className={"h-96 flex justify-center items-center"}>
          <h1 className={"text-5xl font-bold text-center"}>
            {t("landing.headline")}
          </h1>
        </Box>

        <Box className="flex flex-wrap justify-center gap-7 px-4 sm:px-20 pb-24">
          <div className="relative">
            <img
              src="/img/about_us/box_01.png"
              alt={t("landing.features.customCollections")}
              className="block pointer-events-none"
            />
            <p className="absolute left-10 bottom-0 pb-10 font-bold text-4xl">
              {t("landing.features.customCollections")}
            </p>
          </div>

          <div className="relative">
            <img
              src="/img/about_us/box_02.png"
              alt={t("landing.features.review")}
              className={"object-cover"}
            />
            <p className="absolute left-10 bottom-0 pb-10 font-bold text-4xl">
              {t("landing.features.review")}
            </p>
          </div>

          <div className="relative">
            <img
              src="/img/about_us/box_03.png"
              alt={t("landing.features.achievements")}
              className={"object-cover"}
            />
            <p className="absolute left-10 bottom-0 pb-10 font-bold text-4xl">
              {t("landing.features.achievements")}
            </p>
          </div>

          <div className="relative">
            <img
              src="/img/about_us/box_04.png"
              alt={t("landing.features.activities")}
              className={"object-cover"}
            />
            <p className="absolute left-10 bottom-0 pb-10 font-bold text-4xl">
              {t("landing.features.activities")}
            </p>
          </div>
        </Box>
      </Box>

      <Box
        className={
          "flex bg-[#171717] flex-col sm:flex-row gap-0 sm:gap-32 px-4 sm:px-60 pt-20 pb-20"
        }
      >
        <div className={"block"}>
          <img
            className={"pointer-events-none"}
            src="/img/about_us/platforms.svg"
            alt="platforms"
          />
        </div>

        <div className={"pt-6 sm:pt-0"}>
          <h2 className={"font-bold text-5xl pb-4 text-center sm:text-left"}>
            {t("landing.platforms.title")}
          </h2>
          <p
            className={
              "text-[1.25rem] pb-2 font-regular text-center sm:text-left"
            }
          >
            {t("landing.platforms.description")}
          </p>
          <p className={"text-[1.25rem] font-regular text-center sm:text-left"}>
            {t("landing.platforms.syncDescription")}
          </p>

          <div className={"flex flex-col items-center pt-10 sm:items-start"}>
            <p className={"pb-4"}>{t("landing.platforms.soon")}</p>
            <img
              className={"pointer-events-none"}
              src="/img/about_us/soon.svg"
              alt="soon"
            />
          </div>
        </div>
      </Box>

      <Box className={"flex flex-col sm:flex-row items-center px-4 sm:px-9"}>
        <div className={"sm:w-1/2 text-center sm:text-left"}>
          <h2 className={"font-bold text-4xl py-10 sm:py-6"}>
            {t("landing.mobile.title")}
          </h2>
          <p className={"font-light text-2xl"}>
            {t("landing.mobile.description")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-5">
            <a
              href="https://play.google.com/store/apps/details?id=app.gamenode&pli=1"
              target={"_blank"}
            >
              <button className={"min-w-[200px]"}>
                <p
                  className={
                    "bg-white p-2 rounded-[8px] flex gap-2 text-[#191919] px-4 border-2 border-white justify-center"
                  }
                >
                  <img
                    className={"w-5"}
                    src="/img/about_us/playstore.svg"
                    alt="PlayStore"
                  />{" "}
                  {t("landing.mobile.googlePlay")}
                </p>
              </button>
            </a>

            <a href="#" className={"pointer-events-none opacity-30"}>
              <button disabled={true} className={"min-w-[200px]"}>
                <p
                  className={
                    "bg-[#171717] p-2 rounded-[8px] gap-2 border-2 border-white flex justify-center"
                  }
                >
                  <img
                    className={"w-5"}
                    src="/img/about_us/apple.svg"
                    alt="apple"
                  />{" "}
                  {t("landing.mobile.appStoreSoon")}
                </p>
              </button>
            </a>
          </div>
        </div>

        <div className={"pt-6 sm:pt-40"}>
          <img src="/img/about_us/mobile.png" alt="mobile" />
        </div>
      </Box>

      <Box
        className={
          "flex flex-col justify-center items-center py-32 gap-4 bg-[#101010]"
        }
        style={{ background: "url(/img/about_us/coffee.gif) left" }}
      >
        <div className={"text-center"}>
          <h2 className={"font-bold text-5xl sm:text-6xl pb-6"}>
            {t("landing.support.title")}
          </h2>
          <p className={"font-light text-[0.8rem] sm:text-2xl mb-4"}>
            {t("landing.support.description")}
          </p>
        </div>
        <button className={"bg-[#ff424d] px-6 py-2 rounded-2xl"}>
          <a href="https://patreon.com/GameNodeApp" target="_blank">
            <p className={"tracking-wider text-2xl font-bold"}>
              {t("landing.support.buyCoffe")}
            </p>
          </a>
        </button>
        <button className={"bg-[#eb4a3b] px-6 py-2 rounded-2xl"}>
          <a href="https://apoia.se/gamenode" target="_blank">
            <p className={"tracking-wider text-2xl font-bold"}>
              {t("landing.support.apoia")}
            </p>
          </a>
        </button>
      </Box>

      <footer>
        <Paper className="bg-[#191919] h-20">
          <Box className="h-full flex justify-between items-center lg:px-20">
            <img
              src="/img/main-logo.png"
              alt="Game Node Logo"
              width="99"
              height="40"
              className="block pl-4"
            />

            <Box className="flex flex-row gap-[28px] items-center pr-4 lg:pr-0">
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
    </>
  );
};

export default AboutPage;
