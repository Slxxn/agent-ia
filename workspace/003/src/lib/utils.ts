import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a price in cents to a display string (e.g., 1999 -> "19,99 €").
 * @param price - Price in cents (integer)
 * @returns Formatted price string
 */
export const formatPrice = (price: number): string => {
  const euros = price / 100;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(euros);
};