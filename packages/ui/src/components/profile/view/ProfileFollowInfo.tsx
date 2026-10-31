import { useInfiniteFollowInfo } from "#@/components/follow/hooks/useInfiniteFollowInfo";
import { FollowInfoListModal } from "#@/components/follow/modal/FollowInfoListModal";
import { Box, Text, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { FollowInfoRequestDto } from "@repo/wrapper/server";

interface Props {
  targetUserId: string;
  criteria: FollowInfoRequestDto.criteria;
}

const ProfileFollowInfo = ({ targetUserId, criteria }: Props) => {
  const { t } = useTranslation();
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
    <Box>
      <FollowInfoListModal
        targetUserId={targetUserId}
        criteria={criteria}
        opened={modalOpened}
        onClose={modalUtils.close}
      />
      <UnstyledButton
        onClick={() => {
          modalUtils.open();
        }}
        className={
          "mobile:flex mobile:flex-row mobile:items-center mobile:gap-2"
        }
      >
        <Text className={"text-white text-center mobile:font-bold"}>
          {totalItems}
        </Text>
        <Text className={"text-dimmed"}>{criteriaText}</Text>
      </UnstyledButton>
    </Box>
  );
};

export { ProfileFollowInfo };