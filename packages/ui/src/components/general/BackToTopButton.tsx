import React from "react";
import { ActionIcon, Affix, Transition } from "@mantine/core";
import { IconArrowUp } from "@tabler/icons-react";
import { useOnMobilePlatform, useScrollPosition } from "#@/components";

const BackToTopButton = () => {
  const onMobilePlatform = useOnMobilePlatform();
  const [scroll, scrollTo] = useScrollPosition();

  return (
    <Affix
      position={{
        bottom: onMobilePlatform ? 70 : 20,
        right: 20,
      }}
    >
      <Transition transition="slide-up" mounted={scroll.y > 0}>
        {(transitionStyles) => (
          <ActionIcon
            size={"lg"}
            style={transitionStyles}
            onClick={() =>
              scrollTo({
                y: 0,
                duration: 500,
              })
            }
          >
            <IconArrowUp size={25} />
          </ActionIcon>
        )}
      </Transition>
    </Affix>
  );
};

export { BackToTopButton };
