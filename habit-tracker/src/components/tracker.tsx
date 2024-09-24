import React from "react";
import HabitRow from "./habitRow";

interface TrackerProps {
  habitIds: number[];
}

const dateMatch = (date: Date, date2: Date) => {
  return date.toDateString() === date2.toDateString();
};

export default function tracker({ habitIds }: TrackerProps) {
  const currentDate = new Date();

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

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

  return (
    <>
      <table>
        <thead>
          <tr>
            <th className="ml-32 text-xl font-semibold mb-2">
              {getMonthName()}
            </th>
            {getDaysInMonth().map((date) => (
              <th
                key={date.toJSON()}
                className={`${dateMatch(date, new Date()) ? "bg-secondary ring" : ""} h-12 w-12 border`}
              >
                {date.getDate()}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {habitIds.map((habitId) => (
            <HabitRow habitId={habitId} key={habitId} />
          ))}
        </tbody>
      </table>
    </>
  );
}
