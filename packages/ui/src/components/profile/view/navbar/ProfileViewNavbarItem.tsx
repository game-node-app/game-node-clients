import { Stack, Text, UnstyledButton } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";

export interface ProfileViewNavbarItemProps {
  label: string;
  count?: string;
  active: boolean;
  onClick: () => void;
}

const ProfileViewNavbarItem = ({
  label,
  count,
  active,
  onClick,
}: ProfileViewNavbarItemProps) => (
  <UnstyledButton
    onClick={onClick}
    aria-current={active ? "page" : undefined}
    className="shrink-0 rounded-md px-0.5 py-1 text-white transition-colors hover:bg-paper-3 aria-[current=page]:bg-paper-4 sm:px-4"
  >
    <Stack gap={2} align="center">
      <Text
        component="span"
        fw={600}
        className="text-[clamp(1.125rem,6vw,1.75rem)] leading-none tracking-tight tabular-nums [font-variation-settings:'wdth'_75] sm:text-[2.5rem]"
      >
        {count ?? "—"}
      </Text>
      <Text
        component="span"
        c="dimmed"
        className="flex items-center text-center text-[0.6875rem] leading-tight [overflow-wrap:normal] sm:gap-1 sm:text-sm"
      >
        {label}
        <IconChevronRight
          size={14}
          className="hidden shrink-0 sm:block"
          aria-hidden
        />
      </Text>
    </Stack>
  </UnstyledButton>
);

export { ProfileViewNavbarItem };
