import React, { PropsWithChildren } from "react";
import { ModalProps } from "@mantine/core";
import { MantineModalWrapper } from "#@/components/general/MantineModalWrapper.tsx";

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
  /**
   * Only valid for "ion-modal".
   * @param breakpoint
   */
  onBreakpointChange?: (breakpoint: number) => void;
}

export let Modal: React.FC<ModalComponentProps> = MantineModalWrapper;

export function setModalComponent(component: React.FC<ModalComponentProps>) {
  Modal = component;
}
