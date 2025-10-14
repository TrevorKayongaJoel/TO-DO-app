
import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useParams } from "react-router-dom";
import API from "./api";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";

import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import HomePage from "./components/HomePage";
import appStyles from './styles/App.module.css';
import todoStyles from './components/TodoListPage.module.css';

function TodoListPage({ onLogout, currentFilter }) {
  const [tasks, setTasks] = useState([]);
  const [username, setUsername] = useState("Loading...");
  const [userEmail, setUserEmail] = useState("Loading...");
  const [plannedSubFilter, setPlannedSubFilter] = useState('all'); // New state for planned sub-filter
  const [customPlannedDate, setCustomPlannedDate] = useState(''); // New state for custom date

  useEffect(() => {
    document.body.style.backgroundColor = 'white';
    return () => {
      document.body.style.backgroundColor = ''; // Revert to default
    };
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await API.get("/api/user");
        setUsername(res.data.username);
        setUserEmail(res.data.email);
      } catch (error) {
        console.error("Error fetching user details:", error);
        if (error.response && error.response.status === 401) {
          onLogout();
        }
      }
    };
    fetchUserDetails();
  }, [onLogout]);


  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      if (error.response && error.response.status === 401) {
        onLogout();
      }
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const filteredTasks = useMemo(() => {
    const getLocalDateString = (date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = getLocalDateString(today);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = getLocalDateString(tomorrow);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

    const filterByDate = (taskDueDate, filterType, customDate) => {
      if (!taskDueDate) return false;
      const taskDate = new Date(taskDueDate);
      taskDate.setHours(0, 0, 0, 0);

      switch (filterType) {
        case 'today':
          return taskDate.valueOf() === today.valueOf();
        case 'tomorrow':
          return taskDate.valueOf() === tomorrow.valueOf();
        case 'overdue':
          return taskDate.valueOf() < today.valueOf();
        case 'thisWeek':
          return taskDate.valueOf() >= startOfWeek.valueOf() && taskDate.valueOf() <= endOfWeek.valueOf();
        case 'customDate':
          if (!customDate) return false;
          const selectedDate = new Date(customDate);
          selectedDate.setHours(0, 0, 0, 0);
          return taskDate.valueOf() === selectedDate.valueOf();
        case 'all': // All planned tasks
          return true;
        default:
          return false;
      }
    };

    switch (currentFilter) {
      case 'today':
        return tasks.filter(t => t.due_date === todayStr && !t.completed);
      case 'important':
        return tasks.filter(t => t.important && !t.completed);
      case 'planned':
        return tasks.filter(t => t.due_date && !t.completed && filterByDate(t.due_date, plannedSubFilter, customPlannedDate));
      case 'completed':
        return tasks.filter(t => t.completed);
      default:
        return tasks.filter(t => !t.completed);
    }
  }, [tasks, currentFilter, plannedSubFilter, customPlannedDate]);

  const importantCount = useMemo(() => tasks.filter(t => t.important && !t.completed).length, [tasks]);

  const onReorder = async (orderedIds) => {
    await API.put("/tasks/reorder", { order: orderedIds });
    fetchTasks();
  };

  const pageTitle = currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1);
  
  const today = new Date();
  const todayDate = `${today.toLocaleDateString('en-US', { weekday: 'long' })} ${today.getDate()} ${today.toLocaleDateString('en-US', { month: 'long' })} ${today.getFullYear()}`;

  const handleCustomDateChange = (e) => {
    const date = e.target.value;
    setCustomPlannedDate(date);
    setPlannedSubFilter(date ? 'customDate' : 'all');
  };

  return (
    <div className={todoStyles['todo-page-layout']}>
      <div className={todoStyles['sidebar']}>
        <div className={todoStyles['user-info']}>
          <h3>{username}</h3>
          <p>{userEmail}</p>
        </div>
        <nav className={todoStyles['sidebar-nav']}>
          <Link to="/todos/today" className={`${todoStyles['sidebar-nav-item']} ${currentFilter === 'today' ? todoStyles['active'] : ''}`}>Today</Link>
          <Link to="/todos/important" className={`${todoStyles['sidebar-nav-item']} ${currentFilter === 'important' ? todoStyles['active'] : ''}`}>
            <span>Important</span>
            {importantCount > 0 && <span className={todoStyles['notification-badge']}>{importantCount}</span>}
          </Link>
          <Link to="/todos/planned" className={`${todoStyles['sidebar-nav-item']} ${currentFilter === 'planned' ? todoStyles['active'] : ''}`}>Planned</Link>
          <Link to="/todos/completed" className={`${todoStyles['sidebar-nav-item']} ${currentFilter === 'completed' ? todoStyles['active'] : ''}`}>Completed</Link>
        </nav>
        <button onClick={onLogout} className={todoStyles['logout-button']}>Logout</button>
      </div>
      <div className={todoStyles['main-content']}>
        <div className={todoStyles['app-container']}>
          <div className={todoStyles['title-container']}>
            <h1 className={todoStyles['h1']}>{pageTitle}</h1>
            {currentFilter === 'today' && <p className={todoStyles['today-date']}>{todayDate}</p>}
          </div>
          {currentFilter === 'planned' && (
            <div className={todoStyles['planned-sub-filters']}>
              <button onClick={() => { setPlannedSubFilter('all'); setCustomPlannedDate(''); }} className={plannedSubFilter === 'all' ? todoStyles['active'] : ''}>All Planned</button>
              <button onClick={() => { setPlannedSubFilter('today'); setCustomPlannedDate(''); }} className={plannedSubFilter === 'today' ? todoStyles['active'] : ''}>Today</button>
              <button onClick={() => { setPlannedSubFilter('tomorrow'); setCustomPlannedDate(''); }} className={plannedSubFilter === 'tomorrow' ? todoStyles['active'] : ''}>Tomorrow</button>
              <button onClick={() => { setPlannedSubFilter('overdue'); setCustomPlannedDate(''); }} className={plannedSubFilter === 'overdue' ? todoStyles['active'] : ''}>Overdue</button>
              <button onClick={() => { setPlannedSubFilter('thisWeek'); setCustomPlannedDate(''); }} className={plannedSubFilter === 'thisWeek' ? todoStyles['active'] : ''}>This week</button>
              <input 
                type="date" 
                value={customPlannedDate} 
                onChange={handleCustomDateChange}
                className={`${todoStyles['planned-date-input']} ${plannedSubFilter === 'customDate' ? todoStyles['active'] : ''}`}
              />
            </div>
          )}
          <TaskForm onAdd={fetchTasks} isTodayView={currentFilter === 'today'} isImportantView={currentFilter === 'important'} isPlannedView={currentFilter === 'planned'} />
          <TaskList tasks={filteredTasks} onChange={fetchTasks} onReorder={onReorder} />
        </div>
      </div>
    </div>
  );
}


