import { useState } from "react";
import { Skeleton } from "@mantine/core";
import type { ClaimGuildContractResponseDto } from "@repo/wrapper/server";
import { GuildContractDto } from "@repo/wrapper/server";
import { useTranslation } from "@repo/locales";
import { cn, Modal } from "#@/util";

import styles from "../guild.module.css";
import expansionStyles from "./GuildContractsExpansion.module.css";
import {
  useAbandonGuildContract,
  useClaimGuildContract,
  useGuildContracts,
  type GuildContractsTab,
} from "../hooks";
import { useGuildOverview } from "../hooks/useGuildOverview";
import { useGuildRewards } from "../hooks/useGuildRewards";
import { PixelButton } from "../scene/PixelButton";
import { getQuestCopy } from "../util";
import { GuildClaimCelebration } from "./GuildClaimCelebration";
import { GuildContractRow } from "./GuildContractRow";
import { GuildExtendContractModal } from "./GuildExtendContractModal";
import { GuildQueryError } from "./GuildQueryError";
import {
  canOfferContractExtension,
  getChainStageLabel,
} from "./guildContractExpansion";

export type GuildContractListTab = GuildContractsTab;

export interface GuildContractListProps {
  tab: GuildContractListTab;
  className?: string;
}

/**
 * The "Accepted" (`active` + `ready_to_claim`) and "Completed" lists. Owns the
 * turn-in celebration and the abandon confirmation, and keeps ready contracts
 * first even when they outlived their `expiresAt` (spec guild-hall).
 */
export function GuildContractList({ tab, className }: GuildContractListProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || "en";
  const contractsQuery = useGuildContracts(tab);
  const claim = useClaimGuildContract();
  const abandon = useAbandonGuildContract();
  const overviewQuery = useGuildOverview();
  const rewardsQuery = useGuildRewards();
  const [celebration, setCelebration] =
    useState<ClaimGuildContractResponseDto | null>(null);
  const [abandonTarget, setAbandonTarget] = useState<GuildContractDto | null>(
    null,
  );
  const [extendTarget, setExtendTarget] = useState<GuildContractDto | null>(
    null,
  );

  const hourglass = rewardsQuery.data?.consumables?.hourglass ?? 0;
  const monthlyFreeHourglass =
    overviewQuery.data?.license?.perks?.monthlyFreeHourglass ?? 0;
  const activeChain = overviewQuery.data?.activeChain ?? null;

  const contracts =
    contractsQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const orderedContracts = [...contracts].sort(
    (a, b) =>
      Number(b.status === GuildContractDto.status.READY_TO_CLAIM) -
      Number(a.status === GuildContractDto.status.READY_TO_CLAIM),
  );
  const abandonTitle = abandonTarget
    ? getQuestCopy(abandonTarget, t, locale).title
    : "";
  const emptyMessage =
    tab === "accepted"
      ? t("guild.contracts.emptyAccepted")
      : t("guild.contracts.emptyCompleted");

  const handleClaim = (contract: GuildContractDto) => {
    claim.mutate(contract.id, {
      onSuccess: (result) => {
        setCelebration(result);
      },
    });
  };

  const handleAbandonConfirm = () => {
    if (!abandonTarget) return;

    abandon.mutate(abandonTarget.id, {
      onSuccess: () => {
        setAbandonTarget(null);
      },
    });
  };

  return (
    <div className={cn(styles.contractList, className)}>
      {contractsQuery.isPending ? (
        <div className={styles.contractListLoading}>
          <Skeleton height={92} radius={8} />
          <Skeleton height={92} radius={8} />
        </div>
      ) : contractsQuery.isError && !contractsQuery.data ? (
        <GuildQueryError
          error={contractsQuery.error}
          onRetry={() => {
            void contractsQuery.refetch();
          }}
          isRetrying={contractsQuery.isFetching}
        />
      ) : orderedContracts.length === 0 ? (
        <p className={cn(styles.bodyText, styles.contractListEmpty)}>
          {emptyMessage}
        </p>
      ) : (
        orderedContracts.map((contract) => (
          <GuildContractRow
            key={contract.id}
            contract={contract}
            onClaim={handleClaim}
            onAbandon={setAbandonTarget}
            onExtend={setExtendTarget}
            chainStageLabel={getChainStageLabel(contract, activeChain, t)}
            canExtend={canOfferContractExtension(contract, {
              hourglass,
              monthlyFreeHourglass,
            })}
            isClaiming={claim.isPending && claim.variables === contract.id}
            isAbandoning={
              abandon.isPending && abandon.variables === contract.id
            }
          />
        ))
      )}

      {contractsQuery.hasNextPage ? (
        <div className={styles.contractListFooter}>
          <PixelButton
            size="sm"
            variant="ghost-dark"
            onClick={() => void contractsQuery.fetchNextPage()}
            disabled={contractsQuery.isFetchingNextPage}
          >
            {t("actions.showMore")}
          </PixelButton>
        </div>
      ) : null}

      <Modal
        opened={abandonTarget !== null}
        onClose={() => setAbandonTarget(null)}
        title={t("guild.contracts.abandon.title")}
        centered
      >
        <div className={styles.root}>
          <p className={cn(styles.bodyText, styles.contractModalText)}>
            {abandonTarget?.chainProgressId != null
              ? t("guild.contracts.abandon.bodyChain", { title: abandonTitle })
              : t("guild.contracts.abandon.body", { title: abandonTitle })}
          </p>
          <div className={styles.contractModalActions}>
            <PixelButton
              size="sm"
              variant="ghost-dark"
              onClick={() => setAbandonTarget(null)}
            >
              {t("guild.contracts.abandon.cancel")}
            </PixelButton>
            <PixelButton
              size="sm"
              className={expansionStyles.dangerButton}
              onClick={handleAbandonConfirm}
              disabled={abandon.isPending}
            >
              {t("guild.contracts.abandon.confirm")}
            </PixelButton>
          </div>
        </div>
      </Modal>

      <GuildExtendContractModal
        key={extendTarget?.id ?? "none"}
        contract={extendTarget}
        freeHourglassAvailable={monthlyFreeHourglass > 0}
        ownedHourglasses={hourglass}
        onClose={() => setExtendTarget(null)}
      />

      <GuildClaimCelebration
        opened={celebration !== null}
        onClose={() => setCelebration(null)}
        result={celebration}
      />
    </div>
  );
}
