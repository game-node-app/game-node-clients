import { useMediaQuery } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { useState } from "react";
import { cn } from "#@/util";

import styles from "../guild.module.css";
import { GuildIcon } from "../scene/GuildIcon";
import { GuildScene } from "../scene/GuildScene";
import { LinaDialogue } from "../scene/LinaDialogue";
import { PixelButton } from "../scene/PixelButton";

export interface GuildEarlyAccessProps {
  supporterHref: string;
}

const MOBILE_QUERY = "(max-width: 47.99em)";

/**
 * Signed-in but not in yet: the pixel early-access screen. Lina explains the
 * supporters rollout over the hall scene and the CTA opens the app's supporter
 * offer (design D2).
 */
export function GuildEarlyAccess({ supporterHref }: GuildEarlyAccessProps) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery(MOBILE_QUERY, false);
  const [isTalking, setIsTalking] = useState(false);

  const dialogue = (
    <LinaDialogue
      speaker={t(
        isMobile ? "guild.lina.namePlateShort" : "guild.lina.namePlate",
      )}
      segments={[{ text: t("guild.earlyAccess.line") }]}
      variant={isMobile ? "mobile" : "desktop"}
      onTypingChange={setIsTalking}
      actions={
        <PixelButton href={supporterHref} variant="primary">
          {t("guild.earlyAccess.cta")}
        </PixelButton>
      }
    />
  );

  return (
    <div
      className={cn(styles.root, styles.guildGate)}
      data-guild-gate="early-access"
    >
      <header className={styles.guildGateHeader}>
        <span className={styles.guildGateCrest}>
          <GuildIcon name="shield" />
        </span>
        <div className={styles.guildGateHeading}>
          <span className={cn(styles.pixelOverline, styles.guildGateBadge)}>
            {t("guild.earlyAccess.badge")}
          </span>
          <h1 className={styles.pixelTitle}>{t("guild.earlyAccess.title")}</h1>
        </div>
      </header>

      <GuildScene
        variant={isMobile ? "mobile" : "desktop"}
        pose="neutral"
        isTalking={isTalking}
        showAlert={false}
        dialogue={isMobile ? undefined : dialogue}
      />

      {isMobile ? (
        <div className={styles.guildGateDialogue}>{dialogue}</div>
      ) : null}
    </div>
  );
}
