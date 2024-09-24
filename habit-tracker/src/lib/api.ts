"use server";

const baseUrl = "http://localhost:8000/api";

export type Habit = {
  id: number;
  name: string;
};

export async function getHabits(userId: number): Promise<Habit[]> {
  const result = await fetch(`${baseUrl}/user/${userId}/habit`);
  const data = await result.json();

  return data;
}

export async function createHabit(
  userId: number,
  name: string,
): Promise<Habit> {
  try {
    const result = await fetch(`${baseUrl}/user/${userId}/habit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });
    const data = await result.json();

    return data;
  } catch (error) {
    return { id: -1, name: "" };
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

export type DetailedHabit = {
  id: number;
  name: string;
  entries: HabitEntry[];
};

export type HabitEntry = {
  id: number;
  date: Date;
};

export async function getHabit(habitId: number): Promise<DetailedHabit> {
  const result = await fetch(`${baseUrl}/habit/${habitId}`);
  const data = await result.json();

  data.entries = data.entries.map((entry: any) => {
    return {
      id: entry.id,
      date: new Date(entry.date),
    };
  });

  return data;
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
