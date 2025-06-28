import React, { useState, useEffect } from "react";

/**
 * PUBLIC_INTERFACE
 * TaskForm - For creating and editing tasks. Controlled form for title, description, category, priority, due date.
 *
 * Props:
 * - onAddTask(task) (called when creating)
 * - onEditTask(task) (called when submitting edit)
 * - editTask (task being edited, or null)
 * - onCancelEdit()
 * - loading (bool, disables form when true)
 */
function TaskForm({
  onAddTask,
  onEditTask,
  editTask,
  onCancelEdit,
  loading = false,
}) {
  // Controlled fields:
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("normal");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  // Reset or pre-fill when editing
  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title || "");
      setDescription(editTask.description || "");
      setCategory(editTask.category || "");
      setPriority(editTask.priority || "normal");
      setDueDate(editTask.due_date ? editTask.due_date.slice(0, 10) : "");
      setError("");
    } else {
      setTitle("");
      setDescription("");
      setCategory("");
      setPriority("normal");
      setDueDate("");
      setError("");
    }
  }, [editTask]);

  function validate() {
    if (!title.trim()) return "Title required";
    if (title.length > 140)
      return "Title too long (max 140 characters)";
    // Other validation as needed
    return "";
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errMsg = validate();
    if (errMsg) {
      setError(errMsg);
      return;
    }
    const taskObj = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      priority,
      due_date: dueDate ? dueDate : null,
      ...(editTask ? { id: editTask.id, completed: editTask.completed } : {}),
    };
    if (editTask) {
      onEditTask(taskObj);
    } else {
      onAddTask({ ...taskObj, completed: false });
    }
    // Clear form only if not editing
    if (!editTask) {
      setTitle("");
      setDescription("");
      setCategory("");
      setPriority("normal");
      setDueDate("");
      setError("");
    }
  }

  return (
    <section className="task-form-section">
      <h2 className="section-title">
        {editTask ? "Edit Task" : "Add New Task"}
      </h2>
      <form className="task-form" onSubmit={handleSubmit} autoComplete="off">
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          <input
            type="text"
            placeholder="Task title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={140}
            disabled={loading}
            required
            autoFocus
            style={{ fontWeight: 500, fontSize: "1rem" }}
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            maxLength={500}
            disabled={loading}
            style={{ resize: "vertical", minHeight: "32px" }}
          />
          <div style={{ display: "flex", gap: 12 }}>
            <input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ flex: 1 }}
              disabled={loading}
              maxLength={40}
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              disabled={loading}
              style={{ minWidth: "96px" }}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={loading}
              style={{ minWidth: "120px" }}
            />
          </div>
        </div>
        {error && (
          <div style={{ color: "#e53935", marginTop: 7 }}>{error}</div>
        )}
        <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
          <button
            type="submit"
            className="theme-toggle"
            style={{ minWidth: 88 }}
            disabled={loading}
          >
            {editTask ? "Save Changes" : "Add Task"}
          </button>
          {editTask && (
            <button
              type="button"
              className="theme-toggle"
              style={{ minWidth: 84, background: "#888" }}
              disabled={loading}
              onClick={onCancelEdit}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export default TaskForm;
