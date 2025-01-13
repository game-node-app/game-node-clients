import React from "react";
import { Image, Modal } from "@mantine/core";
import { BaseModalProps } from "@/util/types/modal-props";
import useOnMobile from "@/components/general/hooks/useOnMobile";

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
            <Modal.Body w={"100%"} p={0}>
                <Image src={imageSrc} width={"100%"} alt={"Game image"} />
            </Modal.Body>
        </Modal>
    );
};

export default GameInfoImageCarouselModal;
