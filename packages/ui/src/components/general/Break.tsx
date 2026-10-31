import { ComponentPropsWithoutRef } from "react";

type IBreakProps = ComponentPropsWithoutRef<"div">;

const Break = ({ ...props }: IBreakProps) => {
  return <div className="basis-full" {...props}></div>;
};

export { Break };
