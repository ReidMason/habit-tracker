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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Habit } from "@/lib/api";
import LoadingSpinner from "@/components/loadingSpinner/LoadingSpinner";

interface HabitDialogProps {
  habit: Habit;
  submit: (habit: Habit) => Promise<void>;
  title: string;
  description: string;
  confirmText: string;
  children?: React.ReactNode;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

export default function HabitDialog({
  habit,
  submit,
  children,
  title,
  description,
  confirmText,
  open,
  setOpen,
}: HabitDialogProps) {
  const [newHabit, setNewHabit] = React.useState(structuredClone(habit));
  const [state, setState] = React.useState<"loading" | "idle">("idle");
  const [stateOpen, setStateOpen] = React.useState(open ?? false);

  const updateOpen = setOpen === undefined ? setStateOpen : setOpen;
  const isOpen = setOpen === undefined ? stateOpen : open;

  const setHabitName = (name: string) => {
    setNewHabit((prev) => ({ ...prev, name }));
  };

  const setHabitColour = (colour: string) => {
    setNewHabit((prev) => ({ ...prev, colour }));
  };

  const habitValid = (): boolean => {
    return newHabit.name.trim().length > 0 && newHabit.colour.trim().length > 0;
  };

  const confirm = async () => {
    if (!habitValid()) return;

    setState("loading");

    await submit(newHabit);

    setState("idle");
    updateOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(newValue) => updateOpen(newValue)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
            onClick={confirm}
            disabled={state === "loading"}
          >
            {state === "loading" && <LoadingSpinner />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
