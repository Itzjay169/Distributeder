"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import BuyerLayout from "@/components/buyer/BuyerLayout";
import { User, Lock, Trash2, ShieldCheck, Check } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

export default function BuyerProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const { success, error } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setName(data.user.name || "");
          setEmail(data.user.email || "");
          setPhone(data.user.phone || "");
        }
      })
      .catch(console.error);
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });

      const data = await res.json();
      if (res.ok) {
        success("Profile updated successfully!");
        updateSession({ name });
      } else {
        error(data.error || "Failed to update profile");
      }
    } catch (err) {
      error("Network error");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      error("New passwords do not match.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        error(data.error || "Failed to change password");
      }
    } catch (err) {
      error("Network error");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch("/api/user/profile", { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        success("Your account has been permanently removed.");
        signOut({ callbackUrl: "/" });
      } else {
        error(data.error || "Failed to delete account");
      }
    } catch (err) {
      error("Network error");
    }
  };

  return (
    <BuyerLayout>
      <div className="space-y-8 max-w-3xl">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Account Profile & Security
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Update your corporate procurement contact credentials and password.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <span>Company Representative Information</span>
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Account Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow disabled:opacity-50"
            >
              {isUpdatingProfile ? "Saving..." : "Save Profile Details"}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600" />
            <span>Change Password</span>
          </h2>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Current Password *
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  New Password (min 6 chars) *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow disabled:opacity-50"
            >
              {isUpdatingPassword ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* Danger Zone: Delete Account */}
        <div className="bg-red-50/50 rounded-3xl border border-red-200 p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold text-red-900 uppercase tracking-wider flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-red-600" />
            <span>Danger Zone</span>
          </h2>
          <p className="text-xs text-red-700">
            Deleting your account will permanently remove all your order records, addresses, and wishlist history.
          </p>

          {!deleteConfirmOpen ? (
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition"
            >
              Delete Account
            </button>
          ) : (
            <div className="p-4 bg-white border border-red-300 rounded-2xl space-y-3">
              <div className="text-xs font-bold text-red-900">
                Are you absolutely sure you want to delete this account?
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
                >
                  Yes, Delete My Account
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </BuyerLayout>
  );
}
