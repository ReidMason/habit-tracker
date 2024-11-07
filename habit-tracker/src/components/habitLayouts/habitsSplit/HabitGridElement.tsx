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
    <div className="flex flex-col gap-2">
      <div className="flex justify-between">
        <p className="text-xl">{habit.name}</p>
        <HabitContextMenu habit={habit} fetchHabits={fetchHabits} />
      </div>
      <div className="grid grid-cols-7 border">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="text-center border-b">
            {["M", "T", "W", "T", "F", "S", "S"][index]}
          </div>
        ))}

        {Array.from({ length: daysInMonth[0].getDay() - 1 }).map((_, index) => (
          <div key={index} className="relative text-center text-gray-300"></div>
        ))}

        {daysInMonth.map((date) => {
          const entry = getMatchingEntry(habit.entries, date);
          return (
            <HabitCell
              ring
              key={date.toJSON()}
              habit={habit}
              entry={entry}
              date={date}
              createHabitEntry={createHabitEntry}
              fetchHabits={fetchHabits}
              displayCurrentDayIndicator
            />
          );
        })}
      </div>
    </div>
  );
}
