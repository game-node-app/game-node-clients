import React from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Input,
  mergeMantineTheme,
  MultiSelect,
  Select,
  Tabs,
  Timeline,
} from "@mantine/core";
import { DEFAULT_MANTINE_THEME } from "@repo/ui";
import classes from "./theme.module.css";
import { IconChevronDown } from "@tabler/icons-react";

export const MANTINE_THEME = mergeMantineTheme(DEFAULT_MANTINE_THEME, {
  components: {
    ActionIcon: ActionIcon.extend({
      classNames: {
        root: classes.actionIcon,
      },
    }),
    Badge: Badge.extend({
      classNames: {
        root: classes.badge,
      },
      defaultProps: {
        variant: "filled",
      },
    }),
    Timeline: Timeline.extend({
      classNames: {
        root: classes.timeline,
      },
    }),
    Tabs: Tabs.extend({
      classNames: {
        root: classes.tab,
      },
      defaultProps: {
        variant: "default",
      },
    }),
    Input: Input.extend({
      classNames: {
        input: classes.input,
      },
    }),
    Select: Select.extend({
      defaultProps: {
        rightSection: <IconChevronDown height={20} width={30} />,
      },
    }),
    MultiSelect: MultiSelect.extend({
      defaultProps: {
        rightSection: <IconChevronDown height={20} width={30} />,
      },
    }),
    Button: Button.extend({
      classNames: {
        root: classes.button,
      },
    }),
  },
});
