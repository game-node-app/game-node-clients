import React, { PropsWithChildren, useRef, useState } from "react";
import {
  GameFigureImage,
  IGameFigureProps,
} from "#@/components/game/figure/GameFigureImage";
import { LongPressEventType, useLongPress } from "use-long-press";
import { Box, Progress } from "@mantine/core";
import { CollectionEntryAddOrUpdateModal } from "#@/components/collection/collection-entry/form/modal/CollectionEntryAddOrUpdateModal";
import { useDisclosure } from "@mantine/hooks";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";

type GameFigureWIthQuickAddProps = PropsWithChildren<IGameFigureProps>;

const LONG_PRESS_TIMEOUT_MS = 1250;

/**
 * A game figure image wrapper that features quick collection add functionality. <br>
 * Warning: some callbacks will be overwritten.
 * @see https://github.com/game-node-app/game-node-web/issues/57
 */
const GameFigureWithQuickAdd = ({
  game,
  children,
  linkProps,
  ...others
}: GameFigureWIthQuickAddProps) => {
  const onMobile = useOnMobile();

  const [progress, setProgress] = useState(0);
  const [modalOpened, modalUtils] = useDisclosure();
  const intervalRef = useRef<number | undefined>(undefined);

  const onStart = () => {
    intervalRef.current = window.setInterval(() => {
      // Pass callback to avoid interval keeping old values when running the function
      setProgress((old) => {
        return old + 10;
      });
    }, LONG_PRESS_TIMEOUT_MS / 10);
  };

  const clearInterval = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    setProgress(0);
  };

  const bind = useLongPress(
    (evt) => {
      modalUtils.open();
    },
    {
      onStart: onStart,
      onCancel: clearInterval,
      onFinish: clearInterval,
      detect: LongPressEventType.Touch,
      cancelOnMovement: false,
      cancelOutsideElement: true,
      threshold: LONG_PRESS_TIMEOUT_MS,
    },
  );

  return (
    <Box className={"w-full"}>
      <CollectionEntryAddOrUpdateModal
        id={game!.id!}
        opened={modalOpened}
        onClose={() => {
          modalUtils.close();
        }}
      />
      <GameFigureImage
        game={game}
        {...others}
        linkProps={{
          ...linkProps,
          ...bind(),
        }}
      >
        {children}
        {progress > 0 && (
          <div className={"absolute h-full top-0 w-full"}>
            <Progress
              value={progress}
              size={"sm"}
              radius={0}
              className={"w-full h-2 mt-auto"}
            />
          </div>
        )}
      </GameFigureImage>
    </Box>
  );
};

export { GameFigureWithQuickAdd };
