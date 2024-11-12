import { deleteHabitEntry, type Habit, type HabitEntry } from "@/lib/api";
import React from "react";
import { cn, hexToRgb } from "@/lib/utils";
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
  ring?: boolean;
  className?: string;
}

export default function HabitCell({
  habit,
  entry,
  date,
  createHabitEntry,
  fetchHabits,
  as,
  displayCurrentDayIndicator,
  ring,
  className,
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

  const afterToday = date.getTime() > currentDate.getTime();

  return (
    <Component className={cn("p-0", className)}>
      <TableCell
        habit={habit}
        ring={ring || !hasEntry}
        entry={entry}
        cellClassName={hasEntry ? "scale-100" : undefined}
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
  habit: Habit;
  entry?: HabitEntry;
  cellClassName?: string;
  children?: React.ReactNode;
  ring?: boolean;
  isToday: boolean;
  displayCurrentDayIndicator?: boolean;
}

function TableCell({
  habit,
  entry,
  cellClassName,
  children,
  ring,
  isToday,
  displayCurrentDayIndicator,
}: TableCellProps) {
  const comboBaseline = 3;
  const comboOpacityMinimum = comboBaseline / 10;
  const comboOpacity = entry
    ? Math.min(
        Math.min(entry.combo, fullCombo) / fullCombo + comboOpacityMinimum,
        0.9
      )
    : 0;
  const tableCellStyle = entry
    ? {
        backgroundColor: habit.colour,
        opacity: comboOpacity,
      }
    : undefined;

  const habitColourRgb = hexToRgb(habit.colour);

  const ringStyle = {
    opacity: comboOpacity,
    "--tw-ring-color":
      habitColourRgb &&
      `rgba(${habitColourRgb.r}, ${habitColourRgb.g}, ${habitColourRgb.b}, ${comboOpacity})`,
  } as React.CSSProperties;

  const atFullCombo = entry && entry.combo >= fullCombo - comboBaseline;

  return (
    <div className="relative aspect-square transition-all overflow-hidden">
      <div
        className={cn(
          "absolute flex inset-0 items-center justify-center -z-10 overflow-hidden",
          isToday ? "bg-secondary" : ""
        )}
      >
        {displayCurrentDayIndicator && isToday && (
          <p
            className={cn(
              "absolute top-1 right-2 text-sm z-20 text-neutral-600",
              isToday ? "rounded-full font-bold" : ""
            )}
          ></p>
        )}
        <div
          className={cn(
            "absolute scale-0 transition-all w-20 h-20 rounded-full duration-500",
            cellClassName
          )}
          style={{
            ...tableCellStyle,
            width: `calc(100%*2)`,
            height: `calc(100%*2)`,
          }}
        />
      </div>
      <div
        className={cn(
          "absolute inset-0 ring-inset ring-accent -z-10 transition-all",
          (ring && atFullCombo) || !entry ? "ring-1" : ""
        )}
        style={atFullCombo ? ringStyle : {}}
      ></div>
      {children}
    </div>
  );
}
