import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Button, Loader, Text } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { useTranslation } from "@repo/locales";
import { authClient } from "#@/components/auth/authClient";
import {
  getAuthErrorKey,
  isLockedOutError,
} from "#@/components/auth/getAuthErrorKey";
import { getSafeRedirectPath } from "#@/components/auth/getSafeRedirectPath";
import {
  continueOAuth,
  followOAuthDestination,
  getOAuthRequest,
  hasOAuthRequest,
} from "../oauthRequest";
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
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [pending, setPending] = useState<AuthProvider | undefined>();
  const [failed, setFailed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showProviders, setShowProviders] = useState(false);

  const [oauthFailed, setOauthFailed] = useState(false);
  const [reauthenticate, setReauthenticate] = useState(false);
  const { query, push } = router;
  const oauth = getOAuthRequest(query);
  const pendingOAuth = hasOAuthRequest(query);
  const oauthQuery = oauth?.oauthQuery;
  const oauthPath = oauthQuery ? `${authPath}?${oauthQuery}` : authPath;
  const resumeOAuth = useCallback(async () => {
    if (!oauthQuery) return;
    setOauthFailed(false);
    try {
      const data = await continueOAuth(oauthQuery);
      const destination = new URL(data.url, window.location.origin);
      if (
        destination.origin === window.location.origin &&
        /\/auth\/?$/.test(destination.pathname)
      ) {
        setReauthenticate(true);
      } else {
        followOAuthDestination(data);
      }
    } catch {
      setOauthFailed(true);
    }
  }, [oauthQuery]);
  const redirectTo = query.get("redirectTo");
  const errorCode = failed ? "default" : dismissed ? null : query.get("error");
  const lockedOut = isLockedOutError(errorCode) && !showProviders;
  const target = getSafeRedirectPath(redirectTo, homePath, authPath);

  // Once: router hooks return a new `push` every render.
  const redirected = useRef(false);
  useEffect(() => {
    if (!sessionPending && session && !redirected.current) {
      redirected.current = true;
      if (pendingOAuth) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot resume guarded by `redirected`
        if (oauthQuery) void resumeOAuth();
      } else {
        void push(target, { replace: true, absolute: true });
      }
    }
  }, [
    session,
    sessionPending,
    push,
    target,
    pendingOAuth,
    oauthQuery,
    resumeOAuth,
  ]);

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
    const errorPath = pendingOAuth
      ? oauthPath
      : redirectTo
        ? `${authPath}?redirectTo=${encodeURIComponent(target)}`
        : authPath;
    const request = authClient.signIn.social({
      provider,
      callbackURL: base + (pendingOAuth ? oauthPath : target),
      errorCallbackURL: base + errorPath,
      newUserCallbackURL: pendingOAuth
        ? base + oauthPath
        : newUserPath
          ? base + newUserPath
          : undefined,
    });
    // Native: the library resolves this only after the auth session ends, and the session atom drives navigation.
    if (relativeCallbacks) return;
    void request
      .then(({ error }) => {
        if (error) {
          setPending(undefined);
          setFailed(true);
        }
      })
      .catch(() => {
        setPending(undefined);
        setFailed(true);
      });
  };

  const dismissError = () => {
    setDismissed(true);
    void push(
      pendingOAuth
        ? oauthPath
        : redirectTo
          ? `${authPath}?redirectTo=${encodeURIComponent(target)}`
          : authPath,
      { replace: true, absolute: true },
    );
  };

  if (pendingOAuth && (!oauth || oauthFailed)) {
    return (
      <main className={classes.panel}>
        <Alert color="red" role="alert">
          {t(oauth ? "mcp.consent.error" : "mcp.consent.invalid")}
        </Alert>
        {oauth && (
          <Button onClick={() => void resumeOAuth()}>
            {t("mcp.consent.retry")}
          </Button>
        )}
        <a href="/mcp">{t("mcp.consent.guide")}</a>
      </main>
    );
  }

  if (sessionPending || (session && !reauthenticate)) {
    return (
      <div className={classes.redirecting}>
        <Loader color={"brand"} />
        <Text>
          {t(
            pendingOAuth
              ? "mcp.consent.continuing"
              : "auth.redirecting.signingIn",
          )}
        </Text>
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
              closeButtonLabel={t("actions.close")}
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
