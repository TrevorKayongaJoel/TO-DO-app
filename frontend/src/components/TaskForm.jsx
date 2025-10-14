import { useState } from "react";
import API from "../api";
import styles from './TaskForm.module.css';

export default function TaskForm({ onAdd, isTodayView, isImportantView, isPlannedView }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleAdd = async () => {
    if (!title.trim()) return;

    let taskData = { title, description, due_date: dueDate };

    if (isTodayView) {
      const today = new Date();
      const todayStr = getLocalDateString(today);
      taskData = { title, due_date: todayStr };
    } else if (isImportantView) {
      taskData = { title, important: true };
    } else if (isPlannedView) {
      taskData = { title, due_date: dueDate };
    }

    await API.post("/tasks", taskData);
    setTitle("");
    setDescription("");
    setDueDate("");
    onAdd();
  };

  const showDescriptionField = !isTodayView && !isImportantView && !isPlannedView;
  const showDueDateField = !isTodayView && !isImportantView; // Show date field on Planned, but not Today/Important

  return (
    <div className={styles['task-form']}>
      <input
        className={styles['task-form-input']}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title…"
      />
      {showDescriptionField && (
        <input
          className={styles['task-form-input']}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)…"
        />
      )}
      {showDueDateField && (
        <input
          className={styles['task-form-input']}
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      )}
      <button className={styles['task-form-button']} onClick={handleAdd}>Add</button>
    </div>
  );
}
