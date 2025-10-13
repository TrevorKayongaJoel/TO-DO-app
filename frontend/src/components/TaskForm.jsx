import { useState } from "react";
import API from "../api";
import styles from './TaskForm.module.css';

export default function TaskForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleAdd = async () => {
    if (!title.trim()) return;
    await API.post("/tasks", { title, description });
    setTitle("");
    setDescription("");
    onAdd();
  };

  return (
    <div className={styles['task-form']}>
      <input
        className={styles['task-form-input']}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title…"
      />
      <input
        className={styles['task-form-input']}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)…"
      />
      <button className={styles['task-form-button']} onClick={handleAdd}>Add</button>
    </div>
  );
}
