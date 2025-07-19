import React from "react";
import {
  CenteredLoading,
  DetailsBox,
  DetailsBoxProps,
  GameRating,
  ReviewListItem,
  useCollectionEntry,
  useOnMobile,
  useReviewForUserIdAndGameId,
  useUserProfile,
} from "#@/components";
import { ActionIcon, Stack, Text } from "@mantine/core";
import { IconEye, IconEyeClosed } from "@tabler/icons-react";
import { Modal } from "#@/util";
import { useDisclosure } from "@mantine/hooks";

interface Props extends Omit<DetailsBoxProps, "title"> {
  userId: string;
  collectionEntryId: string;
}

const CollectionEntryReviewBox = ({
  userId,
  collectionEntryId,
  ...others
}: Props) => {
  const profileQuery = useUserProfile(userId);
  const onMobile = useOnMobile();
  const [reviewOpened, reviewOpenedUtils] = useDisclosure();
  const collectionEntryQuery = useCollectionEntry(collectionEntryId);
  const reviewQuery = useReviewForUserIdAndGameId(
    userId,
    collectionEntryQuery.data?.gameId,
  );

  const isLoading = collectionEntryQuery.isLoading || reviewQuery.isLoading;

  return (
    <DetailsBox
      title={"Review"}
      withPadding
      withBorder
      {...others}
      rightSide={
        reviewQuery.data != undefined && (
          <ActionIcon
            onClick={reviewOpenedUtils.open}
            className="relative group"
          >
            <IconEyeClosed className="transition-opacity duration-200 ease-in-out opacity-0 hidden lg:block lg:opacity-100 group-hover:opacity-0 group-hover:hidden" />
            <IconEye className="transition-opacity duration-200 ease-in-out opacity-100 lg:opacity-0 lg:hidden group-hover:opacity-100 group-hover:block lg:absolute" />
          </ActionIcon>
        )
      }
    >
      {isLoading && <CenteredLoading />}
      {reviewQuery.data && (
        <Modal
          title={`${profileQuery.data?.username}'s review`}
          opened={reviewOpened}
          onClose={reviewOpenedUtils.close}
          size={"xl"}
          fullScreen={onMobile}
        >
          <ReviewListItem review={reviewQuery.data} />
        </Modal>
      )}
      <Stack className={"items-center w-full"}>
        <GameRating value={reviewQuery.data?.rating} size={"lg"} />
        {reviewQuery.data == undefined && (
          <Text className={"text-center text-dimmed text-sm"}>
            No review found for this game.
          </Text>
        )}
      </Stack>
    </DetailsBox>
  );
};

export { CollectionEntryReviewBox };
