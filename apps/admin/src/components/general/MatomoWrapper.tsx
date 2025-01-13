"use client";

import React, { PropsWithChildren } from "react";
import { useMatomoTracker } from "@/components/general/hooks/useMatomoTracker";

const MatomoWrapper = ({ children }: PropsWithChildren) => {
    useMatomoTracker();
    return children;
};

export default MatomoWrapper;
