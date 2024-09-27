"use client";

import Tracker from "@/components/Tracker";
import { Button } from "@/components/ui/button";
import { deleteHabit, getHabits, type Habit } from "@/lib/api";
import { useEffect, useState } from "react";

const userId = 1;

type State = "loading" | "idle";

export default function Home() {
  const [state, setState] = useState<State>("idle");
  const [habits, setHabits] = useState<Habit[]>([]);

  const fetchHabits = async () => {
    setState("loading");
    const response = await getHabits(userId);
    setHabits(response);
    setState("idle");
  };

  const removeHabit = async (habitId: number) => {
    setState("loading");
    await deleteHabit(habitId);
    fetchHabits();
    setState("idle");
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  return (
    <div>
      <main className="flex justify-center mt-8">
        <div className="inline-flex flex-col border p-4 rounded-xl">
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
