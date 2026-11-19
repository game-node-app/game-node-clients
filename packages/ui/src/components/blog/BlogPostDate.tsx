import { Text, type TextProps } from "@mantine/core";
import { useI18nContext } from "@repo/locales";

interface Props extends TextProps {
  publishedAt: string;
}

export function BlogPostDate({ publishedAt, ...props }: Props) {
  const { language } = useI18nContext();
  const date = new Intl.DateTimeFormat(language, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  }).format(new Date(publishedAt));

  return (
    <Text
      component="time"
      dateTime={publishedAt}
      size="xs"
      c="dimmed"
      {...props}
    >
      {date}
    </Text>
  );
}
