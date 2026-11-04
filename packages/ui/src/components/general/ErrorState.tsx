import { ReactNode } from "react";
import {
  Group,
  MantineColor,
  Stack,
  StackProps,
  Text,
  ThemeIcon,
  Title,
  TitleOrder,
} from "@mantine/core";
import type { Icon } from "@tabler/icons-react";
import { cn } from "#@/util/cn";

interface Props extends StackProps {
  title: string;
  description?: string;
  icon?: Icon;
  /** Large label above the title, e.g. "404". */
  code?: string;
  color?: MantineColor;
  titleOrder?: TitleOrder;
  /** Recovery actions, e.g. retry and a way back. */
  actions?: ReactNode;
}

/**
 * Centered error/empty state with a way to recover.
 */
const ErrorState = ({
  title,
  description,
  icon: StateIcon,
  code,
  color = "red",
  titleOrder = 2,
  actions,
  className,
  ...others
}: Props) => (
  <Stack
    className={cn("w-full max-w-md mx-auto py-16 items-center text-center gap-5", className)}
    {...others}
  >
    {code && (
      <Text
        component={"span"}
        c={color}
        fw={900}
        lh={1}
        className={"text-7xl sm:text-8xl tracking-tight"}
      >
        {code}
      </Text>
    )}
    {StateIcon && (
      <ThemeIcon size={64} radius={"xl"} variant={"light"} color={color}>
        <StateIcon size={32} stroke={1.5} />
      </ThemeIcon>
    )}
    <Stack className={"gap-1.5"}>
      <Title order={titleOrder} size={"h3"}>
        {title}
      </Title>
      {description && <Text c={"dimmed"}>{description}</Text>}
    </Stack>
    {actions && <Group className={"justify-center gap-3"}>{actions}</Group>}
  </Stack>
);

export { ErrorState };
