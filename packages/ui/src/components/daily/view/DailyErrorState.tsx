import { Button } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconCloudOff, IconRefresh } from "@tabler/icons-react";
import { ErrorState } from "#@/components/general/ErrorState";
import { Link } from "#@/util/link";

interface Props {
  onRetry: () => void;
  retrying?: boolean;
  backHref: string;
  backLabel: string;
}

/**
 * Shown when the Daily API can't be reached.
 */
const DailyErrorState = ({ onRetry, retrying, backHref, backLabel }: Props) => {
  const { t } = useTranslation();

  return (
    <ErrorState
      icon={IconCloudOff}
      title={t("daily.fetchError")}
      description={t("daily.fetchErrorDescription")}
      actions={
        <>
          <Button
            leftSection={<IconRefresh size={18} />}
            loading={retrying}
            onClick={onRetry}
          >
            {t("actions.retry")}
          </Button>
          <Button component={Link} href={backHref} variant={"default"}>
            {backLabel}
          </Button>
        </>
      }
    />
  );
};

export { DailyErrorState };
