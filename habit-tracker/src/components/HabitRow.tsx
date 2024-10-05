import {
  createHabitEntry,
  deleteHabitEntry,
  updateHabit,
  type Habit,
} from "@/lib/api";
import React from "react";
import HabitDropdown from "./HabitDropdown";
import HabitDialog from "./HabitDialog";

interface HabitRowProps {
  habit: Habit;
  selectedDate: Date;
  refreshHabits: (habitId: number) => Promise<void>;
}

const dateMatch = (date: Date, date2: Date): boolean => {
  return date.toDateString() === date2.toDateString();
};

const fullCombo = 10;

export default function HabitRow({
  habit,
  selectedDate,
  refreshHabits,
}: HabitRowProps) {
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);

  const currentDate = new Date();

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
    createHabitEntry(habit.id, date);
    refreshHabits(habit.id);
  };

  const removeEntry = async (entryId: number) => {
    deleteHabitEntry(entryId);
    refreshHabits(habit.id);
  };

  const editHabit = async (newHabit: Habit) => {
    await updateHabit(newHabit);
    await refreshHabits(habit.id);
  };

  return (
    <tr>
      <td className="min-w-32 flex items-center">
        <HabitDialog
          title="Edit Habit"
          description="Edit the habit details"
          confirmText="Save"
          habit={habit}
          submit={editHabit}
          open={editDialogOpen}
          setOpen={setEditDialogOpen}
        />
        <HabitDropdown
          habit={habit}
          refreshHabits={refreshHabits}
          editHabit={() => setEditDialogOpen(true)}
        />
        {habit.name}
      </td>
      {getDaysInMonth().map((date) => {
        const entry = getMatchingEntry(date);

        if (entry !== undefined) {
          return (
            <td
              key={date.toJSON()}
              className="h-12"
              style={{
                backgroundColor: habit.colour,
                opacity: Math.min(entry.combo, fullCombo) / fullCombo + 0.3,
              }}
            >
              <button
                onClick={() => removeEntry(entry.id)}
                className="w-full h-full"
              ></button>
            </td>
          );
        } else if (dateMatch(date, currentDate)) {
          return (
            <td key={date.toJSON()} className="bg-secondary h-12">
              <button
                onClick={() => addEntry(date)}
                className="w-full h-full"
              ></button>
            </td>
          );
        } else if (date.getTime() > currentDate.getTime() + 1) {
          return (
            <td key={date.toJSON()} className="h-12">
              <button></button>
            </td>
          );
        } else {
          return (
            <td key={date.toJSON()} className="border h-12">
              <button
                onClick={() => addEntry(date)}
                className="w-full h-full"
              ></button>
            </td>
          );
        }
      })}
    </tr>
  );
}
