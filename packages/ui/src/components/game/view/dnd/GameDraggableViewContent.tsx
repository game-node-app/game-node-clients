import {
  GameDraggableGridItem,
  GameDraggableListItem,
  TGameOrSearchGame,
  useGameDraggableViewContext,
} from "#@/components";
import { cn } from "#@/util";
import {
  rectSortingStrategy,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Box } from "@mantine/core";

export interface GameDraggableContentProps {
  /**
   * Identifier for this draggable content instance. <br>
   * Should be defined if multiple instances are used, otherwise {@link GameDraggableViewOverlay#onContainerMove}
   * will not work.
   */
  id?: string;
  /**
   * Rendered items for this specific instance.
   * Multiple instances can be used to render different lists/grids (e.g. move a item from a grid to another).
   * As such, these should only be items pertaining to this instance.
   */
  items: TGameOrSearchGame[];
}

/**
 * Renders a draggable list/grid of games. <br>
 * @constructor
 */
const GameDraggableViewContent = ({ id, items }: GameDraggableContentProps) => {
  const { layout } = useGameDraggableViewContext();

  const strategy =
    layout === "list" ? verticalListSortingStrategy : rectSortingStrategy;

  const TargetItem =
    layout === "list" ? GameDraggableListItem : GameDraggableGridItem;

  return (
    <Box
      className={cn("w-full", {
        "flex flex-col gap-4": layout === "list",
        "grid grid-cols-3 gap-4": layout === "grid",
      })}
    >
      <SortableContext
        items={items.map((game) => game.id!)}
        strategy={strategy}
        id={id}
      >
        {items.map((game) => (
          <TargetItem key={game.id} game={game} />
        ))}
      </SortableContext>
    </Box>
  );
};

export { GameDraggableViewContent };