function AuthRoutes() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate("/todos/today"); // Navigate to /todos/today after login
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <Routes>
      <Route path="/" element={!isAuthenticated ? <HomePage /> : <Navigate to="/todos/today" />} />
      <Route path="/login" element={!isAuthenticated ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/todos/today" />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/todos/today" />} />
      <Route
        path="/todos/today"
        element={isAuthenticated ? <TodoListPage onLogout={handleLogout} currentFilter="today" /> : <Navigate to="/login" />}
      />
      <Route
        path="/todos/important"
        element={isAuthenticated ? <TodoListPage onLogout={handleLogout} currentFilter="important" /> : <Navigate to="/login" />}
      />
      <Route
        path="/todos/planned"
        element={isAuthenticated ? <TodoListPage onLogout={handleLogout} currentFilter="planned" /> : <Navigate to="/login" />}
      />
      <Route
        path="/todos/completed"
        element={isAuthenticated ? <TodoListPage onLogout={handleLogout} currentFilter="completed" /> : <Navigate to="/login" />}
      />
      {/* Fallback for /todos if no specific filter is provided, redirects to /todos/today */}
      <Route
        path="/todos"
        element={isAuthenticated ? <Navigate to="/todos/today" /> : <Navigate to="/login" />} 
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthRoutes />
    </BrowserRouter>
  );
}








