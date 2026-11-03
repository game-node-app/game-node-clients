import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Center,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { authClient } from "@repo/ui/auth";
import { handleAuthError } from "@repo/ui/auth-errors";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { PROVIDERS, type Provider } from "../shared/bridge";
import { Library } from "./library/Library";
import { CACHE_PREFIX, accountStorage } from "./cache";

export function App() {
  const [signedIn, setSignedIn] = useState<boolean>();
  const [userId, setUserId] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState<Provider>();
  useEffect(() => {
    let version = 0;
    const restore = async () => {
      const attempt = ++version;
      try {
        const token = await window.gamenode.getToken();
        if (attempt !== version) return;
        if (!token) {
          setSignedIn(false);
          return;
        }
        const digest = await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(token),
        );
        const fingerprint = Array.from(new Uint8Array(digest), (byte) =>
          byte.toString(16).padStart(2, "0"),
        ).join("");
        if (attempt !== version) return;
        let cached: { fingerprint?: string; userId?: string } | null = null;
        try {
          cached = JSON.parse(
            localStorage.getItem("gamenode-identity") || "null",
          );
        } catch {
          /* Invalid identity is never used. */
        }
        setUserId(
          cached?.fingerprint === fingerprint &&
            typeof cached.userId === "string"
            ? cached.userId
            : undefined,
        );
        setSignedIn(true);
        const session = await authClient.getSession({
          query: { disableCookieCache: true },
        });
        if (attempt !== version) return;
        if (session.error) {
          setError("Could not reach GameNode. Retry when connected.");
          return;
        }
        if (!session.data) {
          await window.gamenode.signOut();
          return;
        }
        localStorage.setItem(
          "gamenode-identity",
          JSON.stringify({ fingerprint, userId: session.data.user.id }),
        );
        setUserId(session.data.user.id);
      } catch {
        if (attempt === version)
          setError("Could not restore session. Retry when connected.");
      }
    };
    const unsubscribe = window.gamenode.onSessionChanged((change) => {
      setError(change.error);
      setPending(undefined);
      if (!change.signedIn) {
        ++version;
        setSignedIn(false);
        setUserId(undefined);
        localStorage.removeItem("gamenode-identity");
        for (const key of Object.keys(localStorage))
          if (key.startsWith(CACHE_PREFIX)) localStorage.removeItem(key);
      } else void restore();
    });
    void restore();
    const focus = () => setPending(undefined);
    const retry = () => void restore();
    window.addEventListener("focus", focus);
    window.addEventListener("online", retry);
    window.addEventListener("gamenode:retry-session", retry);
    return () => {
      ++version;
      unsubscribe();
      window.removeEventListener("focus", focus);
      window.removeEventListener("online", retry);
      window.removeEventListener("gamenode:retry-session", retry);
    };
  }, []);
  if (signedIn === undefined)
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  if (signedIn) {
    if (userId) return <UserLibrary key={userId} userId={userId} />;
    return (
      <Center h="100vh">
        <Stack align="center">
          <Loader />
          <Text>{error || "Restoring session…"}</Text>
          <Button
            onClick={() =>
              window.dispatchEvent(new Event("gamenode:retry-session"))
            }
          >
            Retry
          </Button>
          <Button
            variant="subtle"
            onClick={() => void window.gamenode.signOut()}
          >
            Sign out
          </Button>
        </Stack>
      </Center>
    );
  }
  return (
    <Center h="100vh">
      <Paper p="xl" withBorder w={420}>
        <Stack>
          <Text c="brand" fw={700} size="xl">
            GameNode
          </Text>
          <Title order={1}>Your games, together.</Title>
          <Text c="dimmed">
            Sign in to browse the games you own across your linked stores.
          </Text>
          {error && (
            <Alert color="red" title="Sign-in failed">
              {error}
            </Alert>
          )}
          {PROVIDERS.map((provider) => (
            <Button
              key={provider}
              variant="light"
              loading={pending === provider}
              disabled={!!pending && pending !== provider}
              onClick={() => {
                setPending(provider);
                setError(undefined);
                void window.gamenode.signIn(provider).catch(() => {
                  setPending(undefined);
                  setError("Could not open sign-in. Try again.");
                });
              }}
            >
              Continue with{" "}
              {provider === "twitter"
                ? "X / Twitter"
                : provider[0].toUpperCase() + provider.slice(1)}
            </Button>
          ))}
          <Text size="xs" c="dimmed">
            Sign-in opens in your browser. Return here to cancel.
          </Text>
        </Stack>
      </Paper>
    </Center>
  );
}

function UserLibrary({ userId }: { userId: string }) {
  const [client] = useState(() => {
    const onError = (error: unknown) => {
      handleAuthError(error);
      if ((error as { status?: number })?.status === 401)
        void window.gamenode.signOut();
    };
    return new QueryClient({
      queryCache: new QueryCache({ onError }),
      mutationCache: new MutationCache({ onError }),
      defaultOptions: {
        queries: {
          gcTime: Infinity,
          retry: 1,
          refetchOnWindowFocus: true,
        },
      },
    });
  });
  const [persister] = useState(() =>
    createAsyncStoragePersister({
      storage: accountStorage(localStorage, userId),
      key: CACHE_PREFIX + userId,
    }),
  );
  useEffect(
    () =>
      window.gamenode.onSessionChanged((change) => {
        if (!change.signedIn) {
          void client.cancelQueries();
          client.clear();
        }
      }),
    [client],
  );
  return (
    <PersistQueryClientProvider
      client={client}
      persistOptions={{
        persister,
        maxAge: 30 * 86400000,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            query.state.data !== undefined &&
            (query.queryKey[0] === "owned-library" ||
              (query.queryKey[0] === "connections" &&
                query.queryKey[1] === "own")),
        },
      }}
    >
      <Library userId={userId} />
    </PersistQueryClientProvider>
  );
}
