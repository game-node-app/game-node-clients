import { useTranslation } from "@repo/locales";
import { SessionAuth, WrappedRecapScreen } from "@repo/ui";
import { OpenGraph } from "@/components/general/OpenGraph";

const WrappedPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <OpenGraph title={`${t("mobile.wrapped.title")} | GameNode`} noIndex />
      <SessionAuth>
        <WrappedRecapScreen
          onShare={async (file) => {
            const toShare: ShareData = {
              title: t("game.share.title"),
              text: t("game.share.recentlyPlayed"),
              files: [file],
              url: `https://gamenode.app`,
            };

            await navigator.share(toShare);
          }}
        />
      </SessionAuth>
    </>
  );
};

export default WrappedPage;
