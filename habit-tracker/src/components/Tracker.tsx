import React, { useState } from "react";
import HabitRow from "./HabitRow";
import { Button } from "./ui/button";
import AddHabitDialog from "./AddHabitDialog";
import { Habit } from "@/lib/api";

interface TrackerProps {
  userId: number;
  habits: Habit[];
  refreshHabits: (habitId: number) => void;
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
                  className={`${dateMatch(date, new Date()) ? "bg-secondary ring" : ""} min-h-12 min-w-12 border`}
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
                <AddHabitDialog
                  newHabitAdded={async (newHabit: Habit) => {
                    refreshHabits(newHabit.id);
                  }}
                  userId={userId}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
