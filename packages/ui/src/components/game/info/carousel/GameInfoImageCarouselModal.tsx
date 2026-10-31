import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { Modal } from "#@/util";
import { BaseModalProps } from "#@/util/types/modal-props";
import { Image } from "@mantine/core";

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
      breakpoints={[0, 0.5, 0.75, 1]}
      initialBreakpoint={0.75}
    >
      <Image src={imageSrc} width={"100%"} alt={"Game image"} />
    </Modal>
  );
};

export { GameInfoImageCarouselModal };