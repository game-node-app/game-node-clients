import { ListEmptyState } from "@/components/general/card";
import { IonButton } from "@ionic/react";
import { useTranslation } from "@repo/locales";
import { ProfileReviewListEmptyProps, useRouter } from "@repo/ui";
import { IconMessageStar } from "@tabler/icons-react";

/** Empty reviews list. The owner gets a call to action that leads to the game search. */
const MobileProfileReviewListEmpty = ({
  isOwn,
}: ProfileReviewListEmptyProps) => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <ListEmptyState
      className="mx-0"
      icon={<IconMessageStar size={28} />}
      title={
        isOwn
          ? t("profile.messages.noReviewsOwn")
          : t("profile.messages.noReviews")
      }
      action={
        isOwn ? (
          <IonButton shape="round" onClick={() => void router.push("/search")}>
            {t("profile.messages.reviewAGame")}
          </IonButton>
        ) : undefined
      }
    />
  );
};

export { MobileProfileReviewListEmpty };
