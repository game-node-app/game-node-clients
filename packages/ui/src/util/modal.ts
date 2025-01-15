import React, { PropsWithChildren } from "react";
import { ModalProps } from "@mantine/core";

export interface ModalComponentProps extends PropsWithChildren<ModalProps> {
  title?: string;
  /**
   * Only valid for "ion-modal".
   */
  breakpoints?: number[];
  /**
   * Only valid for "ion-modal".
   * Mandatory if 'breakpoints' is provided.
   */
  initialBreakpoint?: number;
}

export let Modal: React.FC<ModalComponentProps> = () => {
  throw new Error(
    "A modal component must be provided! Call `setModalComponent` at the project's root.",
  );
};

export function setModalComponent(component: React.FC<ModalComponentProps>) {
  console.log("Set modal component to: ", component);
  Modal = component;
}
