import { Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { cn } from "#@/util";

export interface ReviewsAlwaysPublicNoteProps {
  className?: string;
}

/**
 * Reminder shown next to the visibility control: reviews are not affected by
 * library visibility.
 */
export function ReviewsAlwaysPublicNote({
  className,
}: ReviewsAlwaysPublicNoteProps) {
  const { t } = useTranslation();

  return (
    <Text size={"xs"} c={"dimmed"} className={cn(className)}>
      {t("libraryVisibility.notes.reviewsAlwaysPublic")}
    </Text>
  );
}
