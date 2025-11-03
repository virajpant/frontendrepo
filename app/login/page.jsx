"use client";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
  const res = await fetch('https://backendrepo-9czv.onrender.com/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
  credentials: 'include', 
});


      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      if (data.user && data.user._id) {
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("userRole", data.user.role);

        console.log("✅ Login success:", data.user);

        window.location.href = "/dashboard";
      } else {
        console.error("❌ Missing user info in response:", data);
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-md rounded-lg p-6 w-full max-w-sm"
      >
        <h1 className="text-xl font-semibold text-center mb-6">Login</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded-md"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded-md"
        />
        <button
          type="submit"
          className="w-full bg-indigo-600 cursor-pointer text-white py-2 rounded-md hover:bg-indigo-700"
        >
          Login
        </button>

           {/* <p
          onClick={() => router.push("/register")}
          className="text-sm text-center mt-3 text-blue-600 cursor-pointer hover:underline"
        >
          Don't have an account? Register
        </p> */}
      </form>
    </div>
  );
}

