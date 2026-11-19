import { Group, Text, UnstyledButton } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { Link, RecentActivityList } from "@repo/ui";
import { Activity } from "@repo/wrapper/server";
import { IconChevronRight } from "@tabler/icons-react";

interface HomeActivityShelfProps {
  title: string;
  type?: Activity.type;
  /** Where "See more" goes. Omit to hide the link. */
  seeMoreHref?: string;
  limit?: number;
}

/**
 * Mobile home shelf: a titled, horizontally scrolling row of compact activity cards.
 * Replaces long vertical lists so the home page stays short.
 */
const HomeActivityShelf = ({
  title,
  type,
  seeMoreHref,
  limit = 8,
}: HomeActivityShelfProps) => {
  const { t } = useTranslation();

  return (
    <section className={"flex w-full flex-col gap-2"}>
      <Group justify={"space-between"} wrap={"nowrap"}>
        <Text fw={700} size={"lg"} className={"truncate"}>
          {title}
        </Text>
        {seeMoreHref && (
          <Link href={seeMoreHref} className={"shrink-0"}>
            <UnstyledButton
              component={"span"}
              className={"flex items-center gap-0.5 text-sm text-dimmed"}
            >
              {t("actions.seeMore")}
              <IconChevronRight size={16} />
            </UnstyledButton>
          </Link>
        )}
      </Group>
      <RecentActivityList layout={"carousel"} limit={limit} type={type} />
    </section>
  );
};

export { HomeActivityShelf };
