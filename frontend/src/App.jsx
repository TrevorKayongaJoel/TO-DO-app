
import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useParams } from "react-router-dom";
import API from "./api";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import FilterBar from "./components/FilterBar";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import HomePage from "./components/HomePage";
import appStyles from './styles/App.module.css';
import todoStyles from './components/TodoListPage.module.css';

function TodoListPage({ onLogout, currentFilter }) {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState(currentFilter || "all"); // Use currentFilter or default to "all"
  const [username, setUsername] = useState("Loading...");
  const [userEmail, setUserEmail] = useState("Loading...");

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
      }d
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

  const filtered = useMemo(() => {
    // Placeholder for actual filtering logic based on currentFilter
    if (filter === "completed") return tasks.filter(t => t.completed);
    if (filter === "pending") return tasks.filter(t => !t.completed);
    if (filter === "today") return tasks; // TODO: Implement actual "today" filter
    if (filter === "important") return tasks; // TODO: Implement actual "important" filter
    if (filter === "planned") return tasks; // TODO: Implement actual "planned" filter
    return tasks;
  }, [tasks, filter]);

  const onReorder = async (orderedIds) => {
    await API.put("/tasks/reorder", { order: orderedIds });
    fetchTasks();
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
          <Link to="/todos/important" className={`${todoStyles['sidebar-nav-item']} ${currentFilter === 'important' ? todoStyles['active'] : ''}`}>Important</Link>
          <Link to="/todos/planned" className={`${todoStyles['sidebar-nav-item']} ${currentFilter === 'planned' ? todoStyles['active'] : ''}`}>Planned</Link>
        </nav>
        <button onClick={onLogout} className={todoStyles['logout-button']}>Logout</button>
      </div>
      <div className={todoStyles['main-content']}>
        <div className={todoStyles['app-container']}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1 className={todoStyles['h1']}>📝 To‑Do</h1>
          </div>
          <TaskForm onAdd={fetchTasks} />
          <FilterBar filter={filter} setFilter={setFilter} />
          <TaskList tasks={filtered} onChange={fetchTasks} onReorder={onReorder} />
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


