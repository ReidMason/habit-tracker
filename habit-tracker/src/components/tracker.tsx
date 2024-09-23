import { type DetailedHabit, getHabit } from "@/lib/api";
import React, { useEffect, useState } from "react";

export default function tracker({ habitId }: { habitId: number }) {
  const [habit, setHabit] = useState<DetailedHabit>();

  const fetchHabit = async () => {
    const response = await getHabit(habitId);
    setHabit(response);
    console.log(response);
  };

  useEffect(() => {
    fetchHabit();
  }, []);

  return (
    <>
      {habit !== undefined && (
        <div>
          <p>Habit: {habit.name}</p>

          {habit.entries.map((entry) => (
            <div key={entry.id}>
              <p>Date: {entry.date.toJSON()}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
