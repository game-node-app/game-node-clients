import { useState } from "react";
import {
  ActionIcon,
  Alert,
  Button,
  Code,
  Group,
  Image,
  Mark,
  Stack,
  Stepper,
  Text,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconArrowsLeftRight, IconClipboard } from "@tabler/icons-react";
import { ConnectionsService, UserConnectionDto } from "@repo/wrapper/server";
import { useTranslation } from "@repo/locales";
import { GameNodeLogo } from "#@/components/general/GameNodeLogo";
import { getConnectionName } from "#@/components/connections/util/getConnectionName";
import { getServerStoredIcon } from "#@/util/getServerStoredImages";
import { getErrorMessage } from "#@/util/getErrorMessage";

// A failed callback uses up the single-use state, so reject obvious misses locally.
const CODE_PATTERN = /[0-9a-f]{32}/i;

const NINTENDO_LINK_PREFIX = "npf5c38e31cd085304b://auth#";
// Mirrors the server's parse; a rejected callback burns the state.
function checkNintendoLink(value: string, state: string) {
  const text = value.trim();
  if (!text.startsWith(NINTENDO_LINK_PREFIX)) return "invalid";
  const params = new URLSearchParams(text.slice(NINTENDO_LINK_PREFIX.length));
  if (!params.get("session_token_code")) return "invalid";
  return params.get("state") === state ? "ok" : "otherAttempt";
}

interface Props {
  type: UserConnectionDto.type;
  state: string;
  authorizationUrl: string;
  // eslint-disable-next-line no-unused-vars
  onOpen: (url: string) => void | Promise<void>;
  onStartOver: () => void;
  onClose?: () => void;
}

const PreferencesConnectionDelegatedCode = ({
  type,
  state,
  authorizationUrl,
  onOpen,
  onStartOver,
  onClose,
}: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const name = getConnectionName(type);
  const [active, setActive] = useState(0);
  const [value, setValue] = useState("");
  const [invalid, setInvalid] = useState<"invalid" | "otherAttempt" | false>(
    false,
  );
  const isNintendo = type === UserConnectionDto.type.NINTENDO;
  const k = isNintendo
    ? "preferences.delegatedCode.nintendo"
    : "preferences.delegatedCode";

  const callbackMutation = useMutation({
    retry: false,
    mutationFn: () =>
      ConnectionsService.connectionsControllerCompleteRedirectAuthV1(type, {
        state,
        callbackParams: { code: value.trim() },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["connections"] });
      notifications.show({
        color: "green",
        message: t("preferences.messages.connectionSetup", { type: name }),
      });
      onClose?.();
    },
  });

  // The state is consumed even by a rejected callback, so a failure locks the step.
  const failed = callbackMutation.isError;

  return (
    <Stack>
      <Group justify="center" wrap="nowrap">
        <div className="w-12">
          <GameNodeLogo />
        </div>
        <IconArrowsLeftRight aria-hidden />
        <Image
          src={getServerStoredIcon(type.valueOf())}
          alt={name}
          w={48}
          h={48}
        />
      </Group>
      <Stepper active={active} onStepClick={setActive} size="sm">
        <Stepper.Step
          label={t("preferences.delegatedCode.signInStep", { type: name })}
        >
          <Button
            mt="md"
            fullWidth
            color="dark"
            leftSection={
              <Image
                src={getServerStoredIcon(type.valueOf())}
                alt=""
                w={20}
                h={20}
              />
            }
            onClick={async () => {
              await onOpen(authorizationUrl);
              setActive(1);
            }}
          >
            {t("preferences.delegatedCode.signInButton", { type: name })}
          </Button>
          {isNintendo && (
            <Stack mt="md" gap="xs">
              <Text size="sm">
                {t("preferences.delegatedCode.nintendo.coverage")}
              </Text>
              <Text size="sm">
                {t("preferences.delegatedCode.nintendo.revoke")}
              </Text>
              <Text size="sm" c="dimmed">
                {t("preferences.delegatedCode.nintendo.phoneHint")}
              </Text>
            </Stack>
          )}
        </Stepper.Step>
        <Stepper.Step label={t("preferences.delegatedCode.pasteStep")}>
          <Stack mt="md">
            <Text size="sm">{t(`${k}.copyHint`, { type: name })}</Text>
            <Code block>
              {isNintendo ? (
                <Mark color="brand">
                  npf5c38e31cd085304b://auth#session_token_code=…&state=…
                </Mark>
              ) : (
                <>
                  {`{ …, "authorizationCode": "`}
                  <Mark color="brand">a1b2c3d4…</Mark>
                  {`", … }`}
                </>
              )}
            </Code>
            <TextInput
              ff="monospace"
              label={t(`${k}.pasteLabel`)}
              placeholder={t(`${k}.pastePlaceholder`)}
              value={value}
              disabled={failed || callbackMutation.isPending}
              error={
                invalid
                  ? isNintendo
                    ? t(
                        invalid === "otherAttempt"
                          ? "preferences.delegatedCode.nintendo.otherAttempt"
                          : "preferences.delegatedCode.nintendo.invalidLink",
                      )
                    : t("preferences.delegatedCode.invalidCode", { type: name })
                  : undefined
              }
              onChange={(e) => {
                setValue(e.currentTarget.value);
                setInvalid(false);
              }}
              rightSection={
                typeof navigator !== "undefined" &&
                navigator.clipboard?.readText ? (
                  <ActionIcon
                    variant="light"
                    disabled={failed}
                    aria-label={t(
                      "preferences.delegatedCode.pasteFromClipboard",
                    )}
                    onClick={async () => {
                      setValue(await navigator.clipboard.readText());
                      setInvalid(false);
                    }}
                  >
                    <IconClipboard size={16} />
                  </ActionIcon>
                ) : undefined
              }
            />
            <Text size="xs" c="dimmed">
              {t("preferences.delegatedCode.expiryHint")}
            </Text>
            {failed && (
              <Alert color="red">
                {getErrorMessage(callbackMutation.error)}
              </Alert>
            )}
            {failed ? (
              <Button type="button" onClick={onStartOver}>
                {t("preferences.delegatedCode.startOver")}
              </Button>
            ) : (
              <Button
                type="button"
                loading={callbackMutation.isPending}
                onClick={() => {
                  const result = isNintendo
                    ? checkNintendoLink(value, state)
                    : CODE_PATTERN.test(value)
                      ? "ok"
                      : "invalid";
                  if (result !== "ok") {
                    setInvalid(result);
                    return;
                  }
                  callbackMutation.mutate();
                }}
              >
                {t("actions.submit")}
              </Button>
            )}
          </Stack>
        </Stepper.Step>
      </Stepper>
    </Stack>
  );
};

export { PreferencesConnectionDelegatedCode };
