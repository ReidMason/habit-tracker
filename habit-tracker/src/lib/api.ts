import { z } from "zod";

const baseUrl = import.meta.env.PUBLIC_API_URL;

const habitEntrySchema = z.object({
  id: z.number(),
  date: z.coerce.date(),
  combo: z.number(),
});

const habitSchema = z.object({
  id: z.number(),
  name: z.string(),
  colour: z.string(),
  index: z.number(),
  entries: z.array(habitEntrySchema),
  active: z.boolean(),
});

export type Habit = z.infer<typeof habitSchema>;
export type HabitEntry = z.infer<typeof habitEntrySchema>;

export async function getHabits(userId: number): Promise<Habit[]> {
  const result = await fetch(`${baseUrl}/users/${userId}/habits`);
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
  newHabit: NewHabit
): Promise<Habit> {
  try {
    const result = await fetch(`${baseUrl}/users/${userId}/habits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newHabit),
    });
    const data = await result.json();

    return data;
  } catch (error) {
    return {
      id: -1,
      name: "",
      entries: [],
      colour: "",
      index: 0,
      active: false,
    };
  }
}

export async function deleteHabit(habitId: number) {
  try {
    await fetch(`${baseUrl}/habits/${habitId}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error(error);
  }
}

export async function updateHabit(habit: Habit) {
  await fetch(`${baseUrl}/habits/${habit.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(habit),
  });
}

export async function createHabitEntry(habitId: number, date: Date) {
  try {
    await fetch(`${baseUrl}/habitEntries`, {
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
    await fetch(`${baseUrl}/habitEntries/${entryId}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error(error);
  }
}

export async function updateHabits(userId: number, habits: Habit[]) {
  try {
    await fetch(`${baseUrl}/users/${userId}/habits`, {
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
