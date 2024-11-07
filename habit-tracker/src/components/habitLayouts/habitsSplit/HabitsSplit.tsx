import type { CreateHabitEntry, FetchHabits } from "@/components/types";
import type { Habit } from "@/lib/api";
import HabitGridElement from "./HabitGridElement";

interface Props {
  habits: Habit[];
  fetchHabits: FetchHabits;
  createHabitEntry: CreateHabitEntry;
  updateHabits: (habits: Habit[]) => Promise<void>;
  pivotDate: Date;
}

export default function HabitsSplit({
  habits,
  fetchHabits,
  updateHabits,
  pivotDate,
  createHabitEntry,
}: Props) {
  return (
    <div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {habits.map((habit) => (
          <HabitGridElement
            key={habit.id}
            habit={habit}
            createHabitEntry={createHabitEntry}
            fetchHabits={fetchHabits}
            year={pivotDate.getFullYear()}
            month={pivotDate.getMonth()}
          />
        ))}
      </div>
    </div>
  );
}
