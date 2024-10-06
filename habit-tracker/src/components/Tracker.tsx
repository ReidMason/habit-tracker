import React, { useState } from "react";
import HabitRow from "./HabitRow";
import { Button } from "./ui/button";
import HabitDialog from "./HabitDialog";
import { createHabit, Habit } from "@/lib/api";
import { PlusIcon } from "@radix-ui/react-icons";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./sortable/SortableItem";

interface TrackerProps {
  userId: number;
  habits: Habit[];
  updateHabits: (userId: number, habits: Habit[]) => Promise<void>;
  refreshHabits: (habitId: number) => Promise<void>;
}

const dateMatch = (date: Date, date2: Date) => {
  return date.toDateString() === date2.toDateString();
};

export default function Tracker({
  habits,
  updateHabits,
  userId,
  refreshHabits,
}: TrackerProps) {
  const [activeHabit, setActiveHabit] = useState<Habit | null>(null);
  const [pivotDate, setPivotDate] = useState(new Date());
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor),
  );

  const getDaysInMonth = (year: number, month: number) => {
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

  const daysInMonth = getDaysInMonth(
    pivotDate.getFullYear(),
    pivotDate.getMonth(),
  );

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
    };

    return date.toLocaleDateString("en-gb", options);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveHabit(null);
    if (!over?.id || active.id === over.id) {
      return;
    }

    if (active.id !== over.id) {
      swapHabits(active.id.toString(), over.id.toString());
    }
  };

  const swapHabits = async (habitId1: string, habitId2: string) => {
    const oldIndex = habits.findIndex((x) => x.id.toString() === habitId1);
    const newIndex = habits.findIndex((x) => x.id.toString() === habitId2);

    const newHabits = arrayMove(habits, oldIndex, newIndex);
    const newIndexedHabits = newHabits.map((habit, index) => ({
      ...habit,
      index: index + 1,
    }));

    await updateHabits(userId, newIndexedHabits);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;

    const habit = habits.find((x) => x.id.toString() === active.id);
    if (!habit) return;
    setActiveHabit(habit);
  };

  return (
    <>
      <div className="flex gap-2 items-center mb-4">
        <Button
          onClick={() => {
            const newDate = new Date(pivotDate);
            newDate.setMonth(newDate.getMonth() - 1);
            setPivotDate(newDate);
          }}
        >
          Prev
        </Button>
        <p className="w-36 text-center">{formatDate(pivotDate)}</p>
        <Button
          onClick={() => {
            const newDate = new Date(pivotDate);
            newDate.setMonth(newDate.getMonth() + 1);
            setPivotDate(newDate);
          }}
        >
          Next
        </Button>
      </div>

      <div className="overflow-x-auto">
        <DndContext
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
        >
          <table>
            <thead>
              <tr>
                <th className="ml-32 text-xl font-semibold mb-2">
                  {getMonthName()}
                </th>
                {daysInMonth.map((date) => (
                  <th
                    key={date.toJSON()}
                    className={`${dateMatch(date, new Date()) ? "bg-ring/20" : ""} min-h-12 min-w-12 border bg-secondary text-secondary-foreground`}
                  >
                    {date.getDate()}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              <SortableContext
                items={habits.map((habit) => habit.id.toString())}
                strategy={verticalListSortingStrategy}
              >
                {habits.map((habit) => (
                  <SortableItem
                    className={activeHabit?.id === habit.id ? "opacity-0" : ""}
                    id={habit.id.toString()}
                    key={habit.id.toString()}
                    habit={habit}
                    selectedDate={pivotDate}
                    refreshHabits={refreshHabits}
                  />
                ))}
              </SortableContext>
              <tr>
                <td>
                  <HabitDialog
                    title="Add habit"
                    description="Add a new habit to track"
                    confirmText="Add habit"
                    habit={{
                      id: 0,
                      name: "",
                      colour: "#000000",
                      entries: [],
                      index: 0,
                    }}
                    submit={async (newHabit: Habit) => {
                      await createHabit(userId, newHabit);
                      await refreshHabits(newHabit.id);
                    }}
                  >
                    <Button variant="outline" className="flex gap-1">
                      <PlusIcon />
                      Add habit
                    </Button>
                  </HabitDialog>
                </td>
              </tr>
            </tbody>
          </table>
          <DragOverlay>
            {activeHabit ? (
              <table>
                <tbody>
                  <tr className="w-screen">
                    <HabitRow
                      dragging
                      habit={activeHabit}
                      selectedDate={pivotDate}
                      refreshHabits={refreshHabits}
                    />
                  </tr>
                </tbody>
              </table>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </>
  );
}
