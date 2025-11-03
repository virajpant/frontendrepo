"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Home, CheckSquare, LogOut, X, UserRoundPlus, Users } from "lucide-react";
import Link from "next/link";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const [windowWidth, setWindowWidth] = useState(0);
  const [userRole, setUserRole] = useState(null);
  const router = useRouter();

  // Fetch role from localStorage
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);

    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("https://backendrepo-9czv.onrender.com/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userRole");
        router.push("/login");
      } else {
        const errText = await res.text();
        console.error("Logout failed:", errText);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Menu items (Create Users = admin only)
  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
    { href: "/tasks", label: "Tasks", icon: <CheckSquare className="w-5 h-5" /> },
  ];

  // Only add "Create Users" if admin
  if (userRole === "admin") {
    menuItems.push({
      href: "/create-user",
      label: "Create Users",
      icon: <UserRoundPlus className="w-5 h-5" />,
    });
  }
  if (userRole === "admin") {
    menuItems.push({
      href: "/all-users",
      label: "All Users",
      icon: <Users className="w-5 h-5" />,
    });
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && windowWidth < 1024 && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-[4px_0_50px_rgba(0,0,0,0.03)] transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
        w-[75vw] sm:w-[50vw] md:w-[35vw] lg:w-[18vw] hidden lg:flex flex-col`}
      >
        {/* Header */}
        <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">T</span>
            </div>
            <h2 className="text-lg font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              TaskFlow
            </h2>
          </div>
          <button
            onClick={toggleSidebar}
            className="lg:hidden w-9 h-9 rounded-xl cursor-pointer hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex-grow">
          <h3 className="text-xs font-medium uppercase text-slate-400 mb-3">
            Menu
          </h3>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-4 py-3 mb-1 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-slate-800 transition-all group"
              onClick={() => window.innerWidth < 1024 && toggleSidebar()}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center group-hover:bg-white/60 transition-colors">
                  {item.icon}
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-6 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center justify-between cursor-pointer w-full px-4 py-3 rounded-xl hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center group-hover:bg-white/50 transition-colors">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Logout</span>
            </div>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_20px_rgba(0,0,0,0.05)] flex justify-around items-center py-2 border-t border-slate-200 z-50">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center text-slate-600 hover:text-indigo-600 transition-all"
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center cursor-pointer text-slate-600 hover:text-rose-600 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-xs mt-1">Logout</span>
        </button>
      </nav>
    </>
  );
}