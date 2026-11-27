import React from "react";
import { GetServerSidePropsContext } from "next";
import { useTranslation } from "@repo/locales";
import { GuildView } from "@repo/ui";
import { OpenGraph } from "@/components/general/OpenGraph";

const GUILD_TABS = [
  "board",
  "accepted",
  "completed",
  "arcs",
  "bounties",
  "emporium",
] as const;

type GuildTab = (typeof GUILD_TABS)[number];

function isGuildTab(value: unknown): value is GuildTab {
  return (
    typeof value === "string" &&
    (GUILD_TABS as readonly string[]).includes(value)
  );
}

interface Props {
  initialTab: GuildTab | null;
  initialBountyId: string | null;
}

/** Reads `?tab=` and `?bountyId=` so Guild notifications can deep-link. */
export const getServerSideProps = async ({
  query,
}: GetServerSidePropsContext): Promise<{ props: Props }> => {
  const tab = Array.isArray(query.tab) ? query.tab[0] : query.tab;
  const bountyId = Array.isArray(query.bountyId)
    ? query.bountyId[0]
    : query.bountyId;

  return {
    props: {
      initialTab: isGuildTab(tab) ? tab : null,
      initialBountyId:
        typeof bountyId === "string" && bountyId.length > 0 ? bountyId : null,
    },
  };
};

const GuildPage = ({ initialTab, initialBountyId }: Props) => {
  const { t } = useTranslation();

  return (
    <>
      <OpenGraph title={`${t("guild.header.title")} - GameNode`} />
      <GuildView
        supporterHref="/premium"
        initialTab={initialTab ?? undefined}
        bountyId={initialBountyId ?? undefined}
      />
    </>
  );
};

export default GuildPage;
