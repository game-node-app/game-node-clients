import React from "react";
import { ActionIcon, Affix, Transition } from "@mantine/core";
import { useWindowScroll } from "@mantine/hooks";
import { IconArrowUp } from "@tabler/icons-react";

const BackToTopButton = () => {
  const [scroll, scrollTo] = useWindowScroll();

  return (
    <Affix position={{ bottom: 20, right: 20 }}>
      <Transition transition="slide-up" mounted={scroll.y > 0}>
        {(transitionStyles) => (
          <ActionIcon
            size={"lg"}
            style={transitionStyles}
            onClick={() =>
              scrollTo({
                y: 0,
              })
            }
          >
            <IconArrowUp />
          </ActionIcon>
        )}
      </Transition>
    </Affix>
  );
};

export { BackToTopButton };
