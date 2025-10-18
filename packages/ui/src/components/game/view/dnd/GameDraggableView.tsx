import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  GameSortableItemData,
  GameViewLayoutOption,
  TGameOrSearchGame,
  useOnTouchDevice,
} from "#@/components";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { GameDraggableViewContent } from "#@/components/game/view/dnd/GameDraggableViewContent";
import { GameDraggableViewOverlay } from "#@/components/game/view/dnd/GameDraggableViewOverlay";
import { GameDraggableViewLayoutSwitcher } from "#@/components/game/view/dnd/GameDraggableViewLayoutSwitcher";

export interface GameDraggableViewProps extends PropsWithChildren {
  layout: GameViewLayoutOption;
  /**
   * Called when dragging ends, returns the result of the drag operation.
   * The previous index corresponds to the older item index before drag.
   * The next index corresponds to the newer item index after drag.
   * @param result
   */
  onDragFinished: (
    targetGameId: number,
    previousIndex: number,
    nextIndex: number,
  ) => void;
}

export interface GameDraggableViewContextType {
  activeGame: TGameOrSearchGame | null;
  layout: GameViewLayoutOption;
}

export const GameDraggableViewContext =
  createContext<GameDraggableViewContextType>({
    activeGame: null,
    layout: "list",
  });

export function useGameDraggableViewContext() {
  return useContext(GameDraggableViewContext);
}

/**
 * Renders a draggable list/grid of games. <br >
 * This component is very sensitive to scroll context and may not work under all circumstances.
 * @param children
 * @param onDragFinished
 * @param items
 * @param layout
 * @constructor
 */
const GameDraggableView = ({
  children,
  layout = "list",
  onDragFinished,
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

    if (over == undefined || active.id === over.id) return;

    const originalSortableData = active.data.current as GameSortableItemData;
    const updatedSortableData = over.data.current as GameSortableItemData;

    if (originalSortableData && updatedSortableData) {
      const {
        game,
        sortable: { index: originalIndex },
      } = originalSortableData;
      const {
        sortable: { index: updatedIndex },
      } = updatedSortableData;

      onDragFinished(game.id!, originalIndex, updatedIndex);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(evt) => {
        const sortableData = evt.active.data.current as GameSortableItemData;
        if (sortableData) {
          setActiveGame(sortableData.game);
        }
      }}
      onDragEnd={(evt) => {
        setActiveGame(null);
        handleDragEnd(evt);
      }}
      collisionDetection={closestCenter}
    >
      <GameDraggableViewContext.Provider
        value={{
          activeGame,
          layout,
        }}
      >
        {children}
      </GameDraggableViewContext.Provider>
    </DndContext>
  );
};

GameDraggableView.Content = GameDraggableViewContent;
GameDraggableView.Overlay = GameDraggableViewOverlay;
GameDraggableView.LayoutSwitcher = GameDraggableViewLayoutSwitcher;

export { GameDraggableView };
