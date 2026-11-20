import { Button, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";

interface Props {
  query: string;
  scope: "library" | "collection";
  onClear: () => void;
}

const LibrarySearchEmptyState = ({ query, scope, onClear }: Props) => {
  const { t } = useTranslation();

  return (
    <Stack align="center" gap="xs" className="w-full py-10 text-center">
      <Title order={3} size="h4" c="white" className="break-words max-w-full">
        {t("library.search.noResultsTitle", { query })}
      </Title>
      <Text c="dimmed">
        {scope === "collection"
          ? t("library.search.noResultsHintCollection")
          : t("library.search.noResultsHintLibrary")}
      </Text>
      <Button variant="default" onClick={onClear}>
        {t("library.search.clear")}
      </Button>
    </Stack>
  );
};

export { LibrarySearchEmptyState };
