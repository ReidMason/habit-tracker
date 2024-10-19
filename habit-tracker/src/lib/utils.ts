import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
  };

  return date.toLocaleDateString("en-gb", options);
}

export function datesMatch(date: Date, date2: Date) {
  return date.toDateString() === date2.toDateString();
}
