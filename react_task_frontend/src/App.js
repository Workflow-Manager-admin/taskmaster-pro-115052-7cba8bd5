import React, { useState, useEffect } from "react";
import "./App.css";
import TaskList from "./TaskList";
import TaskForm from "./TaskForm";

/**
 * PUBLIC_INTERFACE
 * Header with app title and theme toggle button.
 */
function Header({ theme, toggleTheme }) {
  return (
    <header className="header">
      <h1 className="app-title">Taskmaster Pro</h1>
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      >
        {theme === "light" ? "🌙 Dark" : "☀️ Light"}
      </button>
    </header>
  );
}

// Helper: API endpoint root (assume backend on localhost:3001, adjust as needed)
const API_ROOT = "http://localhost:3001/api/tasks";

/**
 * PUBLIC_INTERFACE
 * Main app – holds all app-level state (tasks, loading, etc) and CRUD logic.
 */
function App() {
  const [theme, setTheme] = useState("light");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    // Fetch all tasks from API on mount
    setLoading(true);
    fetch(API_ROOT)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load tasks");
        return res.json();
      })
      .then((data) => {
        setTasks(data);
        setError("");
      })
      .catch((err) => {
        setError(err.message || "Could not load tasks");
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleTheme = () =>
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));

  // PUBLIC_INTERFACE
  /** Add a task via form */
  const handleAddTask = async (task) => {
    setLoading(true);
    try {
      const resp = await fetch(API_ROOT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });
      if (!resp.ok) throw new Error("Create failed");
      const newTask = await resp.json();
      setTasks((prev) => [...prev, newTask]);
      setError("");
    } catch (e) {
      setError(e.message || "Could not add task");
    }
    setLoading(false);
  };

  // PUBLIC_INTERFACE
  /** Initiate editing a specific task (show form prefilled) */
  const handleEditTaskInit = (taskId) => {
    const found = tasks.find((t) => t.id === taskId);
    setEditingTask(found || null);
  };

  // PUBLIC_INTERFACE
  /** Submit updated task data */
  const handleEditTaskSubmit = async (task) => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_ROOT}/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });
      if (!resp.ok) throw new Error("Edit failed");
      const updated = await resp.json();
      setTasks((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
      setEditingTask(null);
      setError("");
    } catch (e) {
      setError(e.message || "Could not save changes");
    }
    setLoading(false);
  };

  // PUBLIC_INTERFACE
  /** Delete a task by id */
  const handleDeleteTask = async (taskId) => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_ROOT}/${taskId}`, {
        method: "DELETE",
      });
      if (!resp.ok) throw new Error("Delete failed");
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setError("");
      // If deleting currently editing task, reset form
      if (editingTask && editingTask.id === taskId) setEditingTask(null);
    } catch (e) {
      setError(e.message || "Could not delete task");
    }
    setLoading(false);
  };

  // PUBLIC_INTERFACE
  /** Toggle completion state for task */
  const handleToggleCompleted = async (taskId) => {
    const found = tasks.find((t) => t.id === taskId);
    if (!found) return;
    setLoading(true);
    try {
      const resp = await fetch(`${API_ROOT}/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...found, completed: !found.completed }),
      });
      if (!resp.ok) throw new Error("Completion update failed");
      const updated = await resp.json();
      setTasks((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
      setError("");
    } catch (e) {
      setError(e.message || "Could not update task status");
    }
    setLoading(false);
  };

  /** Cancel editing */
  const handleCancelEdit = () => setEditingTask(null);

  return (
    <div className="App">
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main className="main-content">
        <div className="form-controls-container">
          <TaskForm
            onAddTask={handleAddTask}
            onEditTask={handleEditTaskSubmit}
            editTask={editingTask}
            onCancelEdit={handleCancelEdit}
            loading={loading}
          />
          {/* Category/filter controls placeholder, will be implemented later */}
          <section className="task-controls-section">
            <div className="task-controls-placeholder">
              <p>Category & Filter Controls will appear here.</p>
            </div>
          </section>
        </div>
        <TaskList
          tasks={tasks}
          loading={loading}
          error={error}
          onEditTask={handleEditTaskInit}
          onDeleteTask={handleDeleteTask}
          onToggleCompleted={handleToggleCompleted}
        />
      </main>
    </div>
  );
}

export default App;
