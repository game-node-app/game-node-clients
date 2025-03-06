import { PROJECT_CONTEXT } from "#@/util";
import { useMemo } from "react";

/**
 * Returns true if the current platform context is 'mobile'
 * This can be either PWA or native.
 * Not to be confused with {@link useOnMobile}, which detects breakpoints.
 */
export function useOnMobilePlatform() {
  return useMemo(() => PROJECT_CONTEXT.client === "mobile", []);
}
