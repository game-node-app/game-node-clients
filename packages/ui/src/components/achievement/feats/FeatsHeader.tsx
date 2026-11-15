import { Link } from "#@/util";
import { Group, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconChevronRight } from "@tabler/icons-react";

export interface FeatsHeaderProps {
  userId: string;
}

/**
 * Breadcrumb, title and subtitle of the Feats page. The breadcrumb links back
 * to the viewed user's profile.
 */
const FeatsHeader = ({ userId }: FeatsHeaderProps) => {
  const { t } = useTranslation();

  return (
    <Stack gap={4}>
      <Group gap={8} wrap={"nowrap"}>
        <Link
          href={`/profile/${userId}`}
          className={
            "text-[13px] leading-normal text-[#8c8c8c] hover:text-white"
          }
        >
          {t("achievements.page.breadcrumbProfile")}
        </Link>
        <IconChevronRight size={14} className={"text-[#8c8c8c]"} />
        <Text fz={13} lh={"normal"} className={"text-[#d0d0d0]"} fw={500}>
          {t("achievements.page.breadcrumbFeats")}
        </Text>
      </Group>
      <Title
        order={1}
        className={
          "text-[28px] font-bold leading-[34px] tracking-[-0.28px] text-white lg:text-[32px]"
        }
      >
        {t("achievements.page.title")}
      </Title>
      <Text fz={14} lh={"21px"} className={"text-[#a6a6a6]"}>
        {t("achievements.page.subtitle")}
      </Text>
    </Stack>
  );
};

export { FeatsHeader };
