"use client";
import { useEffect, useState } from "react";

export default function TaskForm({ onTaskCreated }) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);           
  const [currentUser, setCurrentUser] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    status: "pending",
    assignedTo: "", 
  });

  useEffect(() => {
    const userId = localStorage.getItem("userId"); 

    if (!userId) {
      console.error("No userId in localStorage");
      return;
    }

    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(`https://backendrepo-9czv.onrender.com//users/${userId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("User not found");
        const user = await res.json();
        setCurrentUser(user);

        if (user.role !== "admin") {
          setFormData((prev) => ({ ...prev, assignedTo: user._id }));
        }
      } catch (err) {
        console.error(err);
        alert("Failed to load your profile");
      }
    };

    const fetchAllUsers = async () => {
      try {
        const res = await fetch("https://backendrepo-9czv.onrender.com//users", {
          credentials: "include",
        });
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCurrentUser();
    fetchAllUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        assignedTo:
          currentUser?.role === "admin"
            ? formData.assignedTo || null
            : currentUser?._id, 
      };

      const res = await fetch("https://backendrepo-9czv.onrender.com/tasks", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Failed to create task");
      }

      const newTask = await res.json();
      onTaskCreated(newTask);

      setFormData({
        title: "",
        description: "",
        dueDate: "",
        priority: "medium",
        status: "pending",
        assignedTo: currentUser?.role === "admin" ? "" : currentUser?._id,
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = currentUser?.role === "admin";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
  
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Task Title</label>
        <input
          type="text"
          placeholder="Enter task title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring focus:ring-slate-200/50 text-sm sm:text-base"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Description</label>
        <textarea
          placeholder="Enter task description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring focus:ring-slate-200/50 resize-none text-sm sm:text-base"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Due Date</label>
        <input
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          required
          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring focus:ring-slate-200/50 text-slate-600 text-sm sm:text-base"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Assigned To</label>

        {isAdmin ? (
          <select
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring focus:ring-slate-200/50 text-slate-600 text-sm sm:text-base"
          >
            <option value="">Select team member</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name || user.email}
              </option>
            ))}
          </select>
        ) : (
          <div className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-gray-50 text-slate-700 text-sm sm:text-base">
            {currentUser?.name || currentUser?.email || "You"}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring focus:ring-slate-200/50 text-slate-600 text-sm sm:text-base"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring focus:ring-slate-200/50 text-slate-600 text-sm sm:text-base"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 bg-blue-600 cursor-pointer hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-70"
      >
        {loading ? "Creating..." : "Create Task"}
      </button>
    </form>
  );
}