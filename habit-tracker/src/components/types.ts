import type { Habit } from "@/lib/api";

export type FetchHabits = () => Promise<Habit[]>;
