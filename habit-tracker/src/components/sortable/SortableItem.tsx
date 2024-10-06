import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import HabitRow from "../HabitRow";
import type { Habit } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SortableItemProps {
  className?: string;
  id: string;
  habit: Habit;
  selectedDate: Date;
  refreshHabits: (habitId: number) => Promise<void>;
}

export function SortableItem({
  className,
  id,
  habit,
  selectedDate,
  refreshHabits,
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
        refreshHabits={refreshHabits}
        attributes={attributes}
        listeners={listeners}
      />
    </tr>
  );
}
