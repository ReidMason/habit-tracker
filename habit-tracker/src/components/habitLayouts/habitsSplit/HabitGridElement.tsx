import HabitCell from "@/components/habits/HabitCell";
import HabitContextMenu from "@/components/habits/HabitContextMenu";
import type { CreateHabitEntry, FetchHabits } from "@/components/types";
import { type Habit } from "@/lib/api";
import { getDaysInMonth } from "@/lib/dates";
import { getMatchingEntry } from "@/lib/habits";

interface Props {
  habit: Habit;
  createHabitEntry: CreateHabitEntry;
  fetchHabits: FetchHabits;
  year: number;
  month: number;
}

export default function HabitGridElement({
  habit,
  createHabitEntry,
  fetchHabits,
  year,
  month,
}: Props) {
  const daysInMonth = getDaysInMonth(year, month);

  return (
    <div className="text-xl flex flex-col gap-2">
      <div className="flex justify-between">
        <p>{habit.name}</p>
        <HabitContextMenu habit={habit} fetchHabits={fetchHabits} />
      </div>
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
  );
}
