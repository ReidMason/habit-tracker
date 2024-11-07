import HabitCell from "@/components/habits/HabitCell";
import type { CreateHabitEntry, FetchHabits } from "@/components/types";
import type { Habit } from "@/lib/api";
import { getDaysInMonth } from "@/lib/dates";
import { getMatchingEntry } from "@/lib/habits";

interface Props {
  habit: Habit;
  createHabitEntry: CreateHabitEntry;
  fetchHabits: FetchHabits;
}

export default function HabitGridElement({
  habit,
  createHabitEntry,
  fetchHabits,
}: Props) {
  const daysInMonth = getDaysInMonth(2024, 10);

  return (
    <div className="text-xl flex flex-col gap-2">
      <p>{habit.name}</p>
      <div className="inline-flex">
        <div className="grid grid-cols-7">
          {daysInMonth.map((date) => {
            const entry = getMatchingEntry(habit.entries, date);
            return (
              <HabitCell
                key={date.toJSON()}
                habit={habit}
                entry={entry}
                date={date}
                createHabitEntry={createHabitEntry}
                fetchHabits={fetchHabits}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
