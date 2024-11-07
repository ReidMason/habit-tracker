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
  const firstDayOfMonth = new Date(year, month, 1);
  const mondayBeforeFirstDayOfMonth = new Date(
    firstDayOfMonth.setDate(
      firstDayOfMonth.getDate() - firstDayOfMonth.getDay() + 1
    )
  );
  const daysInMonth = [] as Date[];
  const daysDisplayed = 35;
  for (let i = 0; i < daysDisplayed; i++) {
    const newdate = new Date(mondayBeforeFirstDayOfMonth);
    newdate.setDate(mondayBeforeFirstDayOfMonth.getDate() + i);
    daysInMonth.push(newdate);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between">
        <p className="text-xl">{habit.name}</p>
        <HabitContextMenu habit={habit} fetchHabits={fetchHabits} />
      </div>
      <div className="grid grid-cols-7">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="text-center">
            {["M", "T", "W", "T", "F", "S", "S"][index]}
          </div>
        ))}
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
//{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
