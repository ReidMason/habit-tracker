"use server";

import { z } from "zod";

const baseUrl = process.env.API_URL;

const habitSchema = z.object({
  id: z.number(),
  name: z.string(),
  colour: z.string(),
  index: z.number(),
  entries: z.array(
    z.object({
      id: z.number(),
      date: z.string(),
      combo: z.number(),
    }),
  ),
});

export type Habit = z.infer<typeof habitSchema>;

export async function getHabits(userId: number): Promise<Habit[]> {
  const result = await fetch(`${baseUrl}/user/${userId}/habit`);
  const response = await result.json();
  const data = z.array(habitSchema).parse(response);

  return data;
}

export interface NewHabit {
  name: string;
  colour: string;
}

export async function createHabit(
  userId: number,
  newHabit: NewHabit,
): Promise<Habit> {
  try {
    const result = await fetch(`${baseUrl}/user/${userId}/habit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newHabit),
    });
    const data = await result.json();

    return data;
  } catch (error) {
    console.error(error);
    return { id: -1, name: "", entries: [], colour: "", index: 0 };
  }
}

export async function deleteHabit(habitId: number) {
  try {
    await fetch(`${baseUrl}/habit/${habitId}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error(error);
  }
}

export async function getHabit(habitId: number): Promise<Habit> {
  const result = await fetch(`${baseUrl}/habit/${habitId}`);
  const response = await result.json();

  const data = habitSchema.parse(response);

  return data;
}

export async function updateHabit(habit: Habit) {
  fetch(`${baseUrl}/habit/${habit.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(habit),
  });
}

export async function createHabitEntry(habitId: number, date: Date) {
  try {
    await fetch(`${baseUrl}/habitEntry`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ habitId, date }),
    });
  } catch (error) {
    console.error(error);
  }
}

export async function deleteHabitEntry(entryId: number) {
  try {
    await fetch(`${baseUrl}/habitEntry/${entryId}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error(error);
  }
}

export async function updateHabits(userId: number, habits: Habit[]) {
  try {
    await fetch(`${baseUrl}/user/${userId}/habit`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(habits),
    });
  } catch (error) {
    console.error(error);
  }
}
