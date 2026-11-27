import { useTranslation } from "@repo/locales";
import { cn, getErrorMessage } from "#@/util";

import { PixelButton } from "../scene/PixelButton";

export interface GuildQueryErrorProps {
  error?: unknown;
  message?: string;
  onRetry: () => void;
  isRetrying?: boolean;
  className?: string;
}

/**
 * Shared retryable error block for Guild queries, styled with theme tokens.
 */
export function GuildQueryError({
  error,
  message,
  onRetry,
  isRetrying = false,
  className,
}: GuildQueryErrorProps) {
  const { t } = useTranslation();
  const errorMessage = message ?? getErrorMessage(error);

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-3 rounded-[var(--gn-radius)] border border-line bg-surface-1 p-4 text-center text-body",
        className,
      )}
    >
      <p className="m-0 text-sm text-body">{errorMessage}</p>
      <PixelButton size="sm" disabled={isRetrying} onClick={onRetry}>
        {t("guild.errors.retry")}
      </PixelButton>
    </div>
  );
}
