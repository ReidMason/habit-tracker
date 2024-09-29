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
import { createHabit, NewHabit, type Habit } from "@/lib/api";
import LoadingSpinner from "./LoadingSpinner";

interface AddHabitDialogProps {
  userId: number;
  newHabitAdded: (habitId: Habit) => Promise<void>;
}

export default function AddHabitDialog({
  userId,
  newHabitAdded,
}: AddHabitDialogProps) {
  const [newHabit, setNewHabit] = React.useState({
    name: "",
    colour: "#000000",
  } as NewHabit);
  const [state, setState] = React.useState<"loading" | "idle">("idle");
  const [open, setOpen] = React.useState(false);

  const setHabitName = (name: string) => {
    setNewHabit((prev) => ({ ...prev, name }));
  };

  const setHabitColour = (colour: string) => {
    setNewHabit((prev) => ({ ...prev, colour }));
  };

  const habitValid = (): boolean => {
    return newHabit.name.trim().length > 0 && newHabit.colour.trim().length > 0;
  };

  const addHabit = async () => {
    if (!habitValid()) return;

    setState("loading");

    const createdHabit = await createHabit(userId, newHabit);
    await newHabitAdded(createdHabit);
    setNewHabit({ name: "", colour: "" });

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
              Name
            </Label>
            <Input
              id="habit-name"
              className="col-span-3"
              disabled={state === "loading"}
              placeholder="Add a habit"
              value={newHabit.name}
              onChange={(e) => setHabitName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="habit-colour" className="text-right">
              Colour
            </Label>
            <Input
              id="habit-colour"
              className="col-span-3"
              disabled={state === "loading"}
              placeholder="Set habit colour"
              type="color"
              value={newHabit.colour}
              onChange={(e) => setHabitColour(e.target.value)}
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
