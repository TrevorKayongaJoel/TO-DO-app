import { useState } from "react";

export default function TaskItem({ task, onToggle, onDelete, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");

  const save = async () => {
    await onSave({ ...task, title, description });
    setIsEditing(false);
  };

  return (
    <li className="task-item">
      <div className="left">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task)}
        />
        {isEditing ? (
          <div className="edit-fields">
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
            <input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        ) : (
          <div className="display-fields">
            <div className={task.completed ? "title done" : "title"}>{task.title}</div>
            {task.description && <div className="desc">{task.description}</div>}
          </div>
        )}
      </div>
      <div className="actions">
        {isEditing ? (
          <>
            <button onClick={save}>Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </>
        ) : (
          <>
            <button onClick={() => setIsEditing(true)}>Edit</button>
            <button onClick={() => onDelete(task.id)}>❌</button>
          </>
        )}
      </div>
    </li>
  );
}
