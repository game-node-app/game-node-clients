import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useTranslation } from "@repo/locales";
import { cn, ModalComponentProps } from "@repo/ui";
import type { CSSProperties } from "react";

const IonModalWrapper = ({
  opened,
  onClose,
  title,
  breakpoints,
  initialBreakpoint,
  onBreakpointChange,
  withCloseButton = true,
  padding,
  p,
  classNames,
  children,
}: ModalComponentProps) => {
  const { t } = useTranslation();
  const zeroPadding = padding === 0 || p === 0;
  const contentStyle = zeroPadding
    ? ({
        "--padding-top": "0px",
        "--padding-bottom": "0px",
        "--padding-start": "0px",
        "--padding-end": "0px",
      } as CSSProperties)
    : undefined;

  return (
    <IonModal
      isOpen={opened}
      onDidDismiss={() => {
        onClose();
      }}
      breakpoints={breakpoints}
      initialBreakpoint={initialBreakpoint}
      onIonBreakpointDidChange={(evt) => {
        if (onBreakpointChange) {
          onBreakpointChange(evt.detail.breakpoint);
        }
      }}
      className={classNames?.content}
    >
      {(title || withCloseButton) && (
        <IonHeader>
          <IonToolbar>
            {title && <IonTitle>{title}</IonTitle>}
            {withCloseButton && (
              <IonButtons slot="end">
                <IonButton
                  onClick={() => {
                    onClose();
                  }}
                >
                  {t("actions.close")}
                </IonButton>
              </IonButtons>
            )}
          </IonToolbar>
        </IonHeader>
      )}
      <IonContent
        className={cn(
          "w-full",
          !zeroPadding && "ion-padding",
          classNames?.body,
        )}
        style={contentStyle}
      >
        {children}
      </IonContent>
    </IonModal>
  );
};

export { IonModalWrapper };
