"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Users, Search, Ban, CheckCircle, Shield, ShieldAlert } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

export default function AdminUsersPage() {
  const { success, error } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleToggleBan = async (userId: string, currentBanned: boolean) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isBanned: !currentBanned }),
      });

      if (res.ok) {
        success(`User account ${!currentBanned ? "suspended" : "restored"}.`);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isBanned: !currentBanned } : u))
        );
      } else {
        error("Failed to update user status");
      }
    } catch (err) {
      error("Network error");
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (res.ok) {
        success(`User role changed to ${newRole}`);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        error("Failed to change user role");
      }
    } catch (err) {
      error("Network error");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              User Accounts & Role Permissions
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Audit registered entities, grant administrative privileges, and suspend fraudulent actors.
            </p>
          </div>

          <div className="relative min-w-[240px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
          </div>
        </div>

        <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Distributor Store</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-center">Account Status</th>
                  <th className="py-3 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{u.name}</div>
                      <div className="text-[10px] text-slate-500">
                        Joined {new Date(u.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-400 font-mono">{u.email}</td>

                    <td className="py-3 px-4">
                      {u.sellerProfile ? (
                        <span className="text-amber-400 font-semibold">
                          {u.sellerProfile.storeName}
                        </span>
                      ) : (
                        <span className="text-slate-500">Buyer Only</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u.id, e.target.value)}
                        className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-white focus:outline-none"
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isBanned
                            ? "bg-rose-950 text-rose-300 border border-rose-800"
                            : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        }`}
                      >
                        {u.isBanned ? "Suspended" : "Active"}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleBan(u.id, u.isBanned)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ml-auto ${
                          u.isBanned
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-rose-900/60 hover:bg-rose-800 text-rose-300 border border-rose-700/60"
                        }`}
                      >
                        {u.isBanned ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Unban</span>
                          </>
                        ) : (
                          <>
                            <Ban className="w-3.5 h-3.5" />
                            <span>Ban User</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
