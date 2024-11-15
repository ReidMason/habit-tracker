import { deleteHabit, updateHabit, type Habit } from "@/lib/api";
import type { FetchHabits } from "../types";
import { useState } from "react";
import HabitDialog from "./HabitDialog";
import ConfirmDialog from "../confirmDialog/ConfirmDialog";
import HabitDropdown from "./HabitDropdown";

interface HabitContextMenuProps {
  habit: Habit;
  fetchHabits: FetchHabits;
}

export default function HabitContextMenu({
  habit,
  fetchHabits,
}: HabitContextMenuProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

  const editHabit = async (newHabit: Habit) => {
    await updateHabit(newHabit);
    await fetchHabits();
  };

  const removeHabit = async (habit: Habit) => {
    await updateHabit({ ...habit, active: false });
    await fetchHabits();
  };

  return (
    <>
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
    </>
  );
}
