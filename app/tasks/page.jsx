"use client";
import { useEffect, useState, useMemo } from "react";
import TaskForm from "../../components/TaskForm";
import TaskList from "../../components/TaskList";
import NotificationBell from "../../components/NotificationBell";
import useAuthRedirect from "../hooks/useAuthRedirect";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useAuthRedirect();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [dueDateFilter, setDueDateFilter] = useState("");

  const fetchTasks = async () => {
    try {
      const res = await fetch("https://backendrepo-9czv.onrender.com/tasks", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : data.tasks || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && closeModal();
    if (isModalOpen) {
      window.addEventListener("keydown", esc);
      return () => window.removeEventListener("keydown", esc);
    }
  }, [isModalOpen]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const searchMatch =
        task.title?.toLowerCase().includes(search.toLowerCase()) ||
        task.description?.toLowerCase().includes(search.toLowerCase());

      const statusMatch = statusFilter ? task.status === statusFilter : true;
      const priorityMatch = priorityFilter ? task.priority === priorityFilter : true;
      const dueMatch = dueDateFilter
        ? new Date(task.dueDate).toISOString().split("T")[0] === dueDateFilter
        : true;

      return searchMatch && statusMatch && priorityMatch && dueMatch;
    });
  }, [tasks, search, statusFilter, priorityFilter, dueDateFilter]);

  const handleNewTask = (newTask) => {
    setTasks((prev) => [newTask, ...prev]); 
    closeModal();
  };

  return (
    <div className="flex justify-end min-h-screen bg-gray-50">
      <div className="w-full lg:w-[80%] xl:w-[80vw] p-4 sm:p-6 space-y-8">
  
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4 sm:gap-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left">
            My Tasks
          </h1>
          <div className="flex items-center gap-3 sm:gap-4">
            <NotificationBell onNewTask={fetchTasks} />
            <button
              onClick={openModal}
              className="flex items-center cursor-pointer gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm sm:text-base font-medium rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Task
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-wrap sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <input
            type="text"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-sm sm:text-base"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-sm sm:text-base"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input
            type="date"
            value={dueDateFilter}
            onChange={(e) => setDueDateFilter(e.target.value)}
            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-sm sm:text-base"
          />
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("");
              setPriorityFilter("");
              setDueDateFilter("");
            }}
            className="px-3 sm:px-4 py-2 cursor-pointer bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-700 text-sm sm:text-base"
          >
            Reset
          </button>
        </div>

        <div className="overflow-x-auto">
          <TaskList tasks={filteredTasks} setTasks={setTasks} refreshTasks={fetchTasks} />
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-3 sm:p-4 z-50" onClick={closeModal}>
            <div
              className="bg-white rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg p-5 sm:p-6 animate-in fade-in zoom-in duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4 sm:mb-5">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Create New Task</h2>
                <button onClick={closeModal} className="text-gray-400 cursor-pointer hover:text-gray-600 text-2xl sm:text-3xl font-light">
                  ×
                </button>
              </div>
              <TaskForm onTaskCreated={handleNewTask} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}