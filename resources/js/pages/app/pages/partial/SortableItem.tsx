"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

export const SortableItem = ({ id, children }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            children: React.Children.map(child.props.children, (grandChild) => {
              if (React.isValidElement(grandChild)) {
                const props = grandChild.props as { 'data-drag-handle'?: boolean };
                if (props['data-drag-handle']) {
                  return React.cloneElement(grandChild, {
                    ...listeners,
                  });
                }
              }
              return grandChild;
            }),
          });
        }
        return child;
      })}
    </div>
  );
};