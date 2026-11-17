import { Button } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconArrowLeft } from "@tabler/icons-react";
import { Link } from "#@/util/link";

/** Full-width "Back to Daily" link that closes the weekly and practice screens. */
const DailyBackToHubButton = () => {
  const { t } = useTranslation();
  return (
    <Button
      component={Link}
      href={"/daily"}
      variant={"default"}
      size={"lg"}
      fz={14}
      fullWidth
      leftSection={<IconArrowLeft size={16} />}
    >
      {t("daily.result.backToHub")}
    </Button>
  );
};

export { DailyBackToHubButton };
