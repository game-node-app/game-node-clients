import {
  mergeMantineTheme,
  ActionIcon,
  Text,
  Button,
  Badge,
} from "@mantine/core";
import { DEFAULT_MANTINE_THEME } from "@repo/ui";

export const MANTINE_THEME = mergeMantineTheme(DEFAULT_MANTINE_THEME, {
  primaryShade: 5,
  components: {
    ActionIcon: ActionIcon.extend({
      classNames: {
        root: "data-[variant='default']:bg-[#1D1D1D] border-0",
      },
    }),
    Badge: Badge.extend({
      classNames: {
        root: "data-[variant='filled']:bg-[#872C13]",
      },
      defaultProps: {
        variant: "filled",
      },
    }),
  },
});
