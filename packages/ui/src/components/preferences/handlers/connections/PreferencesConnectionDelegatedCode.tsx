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
import { useReducedMotion } from "@mantine/hooks";
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

function checkGogUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" &&
      url.hostname === "embed.gog.com" &&
      !url.port &&
      !url.username &&
      !url.password &&
      url.pathname === "/on_login_success" &&
      url.searchParams.get("origin") === "client" &&
      Boolean(url.searchParams.get("code")?.trim())
      ? "ok"
      : "invalid";
  } catch {
    return "invalid";
  }
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
  const reducedMotion = useReducedMotion(true);
  const [guidePlaying, setGuidePlaying] = useState<boolean>();
  const isGuidePlaying = guidePlaying ?? !reducedMotion;
  const [value, setValue] = useState("");
  const [invalid, setInvalid] = useState<"invalid" | "otherAttempt" | false>(
    false,
  );
  const isNintendo = type === UserConnectionDto.type.NINTENDO;
  const isGog = type === UserConnectionDto.type.GOG;
  const guideKey = isNintendo
    ? "preferences.delegatedCode.nintendo"
    : "preferences.delegatedCode.gog";
  const k = isNintendo || isGog ? guideKey : "preferences.delegatedCode";

  const callbackMutation = useMutation({
    retry: false,
    gcTime: 0,
    throwOnError: false,
    mutationFn: async () => {
      try {
        return await ConnectionsService.connectionsControllerCompleteRedirectAuthV1(
          type,
          {
            state,
            callbackParams: { code: value.trim() },
          },
        );
      } catch (error) {
        // ApiError retains the callback body; keep it out of mutation caches and reporters.
        throw isGog
          ? new Error(t("preferences.delegatedCode.gog.callbackFailed"))
          : error;
      } finally {
        setValue("");
      }
    },
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
    <Stack className="oauth-private ph-no-capture">
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
          {(isNintendo || isGog) && (
            <Stack mt="md" gap="xs">
              <Text size="sm">{t(`${guideKey}.signInHint`)}</Text>
              <Image
                src={`/img/${type}-link-guide.${isGuidePlaying ? "gif" : "png"}`}
                alt={t(`${guideKey}.guideAlt`)}
                width={720}
                height={440}
                w="100%"
                h="auto"
                radius="sm"
              />
              <Button
                type="button"
                variant="subtle"
                size="compact-xs"
                style={{ alignSelf: "flex-end" }}
                aria-pressed={isGuidePlaying}
                onClick={() => setGuidePlaying(!isGuidePlaying)}
              >
                {t(
                  `${guideKey}.${isGuidePlaying ? "pauseGuide" : "playGuide"}`,
                )}
              </Button>
            </Stack>
          )}
          {isGog && (
            <Stack mt="md" gap="xs">
              <Text size="sm">
                {t("preferences.delegatedCode.gog.coverage")}
              </Text>
              <Text size="xs" c="dimmed">
                {t("preferences.delegatedCode.gog.expiryHint")}
              </Text>
              <TextInput
                readOnly
                label={t("preferences.delegatedCode.gog.signInUrl")}
                description={t("preferences.delegatedCode.gog.desktopFallback")}
                value={authorizationUrl}
                onFocus={(event) => event.currentTarget.select()}
              />
            </Stack>
          )}
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
              {isGog ? (
                <Mark color="brand">
                  https://embed.gog.com/on_login_success?origin=client&amp;code=…
                </Mark>
              ) : isNintendo ? (
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
                  ? isGog
                    ? t("preferences.delegatedCode.gog.invalidLink")
                    : isNintendo
                      ? t(
                          invalid === "otherAttempt"
                            ? "preferences.delegatedCode.nintendo.otherAttempt"
                            : "preferences.delegatedCode.nintendo.invalidLink",
                        )
                      : t("preferences.delegatedCode.invalidCode", {
                          type: name,
                        })
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
              {t(
                isGog
                  ? "preferences.delegatedCode.gog.expiryHint"
                  : "preferences.delegatedCode.expiryHint",
              )}
            </Text>
            {failed && (
              <Alert color="red">
                {isGog
                  ? t("preferences.delegatedCode.gog.callbackFailed")
                  : getErrorMessage(callbackMutation.error)}
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
                  const result = isGog
                    ? checkGogUrl(value)
                    : isNintendo
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
