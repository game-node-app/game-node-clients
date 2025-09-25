import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * A utility function to merge tailwind classes AND clsx classes.
 * @see https://github.com/lukeed/clsx#usage
 * @param args
 */
export function cn(...args: ClassValue[]) {
  return twMerge(clsx(args));
}
