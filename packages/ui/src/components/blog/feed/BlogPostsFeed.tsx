import {
  BlogPostsCategorySection,
  BlogPostsFeatured,
  DetailsBox,
  useBlogCategories,
} from "#@/components";
import { ActionIcon, Box, Popover, Stack, Text, Tooltip } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconQuestionMark } from "@tabler/icons-react";

const BlogPostsFeed = () => {
  const { t } = useTranslation();
  const categories = useBlogCategories();

  return (
    <DetailsBox
      title={""}
      stackProps={{
        className: "w-full min-h-dvh",
      }}
      rightSide={
        <Popover position={"left-end"}>
          <Popover.Target>
            <Tooltip label={t("blog.about")}>
              <ActionIcon
                variant="subtle"
                color="gray"
                aria-label={t("blog.about")}
              >
                <IconQuestionMark />
              </ActionIcon>
            </Tooltip>
          </Popover.Target>
          <Popover.Dropdown>
            <Box className={"w-full max-w-60"}>
              <Text className={"text-wrap"}>{t("blog.disclaimer")}</Text>
              <Text className={"text-sm text-dimmed text-wrap"}>
                {t("blog.contentNotice")}
              </Text>
            </Box>
          </Popover.Dropdown>
        </Popover>
      }
    >
      <BlogPostsFeatured />
      <Stack className={"w-full gap-8 mt-4"}>
        {categories.map(({ id, title }) => (
          <BlogPostsCategorySection key={id} tag={id} title={title} />
        ))}
      </Stack>
    </DetailsBox>
  );
};

export { BlogPostsFeed };
