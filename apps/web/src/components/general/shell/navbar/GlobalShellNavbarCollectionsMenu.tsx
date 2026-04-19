import React from "react";
import { Center, HoverCard, Popover, UnstyledButton } from "@mantine/core";
import { IconChevronsLeft, IconChevronsRight } from "@tabler/icons-react";
import { GlobalShellNavbarCollectionsSection } from "@/components/general/shell/navbar/GlobalShellNavbarCollectionsSection";
import { useDisclosure } from "@mantine/hooks";
import { useOnMobile } from "@repo/ui";

const GlobalShellNavbarCollectionsMenu = () => {
  const onMobile = useOnMobile();
  const [collectionMenuExpanded, collectionMenuUtils] = useDisclosure();

  const TargetIcon = collectionMenuExpanded
    ? IconChevronsLeft
    : IconChevronsRight;

  const TargetHoverElement = onMobile ? Popover : HoverCard;

  return (
    <TargetHoverElement
      opened={onMobile ? collectionMenuExpanded : undefined}
      onOpen={collectionMenuUtils.open}
      onClose={collectionMenuUtils.close}
      transitionProps={{
        duration: 300,
      }}
      position={"right"}
      offset={12}
      keepMounted={true}
      openDelay={350}
    >
      <TargetHoverElement.Target>
        <UnstyledButton
          className={
            "w-full hover:bg-paper-8 data-[opened=true]:bg-paper-8 h-8 rounded-md"
          }
          data-opened={collectionMenuExpanded ? "true" : "false"}
          onClick={() => {
            if (onMobile) {
              collectionMenuUtils.toggle();
            }
          }}
        >
          <Center>
            <TargetIcon></TargetIcon>
          </Center>
        </UnstyledButton>
      </TargetHoverElement.Target>
      <TargetHoverElement.Dropdown
        className={
          "h-screen mt-[53px] min-w-64 bg-paper-3 rounded-sm py-4 px-3.5 max-w-full"
        }
      >
        <GlobalShellNavbarCollectionsSection
          onClose={collectionMenuUtils.close}
        />
      </TargetHoverElement.Dropdown>
    </TargetHoverElement>
  );
};

export { GlobalShellNavbarCollectionsMenu };
