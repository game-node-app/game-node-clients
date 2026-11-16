import { Box, Text } from "@mantine/core";
import type { ReactNode } from "react";
import styles from "../About.module.css";

type AboutCoverProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Primary caption, usually the game title. */
  title?: ReactNode;
  /** Secondary caption, usually a status or playtime. */
  meta?: ReactNode;
  /** Marks the first hero cover so the browser fetches it eagerly. */
  priority?: boolean;
  className?: string;
};

const AboutCover = ({
  src,
  alt,
  width,
  height,
  title,
  meta,
  priority = false,
  className,
}: AboutCoverProps) => (
  <Box
    component="figure"
    className={[styles.cover, className].filter(Boolean).join(" ")}
  >
    <img
      className={styles.coverImage}
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
    />
    {title || meta ? (
      <Box component="figcaption" className={styles.coverCaption}>
        {title ? (
          <Text component="span" className={styles.coverTitle}>
            {title}
          </Text>
        ) : null}
        {meta ? (
          <Text component="span" className={styles.coverMeta}>
            {meta}
          </Text>
        ) : null}
      </Box>
    ) : null}
  </Box>
);

export { AboutCover };
export type { AboutCoverProps };
