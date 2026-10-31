export function useOnTouchDevice() {
  return (
    typeof window !== "undefined" &&
    ("ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      ((navigator as Navigator & { msMaxTouchPoints?: number })
        .msMaxTouchPoints ?? 0) > 0)
  );
}
