import { zodResolver } from "@hookform/resolvers/zod";
import { Group, Stack, Text, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";
import { Profile, ProfileService } from "@repo/wrapper/server";
import { IconAlertCircle } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useId } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { SettingsButton } from "#@/components/settings/common/SettingsButton";
import {
  getSettingsProfileInputClassNames,
  SettingsProfileField,
} from "#@/components/settings/tabs/profile/SettingsProfileField";
import { createErrorNotification, getErrorMessage } from "#@/util";

/** Shown in `profile.usernameRules.minLength`. */
const USERNAME_MIN_LENGTH = 5;
/** Server limit (`UpdateProfileDto.username.maxLength`). */
const USERNAME_MAX_LENGTH = 20;
/** Shown in `profile.usernameRules.cooldown`. */
const USERNAME_COOLDOWN_DAYS = 30;

const createUsernameFormSchema = (
  t: ReturnType<typeof useTranslation<"common">>["t"],
) =>
  z.object({
    username: z
      .string()
      .trim()
      .min(USERNAME_MIN_LENGTH, t("profile.usernameRules.minLength"))
      .max(
        USERNAME_MAX_LENGTH,
        t("settings.profile.username.errors.maxLength", {
          max: USERNAME_MAX_LENGTH,
        }),
      ),
  });

type UsernameFormValues = z.infer<ReturnType<typeof createUsernameFormSchema>>;

/** Date from which the username can be changed again, or null if it can be changed now. */
function getUsernameCooldownEnd(profile: Profile | undefined) {
  if (!profile?.usernameLastUpdatedAt) return null;
  const end = dayjs(profile.usernameLastUpdatedAt).add(
    USERNAME_COOLDOWN_DAYS,
    "day",
  );
  return end.isAfter(dayjs()) ? end.toDate() : null;
}

interface Props {
  userId: string;
}

/**
 * Inline username editor. Changing the @ is saved on its own ("Change to @x"),
 * not through the tab's "Save changes" bar, because it has a 30-day cooldown.
 * There's no live availability check: a taken @ comes back as a server error
 * and is shown on the field.
 */
export function SettingsProfileUsernameField({ userId }: Props) {
  const { t, i18n } = useTranslation();
  const inputId = useId();
  const errorId = useId();
  const profileQuery = useUserProfile(userId);
  const currentUsername = profileQuery.data?.username ?? "";

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<UsernameFormValues>({
    resolver: zodResolver(createUsernameFormSchema(t)),
    defaultValues: { username: currentUsername },
  });

  // Keeps the field in sync with the saved username (first load, after a change).
  useEffect(() => {
    reset({ username: currentUsername });
  }, [currentUsername, reset]);

  const value = useWatch({ control, name: "username" }) ?? "";
  const nextUsername = value.trim();
  const isChanged = profileQuery.data != undefined && value !== currentUsername;

  const cooldownEnd = getUsernameCooldownEnd(profileQuery.data);
  const isOnCooldown = cooldownEnd != null;

  const usernameMutation = useMutation({
    mutationFn: (username: string) =>
      ProfileService.profileControllerUpdateV1({ username }),
    onError: (err: Error) => {
      createErrorNotification(err);
      setError("username", {
        type: "server",
        message:
          getErrorMessage(err) ||
          t("settings.profile.username.errors.updateFailed"),
      });
    },
    onSuccess: (_, username) => {
      notifications.show({
        color: "green",
        message: t("profile.messages.usernameUpdated"),
      });
      reset({ username });
      return profileQuery.invalidate();
    },
  });

  const onSubmit = ({ username }: UsernameFormValues) => {
    if (username === currentUsername) {
      reset({ username: currentUsername });
      return;
    }
    usernameMutation.mutate(username);
  };

  const errorMessage = errors.username?.message;
  const hasError = errorMessage != undefined;

  return (
    <form className={"w-full"} noValidate onSubmit={handleSubmit(onSubmit)}>
      <SettingsProfileField
        label={t("settings.profile.username.label")}
        htmlFor={inputId}
        error={errorMessage}
        errorId={errorId}
        help={
          isOnCooldown
            ? t("settings.profile.username.cooldown", {
                date: cooldownEnd.toLocaleDateString(i18n.language, {
                  dateStyle: "long",
                }),
              })
            : undefined
        }
        footer={
          isChanged &&
          !isOnCooldown && (
            <Stack gap={12} className={"mt-1"}>
              <Stack
                gap={6}
                className={
                  "rounded-lg border border-solid border-[#2a2a2a] bg-[#0b0b0b] px-3.5 py-3"
                }
              >
                <Text fz={14} fw={600} c={"white"} lh={"normal"}>
                  {t("settings.profile.username.rulesTitle")}
                </Text>
                {[
                  t("settings.profile.username.rulesCurrent", {
                    username: currentUsername,
                  }),
                  t("profile.usernameRules.unique"),
                  t("profile.usernameRules.minLength"),
                  t("profile.usernameRules.cooldown"),
                ].map((rule) => (
                  <Text
                    key={rule}
                    fz={13}
                    lh={"18px"}
                    className={"text-[#adadad]"}
                  >
                    {rule}
                  </Text>
                ))}
              </Stack>
              <Group gap={8} justify={"flex-end"}>
                <SettingsButton
                  variant={"ghost"}
                  type={"button"}
                  disabled={usernameMutation.isPending}
                  onClick={() => reset({ username: currentUsername })}
                >
                  {t("actions.cancel")}
                </SettingsButton>
                <SettingsButton
                  variant={"primary"}
                  type={"submit"}
                  loading={usernameMutation.isPending}
                  disabled={nextUsername.length === 0}
                >
                  {t("settings.profile.username.submit", {
                    username: nextUsername,
                  })}
                </SettingsButton>
              </Group>
            </Stack>
          )
        }
      >
        <TextInput
          id={inputId}
          {...register("username")}
          disabled={profileQuery.data == undefined || isOnCooldown}
          readOnly={usernameMutation.isPending}
          autoComplete={"off"}
          autoCapitalize={"none"}
          spellCheck={false}
          maxLength={USERNAME_MAX_LENGTH}
          radius={8}
          error={hasError}
          aria-describedby={hasError ? errorId : undefined}
          leftSection={
            <Text fz={14} lh={"normal"} className={"text-[#7a7a7a]"}>
              @
            </Text>
          }
          leftSectionWidth={30}
          leftSectionPointerEvents={"none"}
          rightSection={
            hasError ? (
              <IconAlertCircle size={16} className={"text-[#e5484d]"} />
            ) : undefined
          }
          rightSectionPointerEvents={"none"}
          classNames={getSettingsProfileInputClassNames(hasError)}
        />
      </SettingsProfileField>
    </form>
  );
}
