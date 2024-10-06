import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableItemProps {
  className?: string;
  id: string;
  children: React.ReactNode;
}

export function SortableItem({ className, id, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      className={className}
      style={style}
      {...attributes}
      {...listeners}
    >
      {children}
    </tr>
  );
}
