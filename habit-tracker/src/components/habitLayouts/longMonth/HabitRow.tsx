import { type Habit } from "@/lib/api";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { cn } from "@/lib/utils";
import type { FetchHabits } from "@/components/types";
import HabitCell from "@/components/habits/HabitCell";
import { getMatchingEntry } from "@/lib/habits";
import HabitContextMenu from "@/components/habits/HabitContextMenu";

interface HabitRowProps {
  habit: Habit;
  selectedDate: Date;
  fetchHabits: FetchHabits;
  attributes?: DraggableAttributes;
  listeners?: SyntheticListenerMap;
  dragging?: boolean;
  createHabitEntry: (habitId: number, date: Date) => Promise<void>;
}

export default function HabitRow({
  habit,
  selectedDate,
  fetchHabits,
  attributes,
  listeners,
  dragging,
  createHabitEntry,
}: HabitRowProps) {
  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  return (
    <>
      <td
        className={cn(
          "w-32 pr-4 flex items-center touch-none h-12",
          dragging ? "cursor-grabbing" : "cursor-grab"
        )}
        {...attributes}
        {...listeners}
      >
        <HabitContextMenu habit={habit} fetchHabits={fetchHabits} />
        {habit.name}
      </td>
      {getDaysInMonth().map((date) => {
        const entry = getMatchingEntry(habit.entries, date);
        return (
          <HabitCell
            as="td"
            key={date.toJSON()}
            habit={habit}
            entry={entry}
            date={date}
            createHabitEntry={createHabitEntry}
            fetchHabits={fetchHabits}
          />
        );
      })}
    </>
  );
}
