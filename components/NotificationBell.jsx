"use client";
import { useEffect, useState, useRef } from "react";
import { Bell, X } from "lucide-react";
import { io } from "socket.io-client";

export default function NotificationBell({ onNewTask }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const socketRef = useRef(null);
  const dropdownRef = useRef(null);

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedId = localStorage.getItem("userId");
    if (storedId) setUserId(storedId);
  }, []);

  useEffect(() => {
    if (!userId) return;

    socketRef.current = io("https://backendrepo-9czv.onrender.com", {
      query: { userId },
      transports: ["websocket"],
      withCredentials: true,
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to notification server as", userId);
    });

    socketRef.current.on("task:assigned", (data) => {
      console.log("📩 Notification received:", data);
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((c) => c + 1);

      const audio = new Audio("/notification.wav");
      audio.play().catch(() => {});
      if (onNewTask) onNewTask();
    });

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from notification server");
    });

    return () => socketRef.current?.disconnect();
  }, [userId, onNewTask]);

  const markAsRead = () => {
    setUnreadCount(0);
    setIsOpen(true);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={markAsRead}
        className="relative p-2 rounded-full cursor-pointer hover:bg-gray-100 transition-all duration-200 group"
        title="Notifications"
      >
        <Bell className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <h3 className="font-bold text-lg">Notifications</h3>
            <button
              onClick={clearAll}
              className="text-white hover:bg-white/20 cursor-pointer p-1 rounded transition-colors"
              title="Clear all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif, i) => (
                <div
                  key={i}
                  className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-default"
                >
                  <p className="font-medium text-sm text-gray-800">
                    {notif.message}
                  </p>
                  {notif.task && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-blue-600 font-medium">
                        Task: {notif.task.title}
                      </p>
                      {notif.task.description && (
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {notif.task.description}
                        </p>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(notif.timestamp).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-gray-50 text-center">
            <button
              onClick={() => setIsOpen(false)}
              className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
