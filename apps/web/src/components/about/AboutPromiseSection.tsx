import { Box, Button } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import styles from "./AboutClosing.module.css";
import { aboutAsset } from "./aboutAssets";
import { ABOUT_CLOSING_LINKS } from "./aboutClosingMockData";

/**
 * The promise that everything free today stays free, with the open repository
 * and the community server as outbound links.
 */
const AboutPromiseSection = () => {
  const { t } = useTranslation();
  const titleId = "about-promise-title";

  return (
    <Box
      component="section"
      className={styles.promise}
      aria-labelledby={titleId}
    >
      <div className={styles.shell}>
        <h2 id={titleId} className={styles.promiseTitle}>
          <span>{t("about.promise.titleStart")}</span>
          <span className={styles.promiseHighlight}>
            {t("about.promise.titleHighlight")}
          </span>
        </h2>

        <div className={styles.promiseFooter}>
          <p className={styles.promiseDescription}>
            {t("about.promise.description")}
          </p>

          <div className={styles.promiseActions}>
            <Button
              component="a"
              href={ABOUT_CLOSING_LINKS.github}
              target="_blank"
              rel="noreferrer noopener"
              variant="default"
              className={styles.promiseButton}
              leftSection={
                <img
                  src={aboutAsset("icon-github.svg")}
                  width={18}
                  height={18}
                  alt=""
                  loading="lazy"
                />
              }
            >
              {t("about.promise.github")}
            </Button>

            <Button
              component="a"
              href={ABOUT_CLOSING_LINKS.discord}
              target="_blank"
              rel="noreferrer noopener"
              variant="default"
              className={styles.promiseButton}
              leftSection={
                <img
                  src={aboutAsset("icon-discord.svg")}
                  width={18}
                  height={18}
                  alt=""
                  loading="lazy"
                />
              }
            >
              {t("about.promise.discord")}
            </Button>
          </div>
        </div>
      </div>
    </Box>
  );
};

export { AboutPromiseSection };
