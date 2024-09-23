import {
  createHabitEntry,
  deleteHabitEntry,
  type DetailedHabit,
  getHabit,
} from "@/lib/api";
import React, { useEffect, useState } from "react";

export default function tracker({ habitId }: { habitId: number }) {
  const [habit, setHabit] = useState<DetailedHabit>();

  const fetchHabit = async () => {
    const response = await getHabit(habitId);
    setHabit(response);
    console.log(response);
  };

  const getWeekDates = () => {
    const weekDates = [];
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const diff = currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(currentDate.setDate(diff));
    for (let i = 0; i < 7; i++) {
      weekDates.push(new Date(monday));
      monday.setDate(monday.getDate() + 1);
    }
    return weekDates;
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString("en-gb", { weekday: "short" });
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

  return (
    <>
      {habit !== undefined && (
        <div>
          <p>Habit: {habit.name}</p>

          <div className="grid grid-cols-7">
            {getWeekDates().map((date) => (
              <div key={date.toJSON()}>
                <p>{getDayName(date)}</p>
              </div>
            ))}

            {getWeekDates().map((date) => {
              const entry = getMatchingEntry(date);

              if (entry === undefined) {
                return (
                  <div key={date.toJSON()}>
                    <button onClick={() => addEntry(date)}>❌</button>
                  </div>
                );
              } else {
                return (
                  <div key={date.toJSON()}>
                    <button onClick={() => removeEntry(entry.id)}>✅</button>
                  </div>
                );
              }
            })}
          </div>
        </div>
      )}
    </>
  );
}
