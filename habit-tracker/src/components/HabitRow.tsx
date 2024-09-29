import { createHabitEntry, deleteHabitEntry, type Habit } from "@/lib/api";
import React from "react";
import HabitDropdown from "./HabitDropdown";

interface HabitRowProps {
  habit: Habit;
  selectedDate: Date;
  refreshHabits: (habitId: number) => void;
}

const dateMatch = (date: Date, date2: Date): boolean => {
  return date.toDateString() === date2.toDateString();
};

export default function HabitRow({
  habit,
  selectedDate,
  refreshHabits,
}: HabitRowProps) {
  const currentDate = new Date();

  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const getMatchingEntry = (date: Date) => {
    return habit?.entries.find((entry) => {
      return new Date(entry.date).toDateString() === date.toDateString();
    });
  };

  const addEntry = async (date: Date) => {
    date = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0),
    );
    createHabitEntry(habit.id, date);
    refreshHabits(habit.id);
  };

  const removeEntry = async (entryId: number) => {
    deleteHabitEntry(entryId);
    refreshHabits(habit.id);
  };

  return (
    <tr>
      <td className="min-w-32 flex items-center">
        <HabitDropdown habitId={habit.id} refreshHabits={refreshHabits} />
        {habit.name}
      </td>
      {getDaysInMonth().map((date) => {
        const entry = getMatchingEntry(date);

        if (entry !== undefined) {
          return (
            <td
              key={date.toJSON()}
              className="h-12"
              style={{ backgroundColor: habit.colour }}
            >
              <button
                onClick={() => removeEntry(entry.id)}
                className="w-full h-full"
              ></button>
            </td>
          );
        } else if (dateMatch(date, currentDate)) {
          return (
            <td key={date.toJSON()} className="bg-gray-200 h-12">
              <button
                onClick={() => addEntry(date)}
                className="w-full h-full"
              ></button>
            </td>
          );
        } else if (date.getTime() > currentDate.getTime() + 1) {
          return (
            <td key={date.toJSON()} className="opacity-30 bg-gray-200 h-12">
              <button></button>
            </td>
          );
        } else {
          return (
            <td key={date.toJSON()} className="bg-gray-100 h-12">
              <button
                onClick={() => addEntry(date)}
                className="w-full h-full"
              ></button>
            </td>
          );
        }
      })}
    </tr>
  );
}
