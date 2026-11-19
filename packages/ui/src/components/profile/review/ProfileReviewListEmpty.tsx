import { buildPresenterComponent } from "#@/context";
import { Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";

export interface ProfileReviewListEmptyProps {
  /** Whether the empty list belongs to the signed-in user. */
  isOwn: boolean;
}

const DEFAULT_ProfileReviewListEmpty = ({
  isOwn,
}: ProfileReviewListEmptyProps) => {
  const { t } = useTranslation();
  return (
    <Text className={"text-center"}>
      {isOwn
        ? t("profile.messages.noReviewsOwn")
        : t("profile.messages.noReviews")}
    </Text>
  );
};

const ProfileReviewListEmpty = buildPresenterComponent(
  "ProfileReviewListEmpty",
  DEFAULT_ProfileReviewListEmpty,
);

export { ProfileReviewListEmpty };
