import {
  createHabitEntry,
  getHabits,
  updateHabits,
  type Habit,
} from "@/lib/api";
import { useEffect, useState } from "react";
import Month from "@/components/habitLayouts/longMonth/Month";
import MonthSelector from "@/components/habitLayouts/longMonth/MonthSelector";
import type { CreateHabitEntry, FetchHabits } from "./types";
import HabitsSplit from "./habitLayouts/habitsSplit/HabitsSplit";
import { tryTriggerConfetti } from "@/lib/utils";

const userId = 1;

export default function HabitWrapper() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [pivotDate, setPivotDate] = useState(new Date());

  const fetchHabits: FetchHabits = async () => {
    const response = await getHabits(userId);
    setHabits(response);
    return response;
  };

  const updateAllHabits = async (habits: Habit[]) => {
    setHabits(habits);
    await updateHabits(userId, habits);
    await fetchHabits();
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const createNewHabitEntry: CreateHabitEntry = async (
    habitId: number,
    date: Date
  ) => {
    await createHabitEntry(habitId, date);
    const newHabits = await fetchHabits();
    tryTriggerConfetti(newHabits, date);
  };

  return (
    <div className="flex flex-col gap-4">
      <MonthSelector pivotDate={pivotDate} setPivotDate={setPivotDate} />
      <div className="flex flex-col gap-4">
        <div className="border rounded-xl flex-col p-4">
          <Month
            habits={habits}
            pivotDate={pivotDate}
            fetchHabits={fetchHabits}
            createHabitEntry={createNewHabitEntry}
            updateHabits={updateAllHabits}
          />
        </div>
        <div className="border rounded-xl flex-col p-4">
          <HabitsSplit
            habits={habits}
            pivotDate={pivotDate}
            fetchHabits={fetchHabits}
            createHabitEntry={createNewHabitEntry}
            updateHabits={updateAllHabits}
          />
        </div>
      </div>
    </div>
  );
}
