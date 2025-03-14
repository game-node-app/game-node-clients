import { Carousel } from "@mantine/carousel";
import { Image } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import GameInfoImageCarouselModal from "@/components/game/info/carousel/GameInfoImageCarouselModal";
import {ComponentProps} from "react";

interface Props extends ComponentProps<typeof Carousel.Slide> {
    imageSrc: string;
}

const GameInfoImageCarouselSlide = ({ imageSrc, ...others }: Props) => {
    const [imageModalOpened, imageModalUtils] = useDisclosure();
    return (
        <Carousel.Slide {...others} onClick={() => imageModalUtils.toggle()}>
            <GameInfoImageCarouselModal
                imageSrc={imageSrc}
                opened={imageModalOpened}
                onClose={imageModalUtils.close}
            />
            <Image src={imageSrc} alt={"Game Image"} />
        </Carousel.Slide>
    );
};

export default GameInfoImageCarouselSlide;
