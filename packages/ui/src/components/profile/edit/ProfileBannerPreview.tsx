import { useSupporterPerks } from "#@/components/supporter/hooks/useSupporterPerks";
import { SupporterAvatarFrame } from "#@/components/supporter/perks/SupporterAvatarFrame";
import { UserAvatar } from "#@/components/general/avatar/UserAvatar";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { PROFILE_BANNER_IMAGE_STYLE } from "#@/components/profile/util/profileBannerLayout";
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
  const viewport = mobile ? 390 : 1280;
  const scale = Math.max(0, width - 2) / viewport;
  const avatarSize = mobile ? 128 : 160;
  const avatarOuterSize = avatarSize + (perks?.border ? 18 : 0);
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
        border: perks?.border ? undefined : "4px solid #161616",
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
            background: "#161616",
          }}
        >
          <Box
            style={{
              height: 192,
              ...PROFILE_BANNER_IMAGE_STYLE,
              backgroundImage: `url(${src})`,
            }}
          />
          {perks?.theme && (
            <Box style={{ height: 21, backgroundColor: perks.accent }}>
              <Text ta="right" pr={24} fz={10} fs="italic" c={perks.onAccent}>
                {t("supporter.badge.label")}
              </Text>
            </Box>
          )}
          <Box
            style={{
              position: "relative",
              width: mobile ? viewport - 48 : viewport / 4,
              marginLeft: mobile ? 24 : 0,
              marginTop: -avatarOuterSize * 0.75,
            }}
          >
            <Box
              style={{
                width: "fit-content",
                margin: mobile ? undefined : "0 auto",
              }}
            >
              {perks?.border ? (
                <SupporterAvatarFrame accent={perks.accent} animated={false}>
                  {avatar}
                </SupporterAvatarFrame>
              ) : (
                avatar
              )}
            </Box>
            <Text
              ta={mobile ? "left" : "center"}
              style={{
                paddingTop: 8,
                overflowWrap: "anywhere",
                fontSize: 16,
                lineHeight: 1.5,
              }}
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
