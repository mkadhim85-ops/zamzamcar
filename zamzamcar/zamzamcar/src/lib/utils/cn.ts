import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine class names with Tailwind merge to handle conflicts properly.
 *
 * Without twMerge: cn("px-2", "px-4") → "px-2 px-4" (both applied, last wins)
 * With twMerge: cn("px-2", "px-4") → "px-4" (conflict resolved correctly)
 *
 * Use this everywhere instead of template strings for class composition.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
