import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { createErrorNotification } from "#@/util";
import {
  getGuildErrorCode,
  isGuildEarlyAccessError,
} from "../util/guildErrors";
import { denyGuildAccess } from "./useGuildEarlyAccessGuard";

/**
 * Business codes with dedicated copy under `guild.errors.<code>` (design D7).
 * Everything else falls back to the API message through
 * `createErrorNotification`.
 */
const TRANSLATED_GUILD_ERROR_CODES = new Set([
  "guild_active_contract_limit_reached",
  "guild_contract_already_exists",
  "guild_contract_not_ready",
  "guild_contract_not_active",
  "guild_cosmetic_not_owned",
]);

type Translate = (key: string) => string;

/**
 * Shared mutation error handler: the 403 gate flips access silently, known
 * business codes show their translated message, and unknown errors keep the
 * standard red notification.
 */
export function useGuildMutationErrorHandler(): (error: unknown) => void {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useCallback(
    (error: unknown) => {
      if (isGuildEarlyAccessError(error)) {
        denyGuildAccess(queryClient, userId);
        return;
      }

      const code = getGuildErrorCode(error);
      if (code && TRANSLATED_GUILD_ERROR_CODES.has(code)) {
        console.error(error);
        notifications.show({
          color: "red",
          message: (t as unknown as Translate)(`guild.errors.${code}`),
        });
        return;
      }

      createErrorNotification(
        error instanceof Error ? error : new Error(String(error)),
      );
    },
    [queryClient, t, userId],
  );
}
