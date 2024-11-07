import type { Habit } from "@/lib/api";

export type FetchHabits = () => Promise<Habit[]>;
export type CreateHabitEntry = (habitId: number, date: Date) => Promise<void>;
