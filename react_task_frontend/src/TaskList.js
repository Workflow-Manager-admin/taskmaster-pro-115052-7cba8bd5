import React, { useState, useRef, useEffect } from "react";

/**
 * PUBLIC_INTERFACE
 * TaskList - Enhanced with modern add/remove animations and accessibility.
 */
function TaskList({
  tasks,
  loading,
  error,
  onEditTask,
  onDeleteTask,
  onToggleCompleted,
  filterCategory = "All",
  groupByCategory = false,
  categoryColors = {},
}) {
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  // For animation: track visible tasks by id for fade-in/out
  const [taskIds, setTaskIds] = useState(() => (Array.isArray(tasks) ? tasks.map(t => t.id) : []));
  const prevTaskIds = useRef(taskIds);

  // Watch for change to tasks, animate removal
  useEffect(() => {
    if (!Array.isArray(tasks)) return;
    const ids = tasks.map(t => t.id);
    setTaskIds(ids);
    prevTaskIds.current = ids;
  }, [tasks]);

  // For highlighting overdue
  const isOverdue = (dueDate, completed) => {
    if (!dueDate || completed) return false;
    try {
      return new Date(dueDate) < new Date(new Date().toDateString());
    } catch {
      return false;
    }
  };

  // Filtering logic
  let filtered = Array.isArray(tasks) ? tasks : [];
  if (filterCategory && filterCategory !== "All") {
    filtered = filtered.filter(
      (t) => (t.category || "").trim() === filterCategory
    );
  }

  // Group by logic
  let grouped = {};
  let showGroups = groupByCategory && filtered.length > 0;
  if (showGroups) {
    grouped = {};
    filtered.forEach((t) => {
      const cat = (t.category && t.category.trim()) || "(No Category)";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(t);
    });
  }

  // Render animated transitions for each task (on add/remove)
  return (
    <section className="task-list-section">
      <h2 className="section-title">Tasks</h2>
      {error && (
        <div style={{ color: "#e53935", marginBottom: 6 }}>{error}</div>
      )}
      {loading && (
        <div className="task-list-placeholder">
          <p>Loading tasks...</p>
        </div>
      )}
      {!loading && filtered.length === 0 && (
        <div className="task-list-placeholder">
          <p>No tasks found.</p>
        </div>
      )}
      {showGroups ? (
        // Render grouped by category
        Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} style={{ marginBottom: 26 }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 5, gap: 7 }}>
              <span
                style={{
                  background: categoryColors[cat] || "#757575",
                  color: "#fff",
                  borderRadius: 6,
                  padding: "2px 12px",
                  fontWeight: 600,
                  fontSize: "1rem",
                  marginRight: 6,
                  letterSpacing: "0.5px",
                  opacity: 0.85
                }}
              >
                {cat}
              </span>
              <span style={{ color: "#999", fontSize: "0.98rem" }}>
                {items.length} task{items.length !== 1 ? "s" : ""}
              </span>
            </div>
            <ul className="animated-list" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {items.map((task) =>
                <AnimatedTaskLi
                  key={task.id}
                  show={taskIds.includes(task.id)}
                  render={() => renderTask(task)}
                  id={task.id}
                />
              )}
            </ul>
          </div>
        ))
      ) : (
        <ul className="animated-list" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {filtered.map((task) =>
            <AnimatedTaskLi
              key={task.id}
              show={taskIds.includes(task.id)}
              render={() => renderTask(task)}
              id={task.id}
            />
          )}
        </ul>
      )}
    </section>
  );

  // PUBLIC_INTERFACE
  function renderTask(task) {
    const cat =
      (task.category && task.category.trim()) || (task.category && String(task.category)) || "";
    return (
      <div
        className="taskcard"
        tabIndex={0}
        // Accessibility: highlight task on keyboard navigation
        style={{
          border: "1px solid var(--border-color)",
          borderRadius: 8,
          padding: "12px 14px 10px 14px",
          marginBottom: 15,
          background: "var(--bg-primary)",
          opacity: task.completed ? 0.6 : 1,
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          transition: "box-shadow 0.18s, opacity 0.34s cubic-bezier(.4,0,.2,1)",
        }}
      >
        <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={!!task.completed}
            onChange={() => onToggleCompleted(task.id)}
            style={{
              accentColor: task.completed
                ? "#4caf50"
                : isOverdue(task.due_date, task.completed)
                ? "#e53935"
                : categoryColors[cat] || "#1976d2",
              cursor: loading ? "not-allowed" : "pointer",
              width: 18,
              height: 18,
            }}
            disabled={loading}
            aria-label="Mark as completed"
          />
          <div style={{ flex: 1 }}>
            <span
              style={{
                fontWeight: 550,
                fontSize: "1.05rem",
                textDecoration: task.completed ? "line-through" : "none",
                color: isOverdue(task.due_date, task.completed)
                  ? "#e53935"
                  : "inherit",
                transition: "color 0.15s",
              }}
              title={isOverdue(task.due_date, task.completed) ? "Overdue!" : undefined}
            >
              {task.title}
            </span>
            {cat && (
              <span
                style={{
                  background: categoryColors[cat] || "#eceff1",
                  color: categoryColors[cat]
                    ? "#fff"
                    : "#1976d2",
                  borderRadius: 6,
                  fontSize: "0.93rem",
                  fontWeight: 500,
                  padding: "2.5px 9px",
                  marginLeft: 9,
                  boxShadow: categoryColors[cat]
                    ? "0 0 0 2.5px rgba(0,0,0,0.06)"
                    : undefined,
                  opacity: 0.80,
                  display: "inline-block"
                }}
              >
                {cat}
              </span>
            )}
          </div>
          <div>
            <button
              aria-label="Edit"
              onClick={() => onEditTask(task.id)}
              title="Edit"
              disabled={loading}
              style={{
                background: "#1a75ff",
                color: "#fff",
                border: 0,
                borderRadius: 5,
                padding: "3px 13px",
                fontWeight: "bold",
                marginRight: 6,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.14s",
              }}
            >
              ✎
            </button>
            <button
              aria-label="Delete"
              onClick={() => setDeleteConfirmId(task.id)}
              title="Delete"
              disabled={loading}
              style={{
                background: "#e53935",
                color: "#fff",
                border: 0,
                borderRadius: 5,
                padding: "3px 11px",
                fontWeight: "bold",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.14s",
              }}
            >
              🗑
            </button>
          </div>
        </div>
        {task.description && (
          <div
            style={{
              marginLeft: 32,
              color: "#888",
              marginTop: 3,
              paddingBottom: 2,
              fontSize: "0.95rem",
              transition: "color 0.11s",
            }}
          >
            {task.description}
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginLeft: 32,
            marginTop: 2,
            gap: 20,
            fontSize: "0.91rem",
          }}
        >
          {task.due_date && (
            <span
              style={{
                color: isOverdue(task.due_date, task.completed)
                  ? "#e53935"
                  : "#1976d2",
                fontWeight: isOverdue(task.due_date, task.completed)
                  ? 600
                  : 400,
                borderBottom: isOverdue(task.due_date, task.completed)
                  ? "1.5px dotted #e53935"
                  : undefined,
                paddingBottom: isOverdue(task.due_date, task.completed)
                  ? "1px"
                  : undefined,
                transition: "color 0.17s"
              }}
              title={isOverdue(task.due_date, task.completed) ? "Task is overdue!" : undefined}
            >
              Due: {new Date(task.due_date).toLocaleDateString()}
            </span>
          )}
          <span>
            Priority:{" "}
            <b
              style={{
                color:
                  task.priority === "high"
                    ? "#e53935"
                    : task.priority === "low"
                    ? "#888"
                    : "#424242",
              }}
            >
              {capitalize(task.priority || "normal")}
            </b>
          </span>
          {task.completed && (
            <span style={{ color: "#4caf50" }}>Completed</span>
          )}
        </div>
        {/* Confirmation dialog for delete */}
        {deleteConfirmId === task.id && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              background: "rgba(32,32,32,0.78)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              zIndex: 10,
              color: "#fff",
              animation: "fade-pop-in 0.24s cubic-bezier(.4,0,.6,1)"
            }}
          >
            <div
              style={{
                background: "#282c34",
                borderRadius: 7,
                padding: "19px 29px",
                boxShadow: "0 0 12px #1118",
                border: "1px solid #444",
                textAlign: "center",
              }}
            >
              <div style={{ marginBottom: 12 }}>
                Delete this task? <br />
                <span style={{ color: "#ffcccb", fontWeight: 500 }}>
                  {task.title}
                </span>
              </div>
              <button
                onClick={() => {
                  setDeleteConfirmId(null);
                  onDeleteTask(task.id);
                }}
                style={{
                  background: "#e53935",
                  color: "#fff",
                  border: 0,
                  borderRadius: 6,
                  padding: "5px 19px",
                  fontWeight: "bold",
                  marginRight: 12,
                  fontSize: 15,
                }}
                disabled={loading}
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                style={{
                  background: "#999",
                  color: "#fff",
                  border: 0,
                  borderRadius: 6,
                  padding: "5px 17px",
                  fontWeight: "normal",
                  fontSize: 15,
                }}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

// Helper component: Animate adding/removing with fade in/out
function AnimatedTaskLi({ show, render, id }) {
  const [shouldRender, setShouldRender] = useState(show);
  const [animClass, setAnimClass] = useState("");

  useEffect(() => {
    let timeout;
    if (show) {
      setShouldRender(true);
      setAnimClass("fade-in");
    } else {
      setAnimClass("fade-out");
      timeout = setTimeout(() => setShouldRender(false), 440); // slightly more than CSS duration
    }
    return () => clearTimeout(timeout);
  }, [show]);

  return shouldRender ? (
    <li
      className={`animated-task-li ${animClass}`}
      tabIndex={-1}
      aria-live="polite"
      aria-atomic="true"
      data-task-id={id}
      style={{
        transition: "opacity 0.38s cubic-bezier(.4,0,.2,1), transform 0.39s cubic-bezier(.4,0,.2,1)",
        willChange: "opacity, transform"
      }}
    >
      {render()}
    </li>
  ) : null;
}

// Remove legacy style injection
// Keyframes and classes moved to CSS

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default TaskList;
