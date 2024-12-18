import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import HabitRow from "@/components/habitLayouts/longMonth/HabitRow";
import type { Habit } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { FetchHabits } from "../types";

interface SortableItemProps {
  className?: string;
  id: string;
  habit: Habit;
  selectedDate: Date;
  fetchHabits: FetchHabits;
  createHabitEntry: (habitId: number, date: Date) => Promise<void>;
}

export function SortableItem({
  className,
  id,
  habit,
  selectedDate,
  fetchHabits,
  createHabitEntry,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr ref={setNodeRef} className={cn("touch-none", className)} style={style}>
      <HabitRow
        habit={habit}
        selectedDate={selectedDate}
        fetchHabits={fetchHabits}
        attributes={attributes}
        listeners={listeners}
        createHabitEntry={createHabitEntry}
      />
    </tr>
  );
}
