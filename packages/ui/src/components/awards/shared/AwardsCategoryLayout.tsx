import { cn, Modal } from "#@/util";
import {
  Box,
  Button,
  Group,
  SimpleGrid,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import type { ReactNode } from "react";
import {
  AwardsCategoryList,
  type AwardsCategoryListRow,
} from "./AwardsCategoryList";
import { AwardsVoteBar } from "./AwardsVoteBar";

export interface AwardsCategoryLayoutProps {
  /** Rows of the category list, in display order. */
  categories: AwardsCategoryListRow[];
  onSelectCategory: (categoryId: number) => void;
  /** Heading of the list, e.g. "Sua cédula". */
  title: string;
  /** Progress numerator (voted categories). */
  current: number;
  /** Progress denominator (categories in the ballot/nominations). */
  total: number;
  /** Panel of the active category. */
  children: ReactNode;
  /** Vote bar slot; its actions are owned by the screen. */
  voteBar?: ReactNode;
  className?: string;
}

const SEGMENT_CLASSES: Record<AwardsCategoryListRow["state"], string> = {
  voted: "bg-brand",
  active: "bg-brand/50",
  pending: "bg-paper-4",
};

/**
 * Shared responsive layout of the ballot and nominations screens. Above `md`
 * it is the two-column list + panel; below `md` it follows the mobile ballot
 * frame: segmented progress, one category at a time, a fixed bottom bar slot
 * and the category list in the injected Modal.
 */
const AwardsCategoryLayout = ({
  categories,
  onSelectCategory,
  title,
  current,
  total,
  children,
  voteBar,
  className,
}: AwardsCategoryLayoutProps) => {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const isMobileLayout = useMediaQuery(
    `(max-width: ${theme.breakpoints.md})`,
    false,
  );
  const [categoriesOpened, categoriesModal] = useDisclosure(false);

  const selectCategory = (categoryId: number) => {
    onSelectCategory(categoryId);
    categoriesModal.close();
  };

  if (isMobileLayout) {
    return (
      <Stack
        data-awards-layout={"mobile"}
        className={cn("w-full", voteBar && "pb-24", className)}
        gap={"md"}
      >
        <Group justify={"space-between"} align={"baseline"}>
          <Text fw={600}>{title}</Text>
          <Text size={"sm"} c={"dimmed"}>
            {t("awards.shared.progress", { current, total })}
          </Text>
        </Group>
        <Group
          data-awards-progress
          gap={2}
          wrap={"nowrap"}
          aria-hidden={"true"}
        >
          {categories.map((category) => (
            <Box
              key={category.id}
              data-awards-progress-segment
              data-state={category.state}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                SEGMENT_CLASSES[category.state],
              )}
            />
          ))}
        </Group>
        <Button
          data-awards-categories-button
          variant={"default"}
          onClick={categoriesModal.open}
        >
          {t("awards.shared.categories")}
        </Button>
        <Box>{children}</Box>
        {voteBar && <AwardsVoteBar fixed>{voteBar}</AwardsVoteBar>}
        <Modal
          opened={categoriesOpened}
          onClose={categoriesModal.close}
          title={t("awards.shared.categories")}
          size={"md"}
        >
          <AwardsCategoryList
            categories={categories}
            onSelect={selectCategory}
          />
        </Modal>
      </Stack>
    );
  }

  return (
    <SimpleGrid
      data-awards-layout={"desktop"}
      className={cn("w-full", className)}
      cols={{ base: 1, md: 2 }}
      spacing={"xl"}
    >
      <Box>
        <AwardsCategoryList
          categories={categories}
          onSelect={onSelectCategory}
          title={title}
          current={current}
          total={total}
        />
      </Box>
      <Stack gap={"md"}>
        {children}
        {voteBar && <AwardsVoteBar>{voteBar}</AwardsVoteBar>}
      </Stack>
    </SimpleGrid>
  );
};

export { AwardsCategoryLayout };
