import { HeaderSearchButton } from "@/components/general/header/HeaderSearchButton.tsx";
import { QueryProgressBar } from "@/components/general/QueryProgressBar";
import { ScrollableIonContent } from "@/components/general/ScrollableIonContent.tsx";
import { IonViewActiveProvider } from "@/components/general/hooks/useIonViewActive";
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import { openMainMenu } from "@/util/closeMainMenu";
import {
  authClient,
  ErrorBoundaryFallback,
  UserAvatar,
  useUserId,
} from "@repo/ui";
import { IconMenu2 } from "@tabler/icons-react";
import { useTranslation } from "@repo/locales";
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
  /** Extra toolbar buttons at the end, before the search button. */
  endButtons?: React.ReactNode;
  /**
   * Makes the toolbar transparent so the content (with `fullscreen`) shows behind it.
   * @default false
   */
  transparentHeader?: boolean;
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
  endButtons,
  transparentHeader = false,
  children,
}: Props) => {
  const userId = useUserId();
  const { t } = useTranslation();
  const ionRouter = useIonRouter();
  const { isPending } = authClient.useSession();
  const signedOut = !isPending && userId == undefined;
  return (
    <IonPage>
      <IonHeader className={"ion-no-border relative"}>
        <IonToolbar
          style={
            transparentHeader ? { "--background": "transparent" } : undefined
          }
        >
          <IonButtons slot={"start"}>
            {withMenuButton ? (
              <IonButton
                aria-label={t("navigation.menu")}
                onClick={() => {
                  openMainMenu().catch(console.error);
                }}
              >
                {signedOut ? (
                  <IconMenu2 size={26} className={"text-emphasis"} />
                ) : (
                  <UserAvatar userId={userId} size={32} radius={"xl"} />
                )}
              </IonButton>
            ) : (
              <IonBackButton />
            )}
          </IonButtons>
          {title != undefined && <IonTitle>{title}</IonTitle>}
          {(withSearch || endButtons || (withMenuButton && signedOut)) && (
            <IonButtons slot={"end"}>
              {withMenuButton && signedOut && (
                <IonButton
                  fill={"solid"}
                  color={"primary"}
                  shape={"round"}
                  className={
                    "h-8 text-sm font-bold normal-case tracking-[0.01em] [--border-radius:9999px] [--box-shadow:none] [--padding-end:14px] [--padding-start:14px]"
                  }
                  onClick={() => {
                    ionRouter.push("/m/auth", "forward");
                  }}
                >
                  {t("actions.loginCta")}
                </IonButton>
              )}
              {endButtons}
              {withSearch && <HeaderSearchButton />}
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
