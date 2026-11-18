import { useInfiniteFollowInfo } from "#@/components/follow/hooks/useInfiniteFollowInfo";
import { FollowInfoListModal } from "#@/components/follow/modal/FollowInfoListModal";
import { Group, Text, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useI18nContext, useTranslation } from "@repo/locales";
import { FollowInfoRequestDto } from "@repo/wrapper/server";

interface Props {
  targetUserId: string;
  criteria: FollowInfoRequestDto.criteria;
}

const ProfileFollowInfo = ({ targetUserId, criteria }: Props) => {
  const { t } = useTranslation();
  const { language } = useI18nContext();
  const [modalOpened, modalUtils] = useDisclosure();
  const followInfoQuery = useInfiniteFollowInfo({
    criteria,
    targetUserId,
  });
  const totalItems = followInfoQuery.data?.pages[0]?.pagination.totalItems ?? 0;

  const criteriaText =
    criteria === "followers"
      ? t("follow.titles.followers")
      : t("follow.titles.following");

  return (
    <>
      {modalOpened && (
        <FollowInfoListModal
          targetUserId={targetUserId}
          criteria={criteria}
          opened={modalOpened}
          onClose={modalUtils.close}
        />
      )}
      <UnstyledButton
        onClick={modalUtils.open}
        className="rounded-sm hover:underline"
      >
        <Group gap={4}>
          <Text component="span" size="sm" fw={600}>
            {followInfoQuery.isSuccess
              ? totalItems.toLocaleString(language)
              : "—"}
          </Text>
          <Text component="span" size="sm" c="dimmed">
            {criteriaText}
          </Text>
        </Group>
      </UnstyledButton>
    </>
  );
};

export { ProfileFollowInfo };
