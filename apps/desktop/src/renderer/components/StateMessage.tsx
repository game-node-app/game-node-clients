import type { ReactNode } from "react";
import { Button, Loader, Text } from "@mantine/core";
import type { Icon } from "@tabler/icons-react";

// Design-system "Feedback" state: icon in a raised circle, title, dimmed text, at most one action.
export function StateMessage({
  icon: StateIcon,
  loading,
  title,
  text,
  action,
}: {
  icon?: Icon;
  loading?: boolean;
  title: string;
  text?: ReactNode;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-sm p-xl text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-paper-1">
        {loading ? (
          <Loader size="sm" />
        ) : (
          StateIcon && <StateIcon size={28} className="text-dimmed-1" />
        )}
      </div>
      <Text fw={600} size="lg">
        {title}
      </Text>
      {text && (
        <Text c="dimmed" size="sm" maw={360}>
          {text}
        </Text>
      )}
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}
