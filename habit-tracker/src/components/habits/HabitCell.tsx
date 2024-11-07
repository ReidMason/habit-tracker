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
  as?: React.ElementType;
}

export default function HabitCell({
  habit,
  entry,
  date,
  createHabitEntry,
  fetchHabits,
  as,
}: HabitCellProps) {
  const Component = as || "div";
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

  const isToday = datesMatch(date, currentDate);

  const getTableCell = () => {
    if (entry !== undefined) {
      return (
        <TableCell
          noRing
          key={date.toJSON()}
          cellClassName="scale-100"
          style={{
            backgroundColor: habit.colour,
            opacity: Math.min(entry.combo, fullCombo) / fullCombo + 0.3,
          }}
          isToday={isToday}
        >
          <button
            onClick={() => removeEntry(entry.id)}
            className="w-full h-full"
          ></button>
        </TableCell>
      );
    } else if (isToday) {
      return (
        <TableCell key={date.toJSON()} isToday={isToday}>
          <button
            onClick={() => addEntry(date)}
            className="w-full h-full"
          ></button>
        </TableCell>
      );
    } else if (date.getTime() > currentDate.getTime() + 1) {
      return <TableCell key={date.toJSON()} isToday={isToday} />;
    } else {
      return (
        <TableCell key={date.toJSON()} isToday={isToday}>
          <button
            onClick={() => addEntry(date)}
            className="w-full h-full"
          ></button>
        </TableCell>
      );
    }
  };

  return <Component className="p-0">{getTableCell()}</Component>;
}

interface TableCellProps {
  cellClassName?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  noRing?: boolean;
  isToday: boolean;
}

function TableCell({
  cellClassName,
  children,
  style,
  noRing,
  isToday,
}: TableCellProps) {
  return (
    <div className="relative aspect-square transition-all overflow-hidden">
      <div
        className={cn(
          "absolute flex inset-0 items-center justify-center -z-10 overflow-hidden",
          isToday ? "bg-secondary/80" : ""
        )}
      >
        <div
          className={cn(
            "absolute scale-0 transition-all w-20 h-20 rounded-full duration-500",
            cellClassName
          )}
          style={{ ...style, width: `calc(100%*2)`, height: `calc(100%*2)` }}
        />
      </div>
      <div
        className={cn(
          "absolute inset-0 ring-1 ring-inset ring-accent -z-10 transition-all",
          noRing ? "ring-0" : ""
        )}
      ></div>
      {children}
    </div>
  );
}
