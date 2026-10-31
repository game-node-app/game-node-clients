import { useEffect, useState } from "react";
import { Alert, Button, Stack, Text, Textarea } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { IconCopy } from "@tabler/icons-react";

export function McpCopy({ value, label }: { value: string; label?: string }) {
  const { t } = useTranslation();
  const clipboard = useClipboard();
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    if (clipboard.error) setFallback(true);
  }, [clipboard.error]);
  return (
    <Stack gap="xs" align="flex-start" style={{ minWidth: 0 }}>
      <Button
        variant="light"
        leftSection={<IconCopy size={16} />}
        onClick={() => {
          clipboard.reset();
          setFallback(false);
          try {
            clipboard.copy(value);
          } catch {
            setFallback(true);
          }
        }}
      >
        {label || t("mcp.copy")}
      </Button>
      <Text role="status" size="sm">
        {clipboard.copied && !clipboard.error ? t("mcp.copied") : ""}
      </Text>
      {fallback && (
        <>
          <Alert color="red" role="alert">
            {t("mcp.copyError")}
          </Alert>
          <Textarea
            w="100%"
            label={t("mcp.copyContent")}
            value={value}
            readOnly
            autosize
            minRows={3}
            maxRows={12}
            onFocus={(event) => event.currentTarget.select()}
          />
        </>
      )}
    </Stack>
  );
}
