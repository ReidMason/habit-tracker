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
  displayCurrentDayIndicator?: boolean;
}

export default function HabitCell({
  habit,
  entry,
  date,
  createHabitEntry,
  fetchHabits,
  as,
  displayCurrentDayIndicator,
}: HabitCellProps) {
  const Component = as || "div";

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

  const currentDate = new Date();
  const isToday = datesMatch(date, currentDate);
  const hasEntry = entry !== undefined;

  const tableCellStyle = hasEntry
    ? {
        backgroundColor: habit.colour,
        opacity: Math.min(entry.combo, fullCombo) / fullCombo + 0.3,
      }
    : undefined;
  const afterToday = date.getTime() > currentDate.getTime();

  return (
    <Component className="p-0">
      <TableCell
        ring={!hasEntry}
        cellClassName={hasEntry ? "scale-100" : undefined}
        style={tableCellStyle}
        isToday={isToday}
        displayCurrentDayIndicator={displayCurrentDayIndicator}
      >
        {!afterToday && (
          <button
            onClick={() => (hasEntry ? removeEntry(entry.id) : addEntry(date))}
            className="w-full h-full"
          ></button>
        )}
      </TableCell>
    </Component>
  );
}

interface TableCellProps {
  cellClassName?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  ring?: boolean;
  isToday: boolean;
  displayCurrentDayIndicator?: boolean;
}

function TableCell({
  cellClassName,
  children,
  style,
  ring,
  isToday,
  displayCurrentDayIndicator,
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
        {displayCurrentDayIndicator && isToday ? (
          <span className="absolute top-1 right-1 rounded-full w-2 h-2 bg-red-400/80"></span>
        ) : null}
      </div>
      <div
        className={cn(
          "absolute inset-0 ring-1 ring-inset ring-accent -z-10 transition-all",
          ring ? "" : "ring-0"
        )}
      ></div>
      {children}
    </div>
  );
}
