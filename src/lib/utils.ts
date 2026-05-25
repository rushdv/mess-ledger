import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Combines tailwind classes safely using clsx and tailwind-merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formats a number as Bangladeshi Taka (BDT)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("bn-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
  }).format(amount);
}

// Formats a Date object or string as DD MMM YYYY (e.g. 26 May 2026)
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getMonthName(month: number): string {
  return new Date(2000, month - 1, 1).toLocaleString("en-US", { month: "long" });
}

export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}
