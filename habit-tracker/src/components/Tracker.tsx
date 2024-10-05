import React, { useState } from "react";
import HabitRow from "./HabitRow";
import { Button } from "./ui/button";
import HabitDialog from "./HabitDialog";
import { createHabit, Habit } from "@/lib/api";
import { PlusIcon } from "@radix-ui/react-icons";

interface TrackerProps {
  userId: number;
  habits: Habit[];
  refreshHabits: (habitId: number) => Promise<void>;
}

const dateMatch = (date: Date, date2: Date) => {
  return date.toDateString() === date2.toDateString();
};

export default function Tracker({
  habits,
  userId,
  refreshHabits,
}: TrackerProps) {
  const [pivotDate, setPivotDate] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const getMonthName = () => {
    const date = new Date();
    return date.toLocaleString("default", { month: "long" });
  };

  const daysInMonth = getDaysInMonth(
    pivotDate.getFullYear(),
    pivotDate.getMonth(),
  );

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
    };

    return date.toLocaleDateString("en-gb", options);
  };

  return (
    <>
      <div className="flex gap-2 items-center mb-4">
        <Button
          onClick={() => {
            const newDate = new Date(pivotDate);
            newDate.setMonth(newDate.getMonth() - 1);
            setPivotDate(newDate);
          }}
        >
          Prev
        </Button>
        <p className="w-36 text-center">{formatDate(pivotDate)}</p>
        <Button
          onClick={() => {
            const newDate = new Date(pivotDate);
            newDate.setMonth(newDate.getMonth() + 1);
            setPivotDate(newDate);
          }}
        >
          Next
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th className="ml-32 text-xl font-semibold mb-2">
                {getMonthName()}
              </th>
              {daysInMonth.map((date) => (
                <th
                  key={date.toJSON()}
                  className={`${dateMatch(date, new Date()) ? "bg-ring/20" : ""} min-h-12 min-w-12 border bg-secondary text-secondary-foreground`}
                >
                  {date.getDate()}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {habits.map((habit) => (
              <HabitRow
                habit={habit}
                key={habit.id}
                selectedDate={pivotDate}
                refreshHabits={refreshHabits}
              />
            ))}
            <tr>
              <td>
                <HabitDialog
                  title="Add habit"
                  description="Add a new habit to track"
                  confirmText="Add habit"
                  habit={{
                    id: 0,
                    name: "",
                    colour: "#000000",
                    entries: [],
                  }}
                  submit={async (newHabit: Habit) => {
                    await createHabit(userId, newHabit);
                    await refreshHabits(newHabit.id);
                  }}
                >
                  <Button variant="outline" className="flex gap-1">
                    <PlusIcon />
                    Add habit
                  </Button>
                </HabitDialog>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
