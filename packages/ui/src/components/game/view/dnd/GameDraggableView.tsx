import React, {
  createContext,
  PropsWithChildren,
  useMemo,
  useState,
} from "react";
import {
  GameViewLayoutOption,
  TGameOrSearchGame,
  useOnTouchDevice,
} from "#@/components";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { GameDraggableListItemContent } from "#@/components/game/view/dnd/GameDraggableListItemContent";
import { Portal } from "@mantine/core";
import { GameDraggableContent } from "./GameDraggableContent";
import { arrayMove } from "@dnd-kit/sortable";

/**
 * Result of a drag operation.
 * "Previous" and "Next" refer to the items that are before and after the dragged item when drag finishes.
 */
export interface GameDragResult {
  currentItem: TGameOrSearchGame;
  /**
   * Index after the drag operation finishes.
   */
  currentIndex: number;
  /**
   * Index of the item before the dragging occurred.
   */
  previousIndex: number;
  /**
   * Index of the item that comes before the target item when dragging finishes.
   * When undefined, the item is dropped at the beginning of the list.
   */
  beforeIndex: number | undefined;
  /**
   * Index of the item that comes after the target item when dragging finishes.
   * When undefined, the item is dropped at the end of the list.
   */
  afterIndex: number | undefined;
}

export interface GameDraggableViewProps extends PropsWithChildren {
  layout?: GameViewLayoutOption;
  items: TGameOrSearchGame[];
  /**
   * This function will be used to reorder elements after a dragging ends.
   * @param items
   */
  setItems: (items: TGameOrSearchGame[]) => void;
  /**
   * Called when a dragging ends, automatically calculating the position of related elements.
   * Not to be confused with onDragEnd from DndContext.
   * @param result
   */
  onDragFinished: (result: GameDragResult) => void;
}

/**
 * Renders a draggable list/grid of games. <br >
 * This component is very sensitive to scroll context and may not work under all circumstances.
 * @param children
 * @param onDragFinished
 * @param items
 * @param setItems
 * @param layout
 * @constructor
 */
const GameDraggableView = ({
  children,
  onDragFinished,
  items,
  setItems,
  layout = "list",
}: GameDraggableViewProps) => {
  const onTouch = useOnTouchDevice();

  const targetSensor = useMemo(() => {
    return onTouch ? TouchSensor : PointerSensor;
  }, [onTouch]);

  const sensors = useSensors(
    useSensor(targetSensor, {
      activationConstraint: {
        delay: onTouch ? 100 : 0,
        tolerance: onTouch ? 150 : 0,
      },
    }),
  );

  const [activeGame, setActiveGame] = useState<TGameOrSearchGame | null>(null);

  const handleDragEnd = (evt: DragEndEvent) => {
    const { active, over } = evt;
    if (!over) return;

    const previousIndex = items.findIndex((game) => game.id === active.id);
    /*
     * New index of the item that was dragged.
     */
    const updatedIndex = items.findIndex((game) => game.id === over.id);

    if (previousIndex === updatedIndex) return;

    const targetItem = items[previousIndex];

    const result: GameDragResult = {
      currentItem: targetItem,
      currentIndex: updatedIndex,
      previousIndex: previousIndex,
      beforeIndex: updatedIndex - 1 >= 0 ? updatedIndex - 1 : undefined,
      afterIndex:
        updatedIndex + 1 < items.length ? updatedIndex + 1 : undefined,
    };

    const updatedItems = arrayMove(items, previousIndex, updatedIndex);

    onDragFinished(result);
    setItems(updatedItems);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(evt) => {
        const id = evt.active.id as number;
        const game = items.find((game) => game.id === id)!;
        setActiveGame(game);
      }}
      onDragEnd={(evt) => {
        setActiveGame(null);
        handleDragEnd(evt);
      }}
      collisionDetection={closestCenter}
    >
      <GameDraggableContent items={items} layout={layout} />
      <Portal>
        <DragOverlay>
          {activeGame && (
            <GameDraggableListItemContent
              game={activeGame}
              isDragging
              isOverlay
            />
          )}
        </DragOverlay>
      </Portal>
    </DndContext>
  );
};

export { GameDraggableView };
