import { UserAvatar } from "#@/components/general/avatar/UserAvatar";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { useUserLevel } from "#@/components/user-level/hooks/useUserLevel";
import { useTranslation } from "@repo/locales";
import { Badge, Box, Flex, Group, Progress, Stack, Text } from "@mantine/core";
import { formatFeatLongDate, formatFeatNumber } from "../util/feats";

export interface FeatsProfileCardProps {
  userId: string;
}

/**
 * Profile card of the Feats page: avatar with a level ring and pill, username,
 * current level, XP missing for the next level, experience bar and join date.
 */
const FeatsProfileCard = ({ userId }: FeatsProfileCardProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n?.resolvedLanguage || i18n?.language;

  const profileQuery = useUserProfile(userId);
  const levelQuery = useUserLevel(userId);

  const profile = profileQuery.data;
  const level = levelQuery.data;

  const currentLevel = level?.currentLevel ?? 1;
  const currentExp = level?.currentLevelExp ?? 0;
  const requiredExp = level?.levelUpExpCost ?? 0;
  const missingExp = Math.max(requiredExp - currentExp, 0);
  const levelProgress =
    requiredExp > 0 ? Math.min((currentExp / requiredExp) * 100, 100) : 0;

  const joinedAt = profile?.createdAt
    ? formatFeatLongDate(profile.createdAt, locale)
    : undefined;

  return (
    <Box
      className={
        "relative h-full overflow-hidden rounded-2xl border border-paper-4 bg-paper-7 p-5 lg:p-6"
      }
    >
      <Box
        aria-hidden
        className={
          "pointer-events-none absolute -right-16 -top-32 size-[360px] rounded-full"
        }
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--gn-brand) 22%, transparent) 0%, color-mix(in srgb, var(--gn-brand) 0%, transparent) 70%)",
        }}
      />

      <Flex
        gap={{ base: 16, sm: 24 }}
        align={{ base: "flex-start", sm: "center" }}
        className={"relative"}
      >
        <Stack gap={8} align={"center"} className={"shrink-0"}>
          <Box
            className={
              "h-[76px] w-[76px] rounded-full p-[3px] sm:h-[112px] sm:w-[112px]"
            }
            style={{
              background: `conic-gradient(var(--gn-brand) ${levelProgress}%, var(--gn-line) ${levelProgress}% 100%)`,
            }}
          >
            <Box
              className={
                "h-full w-full overflow-hidden rounded-full border-[3px] border-paper-7 bg-paper-8"
              }
            >
              <UserAvatar
                userId={userId}
                size={"100%"}
                className={"!h-full !w-full"}
              />
            </Box>
          </Box>
          {/* Below the ring, never over it: an absolutely positioned pill was
              also squeezed to the ring's half-width and truncated its label. */}
          <Badge
            variant={"light"}
            color={"brand"}
            radius={"xl"}
            size={"sm"}
            data-testid={"feats-profile-level-badge"}
            className={"whitespace-nowrap"}
          >
            {t("achievements.page.level", { level: currentLevel })}
          </Badge>
        </Stack>

        <Stack gap={4} className={"min-w-0 flex-1"}>
          <Text
            fz={{ base: 18, sm: 22 }}
            fw={700}
            lh={"normal"}
            className={"text-foreground"}
            lineClamp={1}
          >
            {profile?.username ?? ""}
          </Text>

          <Flex gap={8} wrap={"wrap"} align={"baseline"}>
            <Text
              fz={{ base: 22, sm: 32 }}
              fw={700}
              lh={"normal"}
              className={"text-brand"}
            >
              {t("achievements.page.level", { level: currentLevel })}
            </Text>
            <Text fz={13} lh={"normal"} className={"text-soft"}>
              {t("achievements.page.xpToNextLevel", {
                xp: formatFeatNumber(missingExp, locale),
                level: currentLevel + 1,
              })}
            </Text>
          </Flex>

          <Flex justify={"flex-end"} mt={4}>
            <Group justify={"space-between"} gap={8} wrap={"nowrap"} w={"100%"}>
              <Text fz={13} lh={"normal"} className={"text-soft"}>
                {t("achievements.page.experience")}
              </Text>
              <Text
                fz={13}
                fw={600}
                lh={"normal"}
                className={"text-foreground"}
              >
                {t("achievements.page.xpProgress", {
                  current: formatFeatNumber(currentExp, locale),
                  required: formatFeatNumber(requiredExp, locale),
                })}
              </Text>
            </Group>
          </Flex>

          <Progress
            value={levelProgress}
            color={"brand"}
            radius={"xl"}
            size={8}
            mt={4}
            aria-label={t("achievements.page.xpProgress", {
              current: formatFeatNumber(currentExp, locale),
              required: formatFeatNumber(requiredExp, locale),
            })}
          />

          {joinedAt && (
            <Text fz={12} lh={"normal"} className={"text-faint"} mt={4}>
              {t("achievements.page.joinedAt", { date: joinedAt })}
            </Text>
          )}
        </Stack>
      </Flex>
    </Box>
  );
};

export { FeatsProfileCard };
