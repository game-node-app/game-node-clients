import React from "react";
import { GetServerSidePropsContext } from "next";
import { useTranslation } from "@repo/locales";
import { GuildView } from "@repo/ui";
import { OpenGraph } from "@/components/general/OpenGraph";

const GUILD_TABS = ["board", "accepted", "completed"] as const;

type GuildTab = (typeof GUILD_TABS)[number];

function isGuildTab(value: unknown): value is GuildTab {
  return (
    typeof value === "string" &&
    (GUILD_TABS as readonly string[]).includes(value)
  );
}

interface Props {
  initialTab: GuildTab | null;
}

/** Reads `?tab=` so Guild notifications can deep-link the accepted contracts. */
export const getServerSideProps = async ({
  query,
}: GetServerSidePropsContext): Promise<{ props: Props }> => {
  const tab = Array.isArray(query.tab) ? query.tab[0] : query.tab;

  return { props: { initialTab: isGuildTab(tab) ? tab : null } };
};

const GuildPage = ({ initialTab }: Props) => {
  const { t } = useTranslation();

  return (
    <>
      <OpenGraph title={`${t("guild.header.title")} - GameNode`} />
      <GuildView
        supporterHref="/premium"
        initialTab={initialTab ?? undefined}
      />
    </>
  );
};

export default GuildPage;
