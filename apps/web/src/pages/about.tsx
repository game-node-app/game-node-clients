import { LandingHeader } from "@/components/general/header/LandingHeader";
import { Box, Button, Paper } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { SupportersWall, useSupporterEntryHref } from "@repo/ui";
import { UserConnectionDto } from "@repo/wrapper/server";
import Link from "next/link";

/**
 * Currently supported connection types. Keep in sync with
 * `ConnectionCreateDto.type` and `GET /v1/connections`.
 */
const PLATFORMS = [
  { type: UserConnectionDto.type.STEAM, icon: "/img/landing/780e4.svg" },
  { type: UserConnectionDto.type.PSN, icon: "/img/landing/1255f.svg" },
  { type: UserConnectionDto.type.XBOX, icon: "/img/landing/24331.svg" },
  { type: UserConnectionDto.type.EPICGAMES, icon: "/img/landing/317b0.svg" },
  { type: UserConnectionDto.type.NINTENDO, icon: "/img/about_us/nintendo.png" },
  { type: UserConnectionDto.type.GOG, icon: "/img/landing/b5a83.svg" },
] as const;

const AboutPage = () => {
  const { t } = useTranslation();
  const supporterHref = useSupporterEntryHref();

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

      <Box className={"bg-[#171717] px-4 sm:px-12 lg:px-40 py-20"}>
        <div
          className={
            "mx-auto flex max-w-6xl flex-col items-center gap-12 lg:flex-row lg:gap-24"
          }
        >
          <div className={"grid w-full max-w-md grid-cols-3 gap-4 sm:gap-6"}>
            {PLATFORMS.map((platform) => (
              <div
                className={"flex flex-col items-center gap-3"}
                key={platform.type}
              >
                <div
                  className={
                    "flex size-16 items-center justify-center rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b]"
                  }
                >
                  <img
                    className={"size-9 object-contain"}
                    src={platform.icon}
                    alt=""
                    width={36}
                    height={36}
                  />
                </div>
                <p className={"text-center text-sm font-medium"}>
                  {t(`landing.platforms.names.${platform.type}`)}
                </p>
              </div>
            ))}
          </div>

          <div className={"flex-1 text-center lg:text-left"}>
            <h2 className={"font-bold text-4xl sm:text-5xl pb-4"}>
              {t("landing.platforms.title")}
            </h2>
            <p className={"text-[1.25rem] pb-2 font-regular"}>
              {t("landing.platforms.description")}
            </p>
            <p className={"text-[1.25rem] font-regular"}>
              {t("landing.platforms.syncDescription")}
            </p>
          </div>
        </div>
      </Box>

      <Box className={"px-4 sm:px-9 py-16"}>
        <Paper
          radius={18}
          className={"mx-auto max-w-5xl border border-[#292929] p-8 sm:p-14"}
          style={{
            background:
              "radial-gradient(60% 80% at 100% 0%, #f1502533, transparent), #090909",
          }}
        >
          <div
            className={
              "flex flex-col items-start gap-8 lg:flex-row lg:items-center"
            }
          >
            <div className={"flex-1"}>
              <p className={"text-[13px] font-bold text-brand"}>
                {t("landing.presentation.aiLabel")}
              </p>
              <h2 className={"py-3 text-3xl font-bold sm:text-4xl"}>
                {t("landing.presentation.aiTitle")}
              </h2>
              <p className={"font-light text-lg text-[#adadad] sm:text-xl"}>
                {t("landing.presentation.aiDescription")}
              </p>
            </div>
            <Button component={Link} href="/mcp" size="lg" radius={8}>
              {t("landing.presentation.aiCta")}
            </Button>
          </div>
        </Paper>
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
          "flex flex-col justify-center items-center py-32 gap-10 bg-[#101010] px-4"
        }
        style={{ background: "url(/img/about_us/coffee.gif) left" }}
      >
        <div className={"text-center"}>
          <h2 className={"font-bold text-4xl sm:text-6xl pb-6"}>
            {t("supporter.heading")}
          </h2>
          <p className={"font-light text-[0.8rem] sm:text-2xl"}>
            {t("landing.support.description")}
          </p>
        </div>

        <div className={"flex flex-col items-center gap-3 max-w-md"}>
          <Link
            href={supporterHref}
            className={
              "inline-flex items-center justify-center bg-brand px-6 py-2 rounded-2xl tracking-wider text-2xl font-bold text-white transition-colors hover:bg-brand-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            }
          >
            {t("landing.support.becomeSupporter")}
          </Link>
          <p className={"text-center font-light text-sm sm:text-base"}>
            {t("supporter.subheading")}
          </p>
        </div>
      </Box>

      <SupportersWall variant="page" />

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