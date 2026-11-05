import { IconChevronDown } from "@tabler/icons-react";
import { ReactNode } from "react";
import { SettingsButton } from "#@/components/settings/common/SettingsButton";
import { SettingsComingSoonBadge } from "#@/components/settings/common/SettingsPill";

/** Section title followed by the "Coming soon" pill (the pill is inline, so it fits inside the title text). */
export function SettingsComingSoonTitle({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <SettingsComingSoonBadge className={"ms-2 align-middle"} />
    </>
  );
}

/** Read-only stand-in for a select without backend: shows today's behaviour, disabled. */
export function SettingsDisabledSelect({ label }: { label: ReactNode }) {
  return (
    <SettingsButton
      variant={"secondary"}
      disabled
      className={"pe-2.5 ps-3 font-normal"}
      rightSection={<IconChevronDown size={14} className={"text-[#adadad]"} />}
      classNames={{ section: "ms-2" }}
    >
      {label}
    </SettingsButton>
  );
}
