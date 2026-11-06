import React from "react";

interface Props {
  imageUrl: string | undefined;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Full-bleed game art faded into the page background.
 */
const GameBackdrop = ({ imageUrl, className, style }: Props) => {
  return (
    <div
      className={className}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "80vh",
        backgroundImage: `
              linear-gradient(180deg,rgba(0, 0, 0, 0.1) 0%, rgba(10, 10, 10, 0.6) 34%, var(--gn-backdrop-fade, var(--gn-paper-3)) 87%),
              url(${imageUrl})
            `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        zIndex: 9,
        opacity: 0.6,
        ...style,
      }}
    />
  );
};

export { GameBackdrop };
