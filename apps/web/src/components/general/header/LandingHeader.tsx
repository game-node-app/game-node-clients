import { Box, Button } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import { cn, useUserId } from "@repo/ui";
import { useWindowScroll } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";

/**
 * A "landing page" style header component.
 * @constructor
 */
const LandingHeader = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const userId = useUserId();
  const [scrollPositions] = useWindowScroll();

  return (
    <div>
      <header
        className={cn(
          `w-full h-[80px] flex items-center justify-between fixed px-4 lg:px-20 z-50`,
          {
            "backdrop-blur": scrollPositions.y > 10,
            "bg-transparent": scrollPositions.y <= 10,
          },
        )}
      >
        <Box className="flex flex-row gap-16 items-center">
          <Link href={"/"}>
            <img
              src="/img/main-logo.png"
              alt="Game Node Logo"
              className="max-h-full pointer-events-none"
            />
          </Link>

          <Link href="/about" className="hidden lg:block">
            <span>{t("landing.header.aboutUs")}</span>
          </Link>
          <a href="https://status.gamenode.app" className="hidden lg:block">
            <span>{t("landing.header.serviceStatus")}</span>
          </a>
          <a
            href="https://github.com/game-node-app"
            className="hidden lg:block"
          >
            <span>{t("landing.header.collaborate")}</span>
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=app.gamenode"
            className="hidden lg:block hover:text-green-400"
          >
            <span>{t("landing.header.androidApp")}</span>
          </a>
        </Box>

        {userId == undefined && (
          <Link href={"/home"}>
            <Button variant="filled" className="w-[100px] h-[40px] rounded-3xl">
              {t("landing.header.joinIn")}
            </Button>
          </Link>
        )}
      </header>
    </div>
  );
};

export { LandingHeader };
