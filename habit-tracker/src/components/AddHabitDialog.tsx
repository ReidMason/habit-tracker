import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createHabit, type Habit } from "@/lib/api";
import LoadingSpinner from "./LoadingSpinner";

interface AddHabitDialogProps {
  userId: number;
  newHabitAdded: (habitId: Habit) => Promise<void>;
}

export default function AddHabitDialog({
  userId,
  newHabitAdded,
}: AddHabitDialogProps) {
  const [habitName, setHabitName] = React.useState("");
  const [state, setState] = React.useState<"loading" | "idle">("idle");
  const [open, setOpen] = React.useState(false);

  const addHabit = async () => {
    if (!habitName || !habitName.trim()) return;

    setState("loading");

    const newHabit = await createHabit(userId, habitName);
    await newHabitAdded(newHabit);
    setHabitName("");

    setState("idle");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(newValue) => setOpen(newValue)}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex gap-1">
          <PlusIcon />
          Add habit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add habit</DialogTitle>
          <DialogDescription>Add a new habit to track</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="habit-name" className="text-right">
              Habit name
            </Label>
            <Input
              id="habit-name"
              className="col-span-3"
              disabled={state === "loading"}
              placeholder="Add a habit"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={addHabit}
            disabled={state === "loading"}
          >
            {state === "loading" && <LoadingSpinner />}
            Add habit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
