"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Login from "./login/page";

export default function page() {
  const router = useRouter();



  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 text-gray-800 px-4">
      {/* <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-semibold mb-4">Access Restricted</h1>
        <p className="text-gray-600 mb-6">
          You need to log in to access this page. Please sign in to continue.
        </p>

        <button
          onClick={() => router.push("/login")}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl shadow-md hover:bg-blue-700 transition-all duration-200"
        >
          Go to Login
        </button>
      </div> */}
      <Login />
    </div>
  );
}
