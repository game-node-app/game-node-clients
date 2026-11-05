import { ActionIcon, Tooltip, VisuallyHidden } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { SettingsButton } from "#@/components/settings/common";

interface Props {
  value: string;
  /** Square icon button (prompt examples) instead of the "Copy" button. */
  iconOnly?: boolean;
}

type CopyState = "idle" | "copied" | "error";

/**
 * Copies `value`. The text stays visible next to the button, so a denied
 * clipboard only needs a hint to select and copy it by hand.
 */
export function McpCopyButton({ value, iconOnly = false }: Props) {
  const { t } = useTranslation();
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    window.clearTimeout(timer.current);
    let next: CopyState = "copied";
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      next = "error";
    }
    setState(next);
    timer.current = window.setTimeout(
      () => setState("idle"),
      next === "error" ? 4000 : 2000,
    );
  };

  const copied = state === "copied";
  const label = copied ? t("mcp.copied") : t("mcp.copy");
  const Icon = copied ? IconCheck : IconCopy;
  const icon = (
    <Icon size={14} className={copied ? "text-[#3dd68c]" : undefined} />
  );

  return (
    <>
      <Tooltip
        label={state === "error" ? t("mcp.copyError") : label}
        opened={state === "error" ? true : undefined}
        disabled={!iconOnly && state !== "error"}
        color={state === "error" ? "red" : undefined}
        multiline
        maw={280}
      >
        {iconOnly ? (
          <ActionIcon
            variant={"subtle"}
            color={"gray"}
            size={28}
            radius={6}
            onClick={() => void copy()}
            aria-label={label}
            className={
              "shrink-0 text-[#adadad] hover:bg-[#222] hover:text-white"
            }
          >
            {icon}
          </ActionIcon>
        ) : (
          <SettingsButton
            variant={"secondary"}
            onClick={() => void copy()}
            leftSection={icon}
            className={"shrink-0"}
          >
            {label}
          </SettingsButton>
        )}
      </Tooltip>
      <VisuallyHidden role={"status"}>
        {state === "copied"
          ? t("mcp.copied")
          : state === "error"
            ? t("mcp.copyError")
            : ""}
      </VisuallyHidden>
    </>
  );
}
