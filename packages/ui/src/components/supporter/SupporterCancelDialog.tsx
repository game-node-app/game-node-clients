import { Alert, Button, Group, Stack, Text } from "@mantine/core";
import dayjs from "dayjs";
import { useTranslation } from "@repo/locales";
import { Modal } from "#@/util";

export interface SupporterCancelDialogProps {
  opened: boolean;
  onClose: () => void;
  periodEnd: string | null;
  isPending: boolean;
  error: string | null;
  onConfirm: () => void;
}

/**
 * Confirmation for cancelling a subscription. Nothing is mutated until the
 * user confirms, and the dialog stays open with the inline error when the
 * server rejects the cancellation.
 */
export function SupporterCancelDialog({
  opened,
  onClose,
  periodEnd,
  isPending,
  error,
  onConfirm,
}: SupporterCancelDialogProps) {
  const { t } = useTranslation();

  const formattedPeriodEnd = periodEnd
    ? dayjs(periodEnd).format(t("supporter.billing.dateFormat"))
    : "";

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("supporter.cancelDialog.title")}
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {t("supporter.cancelDialog.description", {
            date: formattedPeriodEnd,
          })}
        </Text>

        {error && (
          <Alert
            color="red"
            variant="light"
            data-testid="supporter-cancel-error"
          >
            {error}
          </Alert>
        )}

        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onClose} disabled={isPending}>
            {t("supporter.cancelDialog.keep")}
          </Button>
          <Button
            color="red"
            onClick={onConfirm}
            loading={isPending}
            disabled={isPending}
          >
            {t("supporter.cancelDialog.confirm")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
