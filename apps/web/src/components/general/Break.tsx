import React, { ComponentPropsWithoutRef } from "react";

interface IBreakProps extends ComponentPropsWithoutRef<"div"> {}

const Break = ({ ...props }: IBreakProps) => {
    return <div className="basis-full" {...props}></div>;
};

export default Break;
