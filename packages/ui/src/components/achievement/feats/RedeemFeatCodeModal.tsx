import { AchievementBadge } from "#@/components/achievement/AchievementBadge";
import { useFeatureFeat } from "#@/components/achievement/hooks/useFeatureFeat";
import { useRedeemFeatCode } from "#@/components/achievement/hooks/useRedeemFeatCode";
import { useAchievementsV2 } from "#@/components/achievement/hooks/useAchievementsV2";
import { formatFeatNumber } from "#@/components/achievement/util/feats";
import { BaseModalProps, getErrorMessage, Modal } from "#@/util";
import {
  Box,
  Button,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { AchievementV2Dto } from "@repo/wrapper/server";
import { IconGift, IconStar } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { FormEvent, useEffect, useRef, useState } from "react";

export interface RedeemFeatCodeModalProps extends BaseModalProps {
  targetUserId: string;
}

interface RedeemedFeat {
  achievement: AchievementV2Dto;
  tier: number;
}

/**
 * Redeems an achievement code. A rejected code keeps the dialog open with the
 * server message under the field; a successful one shows the unlocked feat,
 * or closes when the refreshed catalog does not contain it (old server).
 */
const RedeemFeatCodeModal = ({
  opened,
  onClose,
  targetUserId,
}: RedeemFeatCodeModalProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n?.resolvedLanguage || i18n?.language || "en";
  const queryClient = useQueryClient();
  const catalogQuery = useAchievementsV2(targetUserId);
  const redeemMutation = useRedeemFeatCode(targetUserId);
  const resetRedeemMutation = redeemMutation.reset;
  const featureFeatMutation = useFeatureFeat(targetUserId);

  const [code, setCode] = useState("");
  const [redeemed, setRedeemed] = useState<RedeemedFeat | null>(null);
  // Incremented whenever an opening ends, so a response from a closed opening
  // cannot reveal a feat or close the next one. The mutation itself keeps
  // running (and still notifies/invalidates) after the dialog closes.
  const openingRef = useRef(0);

  const handleClose = () => {
    openingRef.current += 1;
    setCode("");
    setRedeemed(null);
    redeemMutation.reset();
    onClose();
  };

  // The parent can also close the dialog through `opened` (navigation, another
  // sheet), bypassing `onClose`. Treat that as the end of the opening too.
  useEffect(() => {
    if (opened) return;

    openingRef.current += 1;
    // Reset form state when the parent closes the dialog, exactly the
    // external-prop synchronization effects are meant for.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- parent-controlled close
    setCode("");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- parent-controlled close
    setRedeemed(null);
    resetRedeemMutation();
  }, [opened, resetRedeemMutation]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = code.trim();
    if (!value || redeemMutation.isPending) return;

    const opening = openingRef.current;

    try {
      // The mutation resolves after the catalog refetch, so the cache below is
      // the refreshed one. `null` means an older server sent no body.
      const result = await redeemMutation.mutateAsync(value);
      if (opening !== openingRef.current) return;
      if (result == null) {
        handleClose();
        return;
      }

      const catalog =
        queryClient.getQueryData<AchievementV2Dto[]>(catalogQuery.queryKey) ??
        [];
      const achievement = catalog.find(
        (item) => item.id === result.achievementId,
      );
      if (achievement == null) {
        handleClose();
        return;
      }

      setCode("");
      setRedeemed({ achievement, tier: result.tier });
    } catch {
      // The error is rendered under the field from the mutation state.
    }
  };

  const handleFeature = () => {
    if (redeemed == null) return;

    const opening = openingRef.current;
    featureFeatMutation.mutate(redeemed.achievement.id, {
      onSuccess: () => {
        if (opening === openingRef.current) handleClose();
      },
    });
  };

  const grantedXp =
    redeemed?.achievement.tiers.find((tier) => tier.level === redeemed.tier)
      ?.expReward ?? 0;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={redeemed ? t("achievements.redeem.newFeat") : undefined}
      breakpoints={[0, 0.75, 1]}
      initialBreakpoint={0.75}
      size={"md"}
      centered
    >
      {redeemed ? (
        <Stack align={"center"} gap={"sm"} py={"sm"}>
          <AchievementBadge
            icon={redeemed.achievement.icon}
            tier={redeemed.tier}
            size={96}
            variant={"tile"}
          />
          <Title order={3} ta={"center"} className={"break-words"}>
            {redeemed.achievement.name}
          </Title>
          <Text fz={14} c={"dimmed"} ta={"center"}>
            {redeemed.achievement.description}
          </Text>
          <Text fz={22} fw={700} c={"brand"} lh={"normal"}>
            {t("achievements.redeem.xp", {
              xp: formatFeatNumber(grantedXp, locale),
            })}
          </Text>
          <Button fullWidth mt={"sm"} onClick={handleClose}>
            {t("achievements.redeem.viewFeats")}
          </Button>
          {redeemed.tier > 0 && (
            <Button
              variant={"default"}
              fullWidth
              leftSection={<IconStar size={18} />}
              loading={featureFeatMutation.isPending}
              onClick={handleFeature}
            >
              {t("achievements.featured.action")}
            </Button>
          )}
        </Stack>
      ) : (
        <form onSubmit={handleSubmit}>
          <Stack gap={"md"}>
            <Box
              className={
                "flex h-14 w-14 items-center justify-center rounded-[14px] border border-brand-7 bg-brand-0/10 text-brand"
              }
            >
              <IconGift size={28} />
            </Box>
            <Title order={3} fz={22} lh={"normal"} className={"break-words"}>
              {t("achievements.redeem.title")}
            </Title>
            <Text fz={13} c={"dimmed"} lh={"normal"}>
              {t("achievements.redeem.help")}
            </Text>
            <TextInput
              data-autofocus
              label={t("achievements.redeem.codeLabel")}
              placeholder={t("achievements.redeem.codePlaceholder")}
              description={t("achievements.redeem.codeFormat")}
              value={code}
              disabled={redeemMutation.isPending}
              onChange={(event) => {
                setCode(event.currentTarget.value);
                if (redeemMutation.isError) redeemMutation.reset();
              }}
              error={
                redeemMutation.isError
                  ? getErrorMessage(redeemMutation.error)
                  : undefined
              }
              styles={{
                input: {
                  fontFamily: "monospace",
                  letterSpacing: "0.12em",
                },
              }}
            />
            <Group justify={"flex-end"} gap={"sm"}>
              <Button
                variant={"default"}
                disabled={redeemMutation.isPending}
                onClick={handleClose}
              >
                {t("achievements.redeem.cancel")}
              </Button>
              <Button
                type={"submit"}
                disabled={!code.trim()}
                loading={redeemMutation.isPending}
              >
                {t("achievements.redeem.submit")}
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Modal>
  );
};

export { RedeemFeatCodeModal };
