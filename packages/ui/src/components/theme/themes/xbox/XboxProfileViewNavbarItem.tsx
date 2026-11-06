import { Tabs } from "@mantine/core";
import type { ProfileViewNavbarItemProps } from "#@/components/profile/view/navbar/ProfileViewNavbarItem";

/**
 * Xbox profile tab: a pill with the label and its count, filled when selected. Styled in xbox/theme.css.
 */
const XboxProfileViewNavbarItem = ({
  label,
  count,
  value,
  // the pill shows no icon; Mantine marks the selected tab with data-active; tabs switch in place, no href
  activeTab: _activeTab,
  icon: _icon,
  href: _href,
  ...others
}: ProfileViewNavbarItemProps) => {
  return (
    <Tabs.Tab value={value} className={"gn-profile-tab"} {...others}>
      {label}
      {count != undefined && <span className={"gn-profile-tab-count"}>{count}</span>}
    </Tabs.Tab>
  );
};

export { XboxProfileViewNavbarItem };
