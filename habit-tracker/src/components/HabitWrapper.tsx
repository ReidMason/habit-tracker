import { getHabits, updateHabits, type Habit } from "@/lib/api";
import { useEffect, useState } from "react";
import Month from "@/components/habitLayouts/longMonth/Month";
import MonthSelector from "@/components/habitLayouts/longMonth/MonthSelector";
import type { FetchHabits } from "./types";

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

  return (
    <div className="border rounded-xl inline-flex flex-col p-4">
      <MonthSelector pivotDate={pivotDate} setPivotDate={setPivotDate} />
      <Month
        habits={habits}
        pivotDate={pivotDate}
        fetchHabits={fetchHabits}
        updateHabits={updateAllHabits}
      />
    </div>
  );
}
