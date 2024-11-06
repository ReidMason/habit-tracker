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
import { type Habit } from "@/lib/api";
import LoadingSpinner from "@/components/habitLayouts/LoadingSpinner";

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
  const [state, setState] = React.useState<"loading" | "idle">("idle");
  const [stateOpen, setStateOpen] = React.useState(open ?? false);

  const updateOpen = setOpen === undefined ? setStateOpen : setOpen;
  const isOpen = setOpen === undefined ? stateOpen : open;

  const confirm = async () => {
    setState("loading");

    await submit(habit);

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
        <DialogFooter className="flex gap-4 justify-between">
          <Button
            onClick={() => updateOpen(false)}
            disabled={state === "loading"}
            variant="secondary"
          >
            {state === "loading" && <LoadingSpinner />}
            Cancel
          </Button>
          <Button
            type="submit"
            variant="destructive"
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
