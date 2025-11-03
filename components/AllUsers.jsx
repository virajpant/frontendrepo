"use client";
import React, { useEffect, useState } from "react";
import { Users, Mail, Shield, Loader2 } from "lucide-react";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);





  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch("https://backendrepo-9czv.onrender.com/users/all", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch users: ${res.status}`);
      }

      const data = await res.json();
      console.log("Fetched users:", data);
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Users</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:ml-[18%]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">All Users</h1>
          </div>
          <p className="text-gray-600">
            Total users created: <span className="font-semibold">{users.length}</span>
          </p>
        </div>

        {/* Users List */}
        {users.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Users Yet
            </h3>
            <p className="text-gray-500">
              You haven't created any users yet. Create your first user to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <div
                key={user._id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200"
              >
                {/* User Avatar */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-xl font-bold text-indigo-600">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {user.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Shield className="w-3 h-3" />
                      <span className="capitalize">{user.role || "user"}</span>
                    </div>
                  </div>
                </div>

                {/* User Email */}
                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 rounded-md p-3">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm truncate">{user.email}</span>
                </div>

                {/* User ID (for reference) */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    ID: <span className="font-mono">{user._id}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllUsers;
