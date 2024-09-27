import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { deleteHabit } from "@/lib/api";

interface HabitDropdownProps {
  habitId: number;
  refreshHabits: (habitId: number) => void;
}

export default function HabitDropdown({
  habitId,
  refreshHabits,
}: HabitDropdownProps) {
  const removeHabit = async () => {
    await deleteHabit(habitId);
    refreshHabits(habitId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="px-1">
          <DotsVerticalIcon className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem onClick={removeHabit}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
