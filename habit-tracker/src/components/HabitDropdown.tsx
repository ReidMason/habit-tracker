import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { deleteHabit, Habit } from "@/lib/api";

interface HabitDropdownProps {
  habit: Habit;
  refreshHabits: (habitId: number) => Promise<void>;
  editHabit: () => void;
}

export default function HabitDropdown({
  habit,
  refreshHabits,
  editHabit,
}: HabitDropdownProps) {
  const removeHabit = async () => {
    await deleteHabit(habit.id);
    await refreshHabits(habit.id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="px-1">
          <DotsVerticalIcon className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem onClick={editHabit}>Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={removeHabit}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
