import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDisclosure } from "@mantine/hooks";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";

export interface IPostImageLightboxContext {
  openLightbox: (image: string) => void;
  registerImage: (image: string) => void;
  unregisterImage: (image: string) => void;
  closeLightbox: () => void;
}

const Context = createContext<IPostImageLightboxContext>({
  registerImage: () => {},
  unregisterImage: () => {},
  openLightbox: () => {},
  closeLightbox: () => {},
});

export const usePostImageLightboxContext = () => useContext(Context);

export const PostImageLightboxContext = ({ children }: PropsWithChildren) => {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [opened, openedUtils] = useDisclosure();

  const onOpen = useCallback(
    (image: string) => {
      const possibleIndex = images.indexOf(image);
      setCurrentIndex(possibleIndex !== -1 ? possibleIndex : 0);
      openedUtils.open();
    },
    [images, openedUtils],
  );

  const registerImage = useCallback((image: string) => {
    setImages((prev) => {
      // Prevent duplicate registrations
      if (prev.find((img) => img === image)) {
        return prev;
      }
      return [...prev, image];
    });
  }, []);

  const unregisterImage = useCallback((image: string) => {
    setImages((prev) => prev.filter((img) => img !== image));
  }, []);

  const slides = useMemo(
    () => images.map((image) => ({ src: image })),
    [images],
  );

  return (
    <Context.Provider
      value={{
        closeLightbox: openedUtils.close,
        registerImage: registerImage,
        openLightbox: onOpen,
        unregisterImage: unregisterImage,
      }}
    >
      {children}
      <Lightbox
        open={opened}
        close={openedUtils.close}
        slides={slides}
        index={currentIndex}
        plugins={[Zoom, Thumbnails]}
      />
    </Context.Provider>
  );
};

export { Context };
