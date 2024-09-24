import {
  createHabitEntry,
  deleteHabitEntry,
  type DetailedHabit,
  getHabit,
} from "@/lib/api";
import React, { useEffect, useState } from "react";

interface HabitRowProps {
  habitId: number;
  selectedDate: Date;
}

const dateMatch = (date: Date, date2: Date): boolean => {
  return date.toDateString() === date2.toDateString();
};

export default function habitRow({ habitId, selectedDate }: HabitRowProps) {
  const [habit, setHabit] = useState<DetailedHabit>();
  const currentDate = new Date();

  const fetchHabit = async () => {
    const response = await getHabit(habitId);
    setHabit(response);
  };

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
    createHabitEntry(habitId, date);
    fetchHabit();
  };

  const removeEntry = async (entryId: number) => {
    deleteHabitEntry(entryId);
    fetchHabit();
  };

  useEffect(() => {
    fetchHabit();
  }, []);

  const successColours = [
    "bg-green-500",
    "bg-orange-400",
    "bg-purple-300",
    "bg-blue-200",
  ];

  const successColour = successColours[habitId % successColours.length];

  return (
    <tr>
      {habit ? (
        <>
          <td className="min-w-32">{habit.name}</td>
          {getDaysInMonth().map((date) => {
            const entry = getMatchingEntry(date);

            if (entry !== undefined) {
              return (
                <td key={date.toJSON()} className={`${successColour} h-12`}>
                  <button
                    onClick={() => removeEntry(entry.id)}
                    className="w-full h-full"
                  ></button>
                </td>
              );
            } else if (dateMatch(date, currentDate)) {
              return (
                <td key={date.toJSON()} className="bg-gray-300 h-12">
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
        </>
      ) : (
        <td className="min-w-32">Loading...</td>
      )}
    </tr>
  );
}
