import { GameView, GameViewLayoutOption } from "#@/components";
import { Chip, Group } from "@mantine/core";
import { useTranslation } from "@repo/locales";

interface Props {
  includeExtraContent: boolean;
  onExtraContentChange: (includeExtraContent: boolean) => void;
  onLayoutChange?: (layout: GameViewLayoutOption) => void;
}

const GameSearchViewActions = ({
  includeExtraContent,
  onExtraContentChange,
  onLayoutChange,
}: Props) => {
  const { t } = useTranslation();
  return (
    <Group className={"w-full gap-sm"}>
      {onLayoutChange && (
        <GameView.LayoutSwitcher mode={"chip"} setLayout={onLayoutChange} />
      )}
      <Chip
        variant={"outline"}
        checked={includeExtraContent}
        onChange={onExtraContentChange}
        classNames={{
          label:
            "!border-transparent !bg-paper-1 data-[checked]:!border-brand/55 data-[checked]:!bg-brand/20 data-[checked]:!text-white",
        }}
      >
        {t("library.labels.showDLCs")}
      </Chip>
    </Group>
  );
};

export { GameSearchViewActions };