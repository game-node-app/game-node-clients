import { useSupporterPerks } from "#@/components/supporter/hooks/useSupporterPerks";
import { SupporterAvatarFrame } from "#@/components/supporter/perks/SupporterAvatarFrame";
import { UserAvatar } from "#@/components/general/avatar/UserAvatar";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import {
  PROFILE_BANNER_DESKTOP_SIZE,
  PROFILE_BANNER_IMAGE_STYLE,
  PROFILE_BANNER_MOBILE_SIZE,
} from "#@/components/profile/util/profileBannerLayout";
import { Box, SimpleGrid, Stack, Text } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";

/** Scale whole reference viewports, so banner height and avatar occlusion stay accurate. */
function DevicePreview({
  userId,
  src,
  mobile,
}: {
  userId: string;
  src: string;
  mobile: boolean;
}) {
  const { t } = useTranslation();
  const profile = useUserProfile(userId);
  const perks = useSupporterPerks(userId);
  const { ref, width } = useElementSize();
  const { ref: sceneRef, height: sceneHeight } = useElementSize();
  const size = mobile
    ? PROFILE_BANNER_MOBILE_SIZE
    : PROFILE_BANNER_DESKTOP_SIZE;
  const viewport = size.width;
  const scale = Math.max(0, width - 2) / viewport;
  const avatarSize = mobile ? 96 : 150;
  const avatarOuterSize = avatarSize + (perks?.border ? (mobile ? 12 : 18) : 8);
  // Preview the same poster in both devices; independently playing avatar
  // videos can show unrelated frames and obscure the banner comparison.
  const avatar = (
    <UserAvatar
      userId={userId}
      profile={{ avatar: profile.data?.avatar ?? null, avatarVideo: null }}
      size={avatarSize}
      style={{
        width: avatarSize,
        height: avatarSize,
        minWidth: avatarSize,
        border: perks?.border ? undefined : "4px solid var(--gn-paper-0)",
      }}
    />
  );
  return (
    <Stack gap={8} miw={0}>
      <Text size="sm" fw={600}>
        {t(mobile ? "profile.bannerEditor.mobile" : "profile.bannerEditor.web")}
      </Text>
      <Box
        ref={ref}
        w="100%"
        style={{
          overflow: "hidden",
          borderRadius: 10,
          border: "1px solid var(--mantine-color-default-border)",
          maxWidth: mobile ? viewport : undefined,
          height: sceneHeight ? sceneHeight * scale + 2 : undefined,
        }}
      >
        <Box
          ref={sceneRef}
          style={{
            width: viewport,
            paddingBottom: 16,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            background: "var(--gn-paper-0)",
          }}
        >
          <Box
            style={{
              position: "relative",
              height: size.height,
              ...PROFILE_BANNER_IMAGE_STYLE,
              backgroundImage: `url(${src})`,
            }}
          >
            <Box className="absolute inset-0 bg-gradient-to-t from-media-scrim/60 via-transparent to-transparent" />
            {perks?.theme && (
              <Box
                className="absolute inset-x-0 bottom-0 flex items-center justify-end px-4"
                style={{
                  height: mobile ? 24 : 28,
                  backgroundColor: perks.accent,
                }}
              >
                <Text size="sm" fw={600} c={perks.onAccent}>
                  {t("supporter.badge.label")}
                </Text>
              </Box>
            )}
          </Box>
          <Box
            pos="relative"
            px={mobile ? 16 : 32}
            pt={mobile ? 54 : 16}
            mih={mobile ? undefined : 100}
          >
            <Box
              pos="absolute"
              style={{
                insetInlineStart: mobile ? 16 : 32,
                top: -avatarOuterSize * 0.6,
              }}
            >
              {perks?.border ? (
                <SupporterAvatarFrame
                  accent={perks.accent}
                  animated={false}
                  className={mobile ? "!p-[3px]" : undefined}
                >
                  {avatar}
                </SupporterAvatarFrame>
              ) : (
                avatar
              )}
            </Box>
            <Text
              style={{
                marginInlineStart: mobile ? 0 : 192,
                overflowWrap: "anywhere",
              }}
              fz={32}
              fw={500}
              lh={1}
            >
              {profile.data?.username}
            </Text>
          </Box>
        </Box>
      </Box>
    </Stack>
  );
}

export function ProfileBannerPreview({
  userId,
  src,
}: {
  userId: string;
  src: string;
}) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
      <DevicePreview userId={userId} src={src} mobile={false} />
      <DevicePreview userId={userId} src={src} mobile />
    </SimpleGrid>
  );
}
