import { UnstyledButton } from "@mantine/core";
import type { ProfileViewNavbarItemProps } from "#@/components/profile/view/navbar/ProfileViewNavbarItem";
import classes from "./XboxProfileViewNavbarItem.module.css";

/**
 * Xbox profile tab: a pill with the label and its count, filled when selected.
 *
 * It receives the same props as the default navbar item (label, count, active,
 * onClick), so switching tabs keeps the default query-string navigation and
 * focus handling in `ProfileViewContent`.
 */
const XboxProfileViewNavbarItem = ({
  label,
  count,
  active,
  onClick,
}: ProfileViewNavbarItemProps) => {
  return (
    <UnstyledButton
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      data-active={active ? "" : undefined}
      className={classes.tab}
    >
      <span>{label}</span>
      {count != undefined && <span className={classes.count}>{count}</span>}
    </UnstyledButton>
  );
};

export { XboxProfileViewNavbarItem };
