import { useMediaQuery } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { useState } from "react";
import { cn } from "#@/util";

import styles from "../guild.module.css";
import { GuildIcon } from "../scene/GuildIcon";
import { GuildScene } from "../scene/GuildScene";
import { LinaDialogue } from "../scene/LinaDialogue";
import { PixelButton } from "../scene/PixelButton";

export interface GuildSignInPromptProps {
  signInHref: string;
}

const MOBILE_QUERY = "(max-width: 47.99em)";

/**
 * Guest gate: the same pixel hall with Lina inviting the visitor to sign in
 * (design D2 / spec guild-access).
 */
export function GuildSignInPrompt({ signInHref }: GuildSignInPromptProps) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery(MOBILE_QUERY, false);
  const [isTalking, setIsTalking] = useState(false);

  const dialogue = (
    <LinaDialogue
      speaker={t(
        isMobile ? "guild.lina.namePlateShort" : "guild.lina.namePlate",
      )}
      segments={[{ text: t("guild.signIn.line") }]}
      variant={isMobile ? "mobile" : "desktop"}
      onTypingChange={setIsTalking}
      actions={
        <PixelButton href={signInHref} variant="primary">
          {t("guild.signIn.cta")}
        </PixelButton>
      }
    />
  );

  return (
    <div
      className={cn(styles.root, styles.guildGate)}
      data-guild-gate="sign-in"
    >
      <header className={styles.guildGateHeader}>
        <span className={styles.guildGateCrest}>
          <GuildIcon name="shield" />
        </span>
        <div className={styles.guildGateHeading}>
          <h1 className={styles.pixelTitle}>{t("guild.signIn.title")}</h1>
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
