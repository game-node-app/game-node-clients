import { useEffect, useRef, useState } from "react";
import { Button, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ConnectionsService } from "@repo/wrapper/server";
import { useTranslation } from "@repo/locales";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { CenteredErrorMessage } from "#@/components/general/CenteredErrorMessage";
import { useRouter } from "#@/util/link";

export const ConnectionAuthCallback = ({ type }: { type: string }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const started = useRef(false);
  // Mutation observers detach during StrictMode's effect replay.
  const [error, setError] = useState<Error | null>(null);
  const { mutate } = useMutation({
    retry: false,
    onError: setError,
    mutationFn: async () => {
      if (type !== "steam" && type !== "xbox") {
        throw new Error(t("preferences.messages.connectionUnsupported"));
      }
      const params = new URLSearchParams(window.location.search);
      if (params.has("error") || params.get("openid.mode") === "cancel") {
        throw new Error(t("preferences.messages.connectionAuthCancelled"));
      }
      const state = params.get("state");
      if (
        !state ||
        params.getAll("state").length !== 1 ||
        (type === "xbox" && !params.get("code"))
      ) {
        throw new Error(t("preferences.messages.connectionAuthInvalid"));
      }
      params.delete("state");
      return ConnectionsService.connectionsControllerCompleteRedirectAuthV1(
        type,
        {
          state,
          callbackParams: Object.fromEntries(params),
        },
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["connections"] });
      notifications.show({
        color: "green",
        message: t("preferences.messages.connectionSetup", { type }),
      });
      void router.push("/preferences/connections", { replace: true });
    },
  });

  useEffect(() => {
    // The server consumes auth state once; React StrictMode must not replay it.
    if (started.current) return;
    started.current = true;
    mutate();
  }, [mutate]);

  return (
    <Stack align="center" p="md">
      {!error && (
        <CenteredLoading
          message={t("preferences.messages.connectionAuthCompleting")}
        />
      )}
      {error && <CenteredErrorMessage error={error} />}
      {error && (
        <Button
          onClick={() =>
            void router.push("/preferences/connections", { replace: true })
          }
        >
          {t("preferences.actions.backToConnections")}
        </Button>
      )}
    </Stack>
  );
};
