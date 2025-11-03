"use client";
import { useEffect, useState } from "react";
import { isPast } from "date-fns";
import OverdueTaskItem from "@/components/OverdueTaskItem";
import StatCard from "@/components/StatCard";
import TaskSection from "@/components/TaskSection";
import { useRouter } from "next/navigation";

export default function page() {
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [createdTasks, setCreatedTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      router.push("/login");
    } else {
      setUserId(storedUserId);
    }
  }, [router]);

  useEffect(() => {
    if (!userId) return;

    const fetchTasks = async () => {
      setLoading(true);
      try {
        const res = await fetch("https://backendrepo-9czv.onrender.com/tasks", {
          credentials: "include",
        });
        const tasks = await res.json();

        const assigned = tasks.filter(t => t.assignedTo?._id === userId);
        const created = tasks.filter(t => t.createdBy?._id === userId);
        const overdue = tasks.filter(
          t => t.dueDate && isPast(new Date(t.dueDate)) && t.status !== "completed"
        );

        setAssignedTasks(assigned);
        setCreatedTasks(created);
        setOverdueTasks(overdue);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [userId]);

  if (!userId) {
    return (
      <div className="p-6 text-center text-gray-600">
        Please log in to view your dashboard.
      </div>
    );
  }

  return (
    <div className="flex justify-end min-h-screen bg-gray-50">
      <div className="w-full md:w-[75%] lg:w-[80%] xl:w-[82%] p-6 space-y-8">
       
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
          <StatCard
            title="Assigned Tasks"
            count={assignedTasks.length}
            trend="+12% from last week"
          />
          <StatCard
            title="Created Tasks"
            count={createdTasks.length}
            trend="+5% from last week"
          />
          <StatCard
            title="Overdue Tasks"
            count={overdueTasks.length}
            trend="-3% from last week"
            isNegative
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <TaskSection title="Assigned to You" tasks={assignedTasks} loading={loading} />
          <TaskSection title="Created by You" tasks={createdTasks} loading={loading} />
        </div>

        {overdueTasks.length > 0 && (
          <div className="mt-12 p-6 rounded-xl bg-white">
            <h2 className="text-xl font-medium text-slate-800 mb-6">
              Tasks Requiring Attention
            </h2>
            <div className="space-y-4">
              {overdueTasks.map(task => (
                <OverdueTaskItem key={task._id} task={task} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
