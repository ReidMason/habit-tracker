import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { Habit } from "@/lib/api";

interface HabitDropdownProps {
  habit: Habit;
  refreshHabits: (habitId: number) => Promise<void>;
  editHabit: () => void;
  removeHabit: () => void;
}

export default function HabitDropdown({
  removeHabit,
  editHabit,
}: HabitDropdownProps) {
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
