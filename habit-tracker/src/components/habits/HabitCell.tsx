import { deleteHabitEntry, type Habit, type HabitEntry } from "@/lib/api";
import React from "react";
import { cn } from "@/lib/utils";
import type { FetchHabits } from "@/components/types";
import { datesMatch } from "@/lib/dates";

const fullCombo = 10;

interface HabitCellProps {
  habit: Habit;
  entry: HabitEntry | undefined;
  date: Date;
  createHabitEntry: (habitId: number, date: Date) => Promise<void>;
  fetchHabits: FetchHabits;
}

export default function HabitCell({
  habit,
  entry,
  date,
  createHabitEntry,
  fetchHabits,
}: HabitCellProps) {
  const currentDate = new Date();

  const addEntry = async (date: Date) => {
    date = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
    );
    await createHabitEntry(habit.id, date);
    await fetchHabits();
  };

  const removeEntry = async (entryId: number) => {
    await deleteHabitEntry(entryId);
    await fetchHabits();
  };

  if (entry !== undefined) {
    return (
      <TableCell
        noRing
        key={date.toJSON()}
        className=""
        cellClassName="scale-100"
        style={{
          backgroundColor: habit.colour,
          opacity: Math.min(entry.combo, fullCombo) / fullCombo + 0.3,
        }}
      >
        <button
          onClick={() => removeEntry(entry.id)}
          className="w-full h-full"
        ></button>
      </TableCell>
    );
  } else if (datesMatch(date, currentDate)) {
    return (
      <TableCell key={date.toJSON()} className="bg-secondary/80">
        <button
          onClick={() => addEntry(date)}
          className="w-full h-full"
        ></button>
      </TableCell>
    );
  } else if (date.getTime() > currentDate.getTime() + 1) {
    return <TableCell key={date.toJSON()} />;
  } else {
    return (
      <TableCell key={date.toJSON()}>
        <button
          onClick={() => addEntry(date)}
          className="w-full h-full"
        ></button>
      </TableCell>
    );
  }
}

interface TableCellProps {
  className?: string;
  cellClassName?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  noRing?: boolean;
}

function TableCell({
  className,
  cellClassName,
  children,
  style,
  noRing,
}: TableCellProps) {
  return (
    <td className={cn("relative h-12 w-12 transition-all", className)}>
      <div className="absolute flex inset-0 items-center justify-center -z-10 overflow-hidden">
        <div
          className={cn(
            "absolute scale-0 transition-all w-20 h-20 rounded-full duration-500",
            cellClassName
          )}
          style={style}
        />
      </div>
      <div
        className={cn(
          "absolute inset-0 ring-1 ring-inset ring-accent -z-10 transition-all",
          noRing ? "ring-0" : ""
        )}
      ></div>
      {children}
    </td>
  );
}
