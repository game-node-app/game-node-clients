import { Badge, Group, Stack } from "@mantine/core";
import { DailyImageHint } from "#@/components/daily/hint/DailyImageHint";

interface Props {
  keywords: string[];
  imageTokens: string[];
}

const DailyKeywordsHint = ({ keywords, imageTokens }: Props) => {
  return (
    <Stack className={"w-full"}>
      <Group className={"gap-2"}>
        {keywords.map((keyword) => (
          <Badge key={keyword} variant={"light"} color={"gray"} size={"lg"}>
            {keyword}
          </Badge>
        ))}
      </Group>
      <DailyImageHint key={imageTokens.length} tokens={imageTokens} />
    </Stack>
  );
};

export { DailyKeywordsHint };
