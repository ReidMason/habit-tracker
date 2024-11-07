import type { HabitEntry } from "./api";

export function getMatchingEntry(entries: HabitEntry[], date: Date) {
  return entries.find((entry) => {
    return new Date(entry.date).toDateString() === date.toDateString();
  });
}
