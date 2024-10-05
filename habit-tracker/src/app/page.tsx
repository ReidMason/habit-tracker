"use client";

import { ModeToggle } from "@/components/ModeToggle";
import Tracker from "@/components/Tracker";
import { getHabits, type Habit } from "@/lib/api";
import { useEffect, useState } from "react";

const userId = 1;

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);

  const fetchHabits = async () => {
    const response = await getHabits(userId);
    setHabits(response);
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  return (
    <div>
      <div className="flex justify-end p-4">
        <ModeToggle />
      </div>
      <main className="flex justify-center mt-8">
        <div className="w-full inline-flex flex-col border p-4 rounded-xl">
          <Tracker
            habits={habits}
            userId={userId}
            refreshHabits={fetchHabits}
          />
        </div>
      </main>
    </div>
  );
}
