import { HeaderSearchButton } from "@/components/general/header/HeaderSearchButton.tsx";
import { QueryProgressBar } from "@/components/general/QueryProgressBar";
import { ScrollableIonContent } from "@/components/general/ScrollableIonContent.tsx";
import { IonViewActiveProvider } from "@/components/general/hooks/useIonViewActive";
import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { ErrorBoundaryFallback } from "@repo/ui";
import React, { PropsWithChildren } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props extends PropsWithChildren {
  withSearch?: boolean;
  /**
   * The title of the page. <br>
   * Usually doesn't work well with the search button.
   */
  title?: string;
  /**
   * If a menu button should be displayed. <br>
   * If 'false', a back button will be displayed instead (if available).
   * @default false
   */
  withMenuButton?: boolean;
  contentProps?: React.ComponentProps<typeof ScrollableIonContent>;
}

/**
 * Component that renders an app page with a header and a content.
 * The content is our custom version of IonContent, named @{ScrollableIonContent}
 */
const AppPage = ({
  withMenuButton = false,
  withSearch = true,
  title,
  contentProps,
  children,
}: Props) => {
  return (
    <IonPage>
      <IonHeader className={"ion-no-border"}>
        <IonToolbar>
          <IonButtons slot={"start"}>
            {withMenuButton ? <IonMenuButton /> : <IonBackButton />}
          </IonButtons>
          {title != undefined && <IonTitle>{title}</IonTitle>}
          {withSearch && (
            <IonButtons slot={"end"}>
              <HeaderSearchButton />
            </IonButtons>
          )}
        </IonToolbar>
        <QueryProgressBar />
      </IonHeader>
      <ScrollableIonContent className={"ion-padding"} {...contentProps}>
        <ErrorBoundary
          fallbackRender={({ error }) => (
            <ErrorBoundaryFallback error={error as Error} />
          )}
        >
          <IonViewActiveProvider>{children}</IonViewActiveProvider>
        </ErrorBoundary>
      </ScrollableIonContent>
    </IonPage>
  );
};

export { AppPage };
