import { PropsWithChildren } from "react";
import { useMatomoTracker } from "@/components/general/hooks/useMatomoTracker";

const MatomoTracker = ({ children }: PropsWithChildren) => {
  useMatomoTracker();
  return children;
};

export default MatomoTracker;
