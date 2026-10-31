import { useEffect, useState } from "react";
import { Alert, Button, Stack, Text, Textarea } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";

export function McpCopy({ value, label }: { value: string; label?: string }) {
  const { t } = useTranslation();
  const clipboard = useClipboard();
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    if (clipboard.error) setFallback(true);
  }, [clipboard.error]);
  return (
    <Stack gap="xs" style={{ minWidth: 0 }}>
      <Button
        variant="light"
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
