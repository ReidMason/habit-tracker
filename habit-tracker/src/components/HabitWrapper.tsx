import { getHabits, updateHabits, type Habit } from "@/lib/api";
import { useEffect, useState } from "react";
import Month from "./habitLayouts/Month";
import MonthSelector from "./habitLayouts/MonthSelector";
import { datesMatch, triggerConfetti } from "@/lib/utils";

const userId = 1;

export default function HabitWrapper() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [pivotDate, setPivotDate] = useState(new Date());

  const fetchHabits = async (firstLoad: boolean = false) => {
    const response = await getHabits(userId);
    setHabits(response);

    if (!firstLoad) checkCompleteDay(response);
  };

  const checkCompleteDay = (habits: Habit[]) => {
    const today = new Date();
    const completedHabits = habits.filter((habit) => {
      const entry = habit.entries.find((entry) => {
        return datesMatch(new Date(entry.date), today);
      });
      return entry;
    });

    if (completedHabits.length === habits.length) {
      triggerConfetti();
    }
  };

  const updateAllHabits = async (habits: Habit[]) => {
    setHabits(habits);
    await updateHabits(userId, habits);
    await fetchHabits();
  };

  useEffect(() => {
    fetchHabits(true);
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
