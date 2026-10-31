import { useEffect, useRef, useState } from "react";
import { Alert, Button, Loader, Text } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { useTranslation } from "@repo/locales";
import { authClient } from "#@/components/auth/authClient";
import {
  getAuthErrorKey,
  isLockedOutError,
} from "#@/components/auth/getAuthErrorKey";
import { getSafeRedirectPath } from "#@/components/auth/getSafeRedirectPath";
import { GameNodeLogo } from "#@/components/general/GameNodeLogo";
import { useAuthPath } from "#@/context";
import { useRouter } from "#@/util/link";
import { AuthProvider, ProviderButton } from "./ProviderButton";
import classes from "./SignIn.module.css";

const PROVIDERS: AuthProvider[] = ["google", "discord", "twitter"];

export interface SignInScreenProps {
  variant?: "default" | "admin";
  /** Where signed-in users land when there is no valid `redirectTo`. */
  homePath?: string;
  /** Where brand-new users land (web onboarding). */
  newUserPath?: string;
  /** Native: pass relative paths so better-auth-capacitor rewrites them to the app scheme. */
  relativeCallbacks?: boolean;
}

const SignInScreen = ({
  variant = "default",
  homePath = "/home",
  newUserPath,
  relativeCallbacks = false,
}: SignInScreenProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const authPath = useAuthPath();
  const { data: session } = authClient.useSession();
  const [pending, setPending] = useState<AuthProvider | undefined>();
  const [failed, setFailed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showProviders, setShowProviders] = useState(false);

  const { query, push } = router;
  const redirectTo = query.get("redirectTo");
  const errorCode = failed ? "default" : dismissed ? null : query.get("error");
  const lockedOut = isLockedOutError(errorCode) && !showProviders;
  const target = getSafeRedirectPath(redirectTo, homePath);

  // Once: router hooks return a new `push` every render.
  const redirected = useRef(false);
  useEffect(() => {
    if (session && !redirected.current) {
      redirected.current = true;
      void push(target, { replace: true, absolute: true });
    }
  }, [session, push, target]);

  // The native auth session hides the WebView and `signIn.social` may never resolve, so reset on return.
  useEffect(() => {
    if (!relativeCallbacks) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") setPending(undefined);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [relativeCallbacks]);

  const signIn = (provider: AuthProvider) => {
    setPending(provider);
    setFailed(false);
    // A fresh attempt supersedes the error from the URL.
    setDismissed(true);
    const base = relativeCallbacks ? "" : window.location.origin;
    const errorPath = redirectTo
      ? `${authPath}?redirectTo=${encodeURIComponent(target)}`
      : authPath;
    const request = authClient.signIn.social({
      provider,
      callbackURL: base + target,
      errorCallbackURL: base + errorPath,
      newUserCallbackURL: newUserPath ? base + newUserPath : undefined,
    });
    // Native: the library resolves this only after the auth session ends, and the session atom drives navigation.
    if (relativeCallbacks) return;
    void request.then(({ error }) => {
      if (error) {
        setPending(undefined);
        setFailed(true);
      }
    });
  };

  const dismissError = () => {
    setDismissed(true);
    void push(
      redirectTo
        ? `${authPath}?redirectTo=${encodeURIComponent(target)}`
        : authPath,
      { replace: true, absolute: true },
    );
  };

  if (session) {
    return (
      <div className={classes.redirecting}>
        <Loader color={"brand"} />
        <Text>{t("auth.redirecting.signingIn")}</Text>
      </div>
    );
  }

  const errorKey = getAuthErrorKey(errorCode);
  const isNotice = errorKey === "access_denied";

  return (
    <div className={classes.root}>
      <section className={classes.hero} aria-hidden>
        <div className={classes.heroLogo}>
          <GameNodeLogo />
        </div>
        <div>
          <h2 className={classes.headline}>{t("auth.screen.headline")}</h2>
          <p className={classes.tagline}>{t("auth.screen.tagline")}</p>
        </div>
      </section>
      <main className={classes.panel}>
        <div className={classes.mobileLogo}>
          <GameNodeLogo />
        </div>
        <div className={classes.card}>
          <span className={classes.eyebrow}>
            {variant === "admin"
              ? t("auth.screen.adminEyebrow")
              : t("auth.screen.eyebrow")}
          </span>
          <h1 className={classes.title}>{t("auth.screen.title")}</h1>
          <Text className={classes.muted}>
            {variant === "admin"
              ? t("auth.screen.adminSubtitle")
              : t("auth.screen.subtitle")}
          </Text>

          {errorCode && !isLockedOutError(errorCode) && (
            <Alert
              color={isNotice ? "gray" : "red"}
              variant={"light"}
              title={t(`auth.errors.${errorKey}.title`)}
              withCloseButton
              onClose={dismissError}
            >
              <Text size={"sm"}>{t(`auth.errors.${errorKey}.body`)}</Text>
              {errorKey === "account_not_linked" && (
                <Text size={"sm"} mt={4}>
                  {t("auth.errors.account_not_linked.hint")}
                </Text>
              )}
            </Alert>
          )}

          {lockedOut ? (
            <div className={classes.locked}>
              <IconLock color={"var(--mantine-color-brand-6)"} />
              <Text fw={600}>{t("auth.lockedOut.title")}</Text>
              <Text size={"sm"}>{t("auth.lockedOut.body")}</Text>
              <Button
                component={"a"}
                href={"mailto:support@gamenode.app"}
                color={"brand"}
              >
                {t("auth.lockedOut.contact")}
              </Button>
              <Button
                variant={"subtle"}
                color={"gray"}
                onClick={() => setShowProviders(true)}
              >
                {t("auth.lockedOut.useAnother")}
              </Button>
            </div>
          ) : (
            <div className={classes.buttons}>
              {PROVIDERS.map((provider) => (
                <ProviderButton
                  key={provider}
                  provider={provider}
                  pending={pending === provider}
                  disabled={!!pending && pending !== provider}
                  onClick={() => signIn(provider)}
                />
              ))}
            </div>
          )}

          <Text className={classes.legal}>
            {t("auth.screen.legalPrefix")}{" "}
            <a
              href={"https://gamenode.app/privacy"}
              target={"_blank"}
              rel={"noreferrer"}
            >
              {t("auth.screen.legalLink")}
            </a>
          </Text>
        </div>
      </main>
    </div>
  );
};

export { SignInScreen };
