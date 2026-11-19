import React from "react";
import { Text } from "@mantine/core";

interface Props {
  title: string;
  children: React.ReactNode;
}

/**
 * A titled group of sidebar rows, drawn as a rounded card on the darker menu background
 * (see the Venmo / Instagram settings lists) instead of per-row borders.
 */
const MobileSidebarSection = ({ title, children }: Props) => {
  return (
    <section className={"w-full overflow-hidden rounded-3xl bg-[#1A1A1A]"}>
      <Text
        size={"xs"}
        fw={600}
        c={"dimmed"}
        className={"px-6 pt-4 pb-1 uppercase tracking-wider"}
      >
        {title}
      </Text>
      {children}
    </section>
  );
};

export { MobileSidebarSection };
