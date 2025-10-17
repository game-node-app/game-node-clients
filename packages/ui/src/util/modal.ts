import { PropsWithChildren } from "react";
import { ModalProps } from "@mantine/core";
import { MantineModalWrapper } from "#@/components/general/MantineModalWrapper.tsx";
import { buildPresenterComponent } from "#@/context";

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
  /**
   * Only valid for "ion-modal".
   * @see https://ionicframework.com/docs/api/modal#scrolling-content-at-all-breakpoints
   * @param expandToScroll
   */
  expandToScroll?: boolean;
}

export const Modal = buildPresenterComponent("Modal", MantineModalWrapper);
