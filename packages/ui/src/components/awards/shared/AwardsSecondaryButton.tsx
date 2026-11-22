import { Button, type ButtonProps } from "@mantine/core";
import type { ButtonHTMLAttributes } from "react";

export type AwardsSecondaryButtonProps = Omit<ButtonProps, "variant"> &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonProps> &
  Record<`data-${string}`, boolean | string | undefined>;

/**
 * Secondary action of the Awards frames ("Compartilhar minha cédula",
 * "Compartilhar meu placar", "Ver categorias"): raised panel fill, strong
 * line border, 10 px radius and the 15 px semibold button label.
 */
const AwardsSecondaryButton = (props: AwardsSecondaryButtonProps) => {
  return (
    <Button
      variant={"default"}
      radius={10}
      styles={{
        root: {
          height: "auto",
          padding: "14px 22px",
          backgroundColor: "var(--gn-panel-raised)",
          borderColor: "var(--gn-line-strong)",
          color: "var(--gn-text)",
        },
        label: { fontSize: 15, fontWeight: 600, lineHeight: 1.33 },
      }}
      {...props}
    />
  );
};

export { AwardsSecondaryButton };
