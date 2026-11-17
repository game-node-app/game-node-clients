import { cn, Modal } from "#@/util";
import { Box, Button, Group, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import type { ReactNode } from "react";
import {
  AwardsCategoryList,
  type AwardsCategoryListRow,
} from "./AwardsCategoryList";
import { AwardsVoteBar } from "./AwardsVoteBar";
import { useAwardsMobileLayout } from "./useAwardsMobileLayout";

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
  /** Desktop only: rendered under the category list (e.g. "Compartilhar"). */
  listFooter?: ReactNode;
  className?: string;
}

const SEGMENT_CLASSES: Record<AwardsCategoryListRow["state"], string> = {
  voted: "bg-brand",
  active: "bg-brand-3",
  pending: "bg-paper-1",
};

/**
 * Shared responsive layout of the ballot and nominations screens. Above `md`
 * it is the 320 px list beside a surfaced panel (frame `5410:689`); below `md`
 * it follows the mobile ballot frame: segmented progress, one category at a
 * time, a fixed bottom bar slot and the category list in the injected Modal.
 */
const AwardsCategoryLayout = ({
  categories,
  onSelectCategory,
  title,
  current,
  total,
  children,
  voteBar,
  listFooter,
  className,
}: AwardsCategoryLayoutProps) => {
  const { t } = useTranslation();
  const isMobileLayout = useAwardsMobileLayout();
  const [categoriesOpened, categoriesModal] = useDisclosure(false);

  const selectCategory = (categoryId: number) => {
    onSelectCategory(categoryId);
    categoriesModal.close();
  };

  if (isMobileLayout) {
    return (
      <Stack
        data-awards-layout={"mobile"}
        className={cn("w-full", voteBar && "pb-48", className)}
        gap={"md"}
      >
        <Group justify={"space-between"} align={"center"} wrap={"nowrap"}>
          <Text className={"text-[17px] font-semibold leading-normal"}>
            {title}
          </Text>
          <Text
            className={
              "text-[12px] font-bold uppercase leading-[normal] tracking-[0.72px] text-brand-3"
            }
          >
            {t("awards.shared.progress", { current, total })}
          </Text>
        </Group>
        <Group
          data-awards-progress
          gap={4}
          wrap={"nowrap"}
          aria-hidden={"true"}
        >
          {categories.map((category) => (
            <Box
              key={category.id}
              data-awards-progress-segment
              data-state={category.state}
              className={cn(
                "h-1 flex-1 rounded-[2px]",
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
    <div
      data-awards-layout={"desktop"}
      className={cn("flex w-full items-start gap-8", className)}
    >
      <div className={"flex w-[320px] shrink-0 flex-col gap-6"}>
        <AwardsCategoryList
          categories={categories}
          onSelect={onSelectCategory}
          title={title}
          current={current}
          total={total}
        />
        {listFooter}
      </div>
      <div
        data-awards-panel-surface
        className={
          "flex min-w-0 flex-1 flex-col gap-7 rounded-[20px] border border-line bg-paper-0 p-8"
        }
      >
        {children}
        {voteBar && <AwardsVoteBar>{voteBar}</AwardsVoteBar>}
      </div>
    </div>
  );
};

export { AwardsCategoryLayout };
