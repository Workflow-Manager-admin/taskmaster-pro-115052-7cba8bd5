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
  // Filter/group/category UI state:
  const [filterCategory, setFilterCategory] = useState("All");
  const [groupByCategory, setGroupByCategory] = useState(false);

  // Extract category list from tasks (unique, sorted, exclude empty).
  const categories = Array.from(
    new Set(
      tasks
        .filter((t) => t.category && t.category.trim())
        .map((t) => t.category.trim())
    )
  ).sort();

  // Assign color per category: use cycling palette, fallback to accent.
  const defaultPalette = [
    "#1976d2", // blue
    "#e53935", // red
    "#43a047", // green
    "#ffa726", // orange
    "#8e24aa", // purple
    "#fbc02d", // yellow
    "#00acc1", // teal
    "#d81b60", // pink
    "#795548", // brown
    "#757575" // gray
  ];
  // Map category name => color. Cycle palette.
  const categoryColors = {};
  categories.forEach((cat, i) => {
    categoryColors[cat] = defaultPalette[i % defaultPalette.length];
  });

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
          {/* Category/filter controls */}
          <ControlsSection
            tasks={tasks}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            groupByCategory={groupByCategory}
            setGroupByCategory={setGroupByCategory}
            categories={categories}
            categoryColors={categoryColors}
          />
        </div>
        <TaskList
          tasks={tasks}
          loading={loading}
          error={error}
          onEditTask={handleEditTaskInit}
          onDeleteTask={handleDeleteTask}
          onToggleCompleted={handleToggleCompleted}
          filterCategory={filterCategory}
          groupByCategory={groupByCategory}
          categoryColors={categoryColors}
        />
      </main>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * ControlsSection - Handles category filter/group/toggle UI.
 */
function ControlsSection({
  tasks,
  filterCategory,
  setFilterCategory,
  groupByCategory,
  setGroupByCategory,
  categories,
  categoryColors,
}) {
  // If no categories, let user know to add tasks with category.
  return (
    <section className="task-controls-section">
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", width: "100%" }}>
        <label style={{ fontSize: 15, fontWeight: 500, marginRight: 10 }}>
          Category:
        </label>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ minWidth: 100, fontSize: "1rem", borderRadius: 6, padding: "2px 8px" }}
        >
          <option value="All">All</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <label
          style={{
            marginLeft: 16,
            fontWeight: 500,
            fontSize: 15,
            userSelect: "none",
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            gap: 6,
          }}
          htmlFor="groupByCategory"
        >
          <input
            type="checkbox"
            id="groupByCategory"
            checked={groupByCategory}
            onChange={() => setGroupByCategory((v) => !v)}
            style={{ marginRight: 4, accentColor: "#43a047", width: 15, height: 15 }}
          />
          Group by category
        </label>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          {categories.length > 0 && (
            <>
              <span style={{ fontSize: 13, color: "#888", marginRight: 3 }}>Legend:</span>
              {categories.map((cat) => (
                <span
                  key={cat}
                  style={{
                    background: categoryColors[cat],
                    color: "#fff",
                    borderRadius: 7,
                    fontSize: "0.93rem",
                    fontWeight: 500,
                    padding: "2px 10px",
                    marginLeft: 3,
                    marginRight: 0,
                    opacity: 0.8,
                  }}
                  title={cat}
                >
                  {cat}
                </span>
              ))}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default App;
