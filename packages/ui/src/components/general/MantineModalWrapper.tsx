import React from "react";
import { ModalComponentProps } from "#@/util";
import { Modal } from "@mantine/core";

const MantineModalWrapper = (props: ModalComponentProps) => {
  return <Modal {...props} title={props.title} />;
};

export { MantineModalWrapper };
