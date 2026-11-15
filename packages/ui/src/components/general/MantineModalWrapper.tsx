import { ModalComponentProps } from "#@/util";
import { Modal } from "@mantine/core";

const MantineModalWrapper = (props: ModalComponentProps) => {
  const {
    breakpoints,
    initialBreakpoint,
    onBreakpointChange,
    expandToScroll,
    ...modalProps
  } = props;

  // Ionic-only props: Mantine would forward them to the DOM as unknown attributes.
  void breakpoints;
  void initialBreakpoint;
  void onBreakpointChange;
  void expandToScroll;

  return <Modal {...modalProps} title={props.title} />;
};

export { MantineModalWrapper };
