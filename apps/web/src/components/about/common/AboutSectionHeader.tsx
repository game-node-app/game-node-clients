import { Stack, Text, Title } from "@mantine/core";
import type { ReactNode } from "react";
import styles from "../About.module.css";

type AboutSectionHeaderProps = {
  eyebrow: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  titleId?: string;
  className?: string;
};

const AboutSectionHeader = ({
  eyebrow,
  title,
  description,
  align = "left",
  titleId,
  className,
}: AboutSectionHeaderProps) => {
  const center = align === "center";

  return (
    <Stack
      gap={14}
      className={[
        styles.sectionHeader,
        center ? styles.sectionHeaderCenter : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      align={center ? "center" : "flex-start"}
      ta={center ? "center" : "left"}
    >
      <Text component="p" className={styles.eyebrow}>
        {eyebrow}
      </Text>
      <Title order={2} id={titleId} className={styles.title}>
        {title}
      </Title>
      {description ? (
        <Text component="p" className={styles.description}>
          {description}
        </Text>
      ) : null}
    </Stack>
  );
};

export { AboutSectionHeader };
export type { AboutSectionHeaderProps };
