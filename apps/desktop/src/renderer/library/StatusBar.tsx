import { CloseButton } from "@mantine/core";
import { IconAlertTriangle, IconCloudOff } from "@tabler/icons-react";

// Single 32 px slot under the top bar, so showing or hiding it only moves the content top.
export function StatusBar({
  offline,
  error,
  onDismiss,
}: {
  offline: boolean;
  error?: string;
  onDismiss: () => void;
}) {
  const content = error
    ? { icon: IconAlertTriangle, text: error, className: "text-danger" }
    : offline
      ? {
          icon: IconCloudOff,
          text: "Offline",
          className: "text-dimmed-1",
        }
      : undefined;
  if (!content) return null;
  return (
    <div
      role={error ? "alert" : "status"}
      className={`flex h-8 shrink-0 items-center gap-xs bg-paper-1 px-md ${content.className}`}
    >
      <content.icon size={16} />
      <span className="flex-1 truncate text-sm">{content.text}</span>
      {error && (
        <CloseButton size="sm" aria-label="Dismiss" onClick={onDismiss} />
      )}
    </div>
  );
}
