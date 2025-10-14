import styles from './TodoListPage.module.css';

export default function TaskItem({ task, onToggle, onToggleImportant }) {
  return (
    <li className={styles['task-item']}>
      <div className={styles['left']}>
        <input
          type="radio"
          checked={task.completed}
          onChange={() => onToggle(task)}
        />
        <div className={styles['display-fields']}>
          <div className={`${styles.title} ${task.completed ? styles.done : ''}`}>{task.title}</div>
          {task.description && <div className={styles.desc}>{task.description}</div>}
          {task.due_date && <div className={styles.desc}>Due: {new Date(task.due_date).toLocaleDateString()}</div>}
        </div>
      </div>
      <div className={styles['actions']}>
        <button onClick={() => onToggleImportant(task)} className={styles['star-button']}>
          {task.important ? '⭐' : '☆'}
        </button>
      </div>
    </li>
  );
}
