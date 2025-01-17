import React from "react";
import { Image } from "@mantine/core";
import { BaseModalProps } from "#@/util/types/modal-props";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { Modal } from "#@/util";

interface Props extends BaseModalProps {
  imageSrc: string;
}

const GameInfoImageCarouselModal = ({ imageSrc, onClose, opened }: Props) => {
  const onMobile = useOnMobile();
  return (
    <Modal
      onClose={onClose}
      opened={opened}
      centered
      size={onMobile ? "100%" : "70%"}
      p={0}
      withCloseButton={false}
    >
      <Image src={imageSrc} width={"100%"} alt={"Game image"} />
    </Modal>
  );
};

export { GameInfoImageCarouselModal };
