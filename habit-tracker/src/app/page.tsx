"use client";

import Tracker from "@/components/tracker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createHabit, deleteHabit, getHabits, type Habit } from "@/lib/api";
import { FormEvent, useEffect, useState } from "react";

const userId = 1;

type State = "loading" | "idle";

export default function Home() {
  const [state, setState] = useState<State>("idle");
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState<string>("");

  const fetchHabits = async () => {
    setState("loading");
    const response = await getHabits(userId);
    setHabits(response);
    setState("idle");
  };

  const addHabit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newHabit || !newHabit.trim()) return;

    setState("loading");
    const response = await createHabit(userId, newHabit);
    setNewHabit("");
    console.log(response);

    fetchHabits();
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
      <main className="p-28">
        <div className="p-4 border rounded-xl">
          <h2 className="font-semibold text-xl">Habits</h2>
          <ul className="max-w-sm flex flex-col gap-2">
            {habits.map((habit) => (
              <li key={habit.id} className="flex justify-between items-center">
                <p>{habit.name}</p>
                <Button
                  variant="destructive"
                  disabled={state === "loading"}
                  onClick={() => removeHabit(habit.id)}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>

          <form className="mt-4 flex flex-col gap-2" onSubmit={addHabit}>
            <Input
              placeholder="Add a habit"
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
            />
            <div>
              <Button disabled={state === "loading"}>Add habit</Button>
            </div>
          </form>
        </div>

        <div className="border p-4 rounded-xl">
          <Tracker habitIds={habits.map((x) => x.id)} />
        </div>
      </main>
    </div>
  );
}
