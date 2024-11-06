import { useState } from "react";
import { createHabit, createHabitEntry, type Habit } from "@/lib/api";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import { datesMatch, tryTriggerConfetti } from "@/lib/utils";
import { SortableItem } from "@/components/sortable/SortableItem";
import HabitDialog from "@/components/habits/HabitDialog";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import HabitRow from "./HabitRow";
import type { FetchHabits } from "@/components/types";

const userId = 1;

interface Props {
  habits: Habit[];
  fetchHabits: FetchHabits;
  updateHabits: (habits: Habit[]) => Promise<void>;
  pivotDate: Date;
}

export default function Month({
  habits,
  fetchHabits,
  updateHabits,
  pivotDate,
}: Props) {
  const [activeHabit, setActiveHabit] = useState<Habit | null>(null);

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
    useSensor(TouchSensor)
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
    pivotDate.getMonth()
  );

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

    await updateHabits(newIndexedHabits);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;

    const habit = habits.find((x) => x.id.toString() === active.id);
    if (!habit) return;
    setActiveHabit(habit);
  };

  const createNewHabitEntry = async (habitId: number, date: Date) => {
    await createHabitEntry(habitId, date);
    const newHabits = await fetchHabits();
    tryTriggerConfetti(newHabits, date);
  };

  return (
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
              <th className="text-xl font-semibold mb-2">{getMonthName()}</th>
              {daysInMonth.map((date) => (
                <th
                  key={date.toJSON()}
                  className={`${
                    datesMatch(date, new Date()) ? "bg-ring/20" : ""
                  } min-h-12 min-w-12 border bg-secondary text-secondary-foreground`}
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
                  fetchHabits={fetchHabits}
                  createHabitEntry={createNewHabitEntry}
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
                    await fetchHabits();
                  }}
                >
                  <Button variant="outline" className="flex gap-1 mt-4">
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
                    fetchHabits={fetchHabits}
                    createHabitEntry={createNewHabitEntry}
                  />
                </tr>
              </tbody>
            </table>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
