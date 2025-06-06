import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Unit conversion utilities
export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 100) / 100;
}

export function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.20462) * 100) / 100;
}

export function convertWeight(
  weight: number,
  fromUnit: "kg" | "lbs",
  toUnit: "kg" | "lbs",
): number {
  if (fromUnit === toUnit) return weight;
  return fromUnit === "kg" ? kgToLbs(weight) : lbsToKg(weight);
}

export function formatWeight(weight: number, unit: "kg" | "lbs"): string {
  return `${weight}${unit}`;
}
