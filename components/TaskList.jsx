"use client";
import { useEffect, useState } from "react";
import DeletePopup from "./DeletePopup";
import EditForm from "./EditForm";

export default function TaskList({ tasks, setTasks, refreshTasks }) {
  const [users, setUsers] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [formData, setFormData] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 4;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("https://backendrepo-9czv.onrender.com/users", { credentials: "include" });
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const res = await fetch("https://backendrepo-9czv.onrender.com/auth/profile", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch current user");
        const data = await res.json();
        setCurrentUser(data);
      } catch (err) {
        console.error(err);
      }
    };

    Promise.all([fetchUsers(), fetchCurrentUser()]).finally(() => setLoading(false));
  }, []);

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(tasks.length / tasksPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [tasks.length]);

  const openEdit = (task) => {
    setFormData({
      title: task.title || "",
      description: task.description || "",
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
      priority: task.priority || "medium",
      status: task.status || "pending",
      assignedTo: task.assignedTo?._id || "",
    });
    setEditingTask(task._id);
  };

  const handleUpdate = async () => {
    if (!editingTask) return;
    setLoading(true);

    try {
      const body = {
        ...formData,
        assignedTo: formData.assignedTo || null,
      };

      const res = await fetch(`https://backendrepo-9czv.onrender.com/tasks/${editingTask}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to update");

      const updatedTask = await res.json();
      setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
      setEditingTask(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTask) return;
    try {
      const res = await fetch(`https://backendrepo-9czv.onrender.com/tasks/${deletingTask}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");

      setTasks((prev) => prev.filter((t) => t._id !== deletingTask));
      setDeletingTask(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      completed: "bg-green-50 text-green-700",
      "in-progress": "bg-blue-50 text-blue-700",
      pending: "bg-gray-50 text-gray-700",
    };
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
          styles[status] || styles.pending
        }`}
      >
        {status.replace("-", " ")}
      </span>
    );
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading tasks...</div>;
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {tasks.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-sm">No tasks yet. Create one!</p>
          </div>
        ) : (
          <>
            <div className="w-full overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Assignee
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Due
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {currentTasks.map((task) => (
                    <tr key={task._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{task.title}</p>
                          {task.description && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {task.assignedTo?.name || (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </td>

                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={task.status} />
                      </td>

                      <td className="px-4 sm:px-6 py-4 text-sm font-medium whitespace-nowrap">
                        <button
                          onClick={() => openEdit(task)}
                          className="text-indigo-600 cursor-pointer hover:text-indigo-800 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingTask(task._id)}
                          className="text-red-600 cursor-pointer hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
    
                  <div className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {indexOfFirstTask + 1}-{Math.min(indexOfLastTask, tasks.length)}
                    </span>{" "}
                    of <span className="font-medium">{tasks.length}</span> tasks
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="inline-flex cursor-pointer items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => paginate(page)}
                          className={`
                            w-10 h-10 rounded-lg cursor-pointer text-sm font-medium border transition-all duration-200 flex items-center justify-center
                            ${
                              currentPage === page
                                ? "bg-indigo-600 text-white shadow-sm"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm"
                            }
                          `}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="inline-flex cursor-pointer items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    >
                      Next
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {editingTask && (
        <EditForm
          currentUser={currentUser}
          setEditingTask={setEditingTask}
          handleUpdate={handleUpdate}
          formData={formData}
          setFormData={setFormData}
          users={users}
        />
      )}

      {deletingTask && (
        <DeletePopup setDeletingTask={setDeletingTask} handleDelete={handleDelete} />
      )}
    </>
  );
}