import { Box } from "@mantine/core";
import type { ReactNode } from "react";
import styles from "../About.module.css";

type AboutCardProps = {
  children: ReactNode;
  className?: string;
};

/** Dark bordered surface used by the About mockups. */
const AboutCard = ({ children, className }: AboutCardProps) => (
  <Box className={[styles.card, className].filter(Boolean).join(" ")}>
    {children}
  </Box>
);

export { AboutCard };
export type { AboutCardProps };
