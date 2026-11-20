import { Box, BoxProps } from "@mantine/core";

const GradientSeparator = ({ ...props }: BoxProps) => {
  return (
    <Box
      w={"100%"}
      h={"0.125rem"}
      bg={
        "linear-gradient(91deg, transparent 0%, var(--gn-paper-3) 0.01%, var(--gn-text) 50.90%, var(--gn-paper-3) 100%, transparent 100%)"
      }
      {...props}
    />
  );
};

export { GradientSeparator };
