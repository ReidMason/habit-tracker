import { deleteHabit, updateHabit, type Habit } from "@/lib/api";
import React from "react";
import HabitDropdown from "@/components/habits/HabitDropdown";
import HabitDialog from "@/components/habits/HabitDialog";
import ConfirmDialog from "@/components/confirmDialog/ConfirmDialog";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { cn } from "@/lib/utils";
import type { FetchHabits } from "@/components/types";
import HabitCell from "@/components/habits/HabitCell";
import { getMatchingEntry } from "@/lib/habits";

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
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = React.useState(false);

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

  const editHabit = async (newHabit: Habit) => {
    await updateHabit(newHabit);
    await fetchHabits();
  };

  const removeHabit = async (habit: Habit) => {
    await deleteHabit(habit.id);
    await fetchHabits();
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
        <HabitDialog
          title="Edit Habit"
          description="Edit the habit details"
          confirmText="Save"
          habit={habit}
          submit={editHabit}
          open={editDialogOpen}
          setOpen={setEditDialogOpen}
        />
        <ConfirmDialog
          title="Remove Habit"
          description="Are you sure you want to remove this habit?"
          confirmText="Remove"
          habit={habit}
          submit={removeHabit}
          open={removeDialogOpen}
          setOpen={setRemoveDialogOpen}
        />
        <HabitDropdown
          habit={habit}
          editHabit={() => setEditDialogOpen(true)}
          removeHabit={() => setRemoveDialogOpen(true)}
        />
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
