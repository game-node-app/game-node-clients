import {
  ProfileAvatarSectionButtons,
  useOnMobilePlatform,
} from "#@/components";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { UserAvatar } from "#@/components/general/avatar/UserAvatar";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { ProfileEditForm } from "#@/components/profile/edit/ProfileEditForm";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { ProfileBanner } from "#@/components/profile/view/ProfileBanner";
import { ProfileUserInfo } from "#@/components/profile/view/ProfileUserInfo";
import { useSupporterPerks } from "#@/components/supporter/hooks/useSupporterPerks";
import { SupporterAvatarFrame } from "#@/components/supporter/perks/SupporterAvatarFrame";
import { SupporterBadge } from "#@/components/supporter/perks/SupporterBadge";
import { SupporterPresenceChip } from "#@/components/supporter/perks/SupporterPresenceChip";
import { SupporterTitle } from "#@/components/supporter/perks/SupporterTitle";
import { Modal } from "#@/util";
import { Box, Group, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { CSSProperties, PropsWithChildren } from "react";

interface ProfileUserInfoWithBannerProps extends PropsWithChildren {
  userId: string;
}

/**
 * Wrapper component that renders both ProfileUserInfo and ProfileBanner. <br>
 * Also features edit modals for username and avatar.
 *
 * @constructor
 * @param userId - target user id
 * @param children - items to be rendered on the RIGHT side of the ProfileUserInfo component for desktop,
 * and BELOW it for mobile.
 */

const ProfileUserInfoWithBanner = ({
  userId,
  children,
}: ProfileUserInfoWithBannerProps) => {
  useUserId();

  const { t } = useTranslation();
  const onMobile = useOnMobile();
  const onMobilePlatform = useOnMobilePlatform();
  const profileQuery = useUserProfile(userId);
  const perks = useSupporterPerks(userId);

  const [editModalOpened, editModalUtils] = useDisclosure();

  const supporterVars = perks
    ? ({
        "--supporter-accent": perks.accent,
        "--supporter-accent-text": perks.accentText,
        "--supporter-accent-soft": perks.accentSoft,
        "--supporter-accent-border": perks.accentBorder,
      } as CSSProperties)
    : undefined;
  // The tint covers the whole left column on both platforms, so the avatar,
  // name block, actions, bio and the info presenter all sit on it with no hard
  // vertical edge. Web keeps the existing #151515 panel; mobile fades into the
  // #111111 page background.
  const infoColumnStyle: CSSProperties | undefined = perks?.theme
    ? ({
        "--supporter-tint-end": onMobilePlatform ? "#111111" : "#151515",
        background:
          "linear-gradient(180deg, var(--supporter-accent-soft) 0px, var(--supporter-tint-end) 240px)",
      } as CSSProperties)
    : undefined;

  return (
    <Stack
      id={"profile-user-info-banner"}
      className={"h-full gap-0 w-dvw max-w-full relative"}
      style={supporterVars}
    >
      <Modal
        opened={editModalOpened}
        onClose={editModalUtils.close}
        title={"Edit profile"}
        fullScreen={onMobile}
      >
        <ProfileEditForm userId={userId} />
      </Modal>
      <ProfileBanner userId={userId}>
        {perks?.theme && (
          <Box
            data-testid={"supporter-theme-strip"}
            className={
              // Web: cancel the banner's p-4 so the strip spans the banner
              // container edge to edge. Mobile: the banner is already
              // full-bleed, so the strip just fills it.
              "relative flex h-[21px] shrink-0 items-center justify-end pe-6 -mx-4 mobile:mx-0 mobile:w-full"
            }
            style={{ backgroundColor: "var(--supporter-accent)" }}
          >
            <Text
              fz={10}
              fs={"italic"}
              fw={500}
              lh={"normal"}
              style={{ color: perks.onAccent }}
            >
              {t("supporter.badge.label")}
            </Text>
          </Box>
        )}
      </ProfileBanner>

      <Group
        className={"w-full justify-start items-start flex-wrap lg:flex-nowrap"}
      >
        <Stack
          data-testid={"profile-info-column"}
          className={
            "w-full lg:w-1/4 lg:min-w-52  gap-0 relative web:bg-[#151515]"
          }
          style={infoColumnStyle}
        >
          <Group
            className={
              "w-full justify-center flex-nowrap mobile:justify-between"
            }
          >
            <Stack
              className={"w-full items-center relative mobile:items-start"}
            >
              <Box className={"w-fit h-8 mobile:h-3 mobile:ps-2"}>
                <Box className={"relative z-10 w-fit h-fit -translate-y-3/4"}>
                  {perks?.border ? (
                    <SupporterAvatarFrame accent={perks.accent}>
                      <UserAvatar
                        userId={userId}
                        size={onMobilePlatform ? "8rem" : "10rem"}
                      />
                    </SupporterAvatarFrame>
                  ) : (
                    <UserAvatar
                      className={"relative border-[#161616] border-4"}
                      userId={userId}
                      size={onMobilePlatform ? "8rem" : "10rem"}
                    />
                  )}
                </Box>
              </Box>
              <Stack
                gap={4}
                maw={"18rem"}
                align={onMobilePlatform ? "flex-start" : "center"}
                className={onMobilePlatform ? "ps-2" : undefined}
              >
                <Group gap={6} wrap={"nowrap"}>
                  <Text
                    className={
                      "text-center text-white mobile:font-bold mobile:text-xl"
                    }
                  >
                    {profileQuery.data?.username}
                  </Text>
                  {perks?.badge && (
                    <SupporterBadge variant={"full"} perks={perks} />
                  )}
                </Group>
                {perks?.titleKey && (
                  <SupporterTitle titleKey={perks.titleKey} perks={perks} />
                )}
                {perks?.liveProfile && (
                  <SupporterPresenceChip userId={userId} perks={perks} />
                )}
              </Stack>
            </Stack>
            {onMobilePlatform && (
              <ProfileAvatarSectionButtons
                userId={userId}
                onEditClick={editModalUtils.open}
              />
            )}
          </Group>
          {onMobilePlatform && (
            <Text className={"my-3"}>{profileQuery.data?.bio}</Text>
          )}
          <ProfileUserInfo
            userId={userId}
            onEditClick={editModalUtils.open}
            withEditDetailsButton={!onMobilePlatform}
          />
        </Stack>

        <Stack className={"lg:items-start w-full lg:w-3/4 p-1 lg:p-3"}>
          {children}
        </Stack>
      </Group>
    </Stack>
  );
};

export { ProfileUserInfoWithBanner };
