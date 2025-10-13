import API from "../api";
import TaskItem from "./TaskItem";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useState, useEffect } from "react";

export default function TaskList({ tasks, onChange, onReorder }) {
  const [items, setItems] = useState([]);

  useEffect(() => setItems(tasks), [tasks]);

  const handleDragEnd = async (result) => {
    const { destination, source } = result;
    if (!destination) return;
    if (destination.index === source.index) return;

    const newItems = Array.from(items);
    const [moved] = newItems.splice(source.index, 1);
    newItems.splice(destination.index, 0, moved);
    setItems(newItems);

    // Persist order: send array of IDs in new order (full list within filtered view)
    const orderedIds = newItems.map((t) => t.id);
    await onReorder(orderedIds);
  };

  const toggle = async (task) => {
    await API.put(`/tasks/${task.id}`, { completed: !task.completed });
    onChange();
  };

  const remove = async (id) => {
    await API.delete(`/tasks/${id}`);
    onChange();
  };

  const save = async (updated) => {
    await API.put(`/tasks/${updated.id}`, {
      title: updated.title,
      description: updated.description,
    });
    onChange();
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="list">
        {(provided) => (
          <ul className="task-list" ref={provided.innerRef} {...provided.droppableProps}>
            {items.map((t, idx) => (
              <Draggable key={t.id} draggableId={String(t.id)} index={idx}>
                {(prov) => (
                  <li ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}>
                    <TaskItem task={t} onToggle={toggle} onDelete={remove} onSave={save} />
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
}
