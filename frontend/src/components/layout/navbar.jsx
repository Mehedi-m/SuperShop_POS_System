
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  ChevronDown,
  Plus,
  Bell,
  UserCircle,
  LogOut,
  Building2,
  Monitor,
} from "lucide-react";

import { ROLES, ROLE_LABELS } from "@/constants/roles";
import useAuth from "@/features/auth/hooks/use-auth";

const Navbar = ({
  pageTitle = "Dashboard",
  branches = [],
  selectedBranchId = "",
  onBranchChange,
  onCreateBranch,
  onCreateCounter,
}) => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  if (!user) return null;

  const isAdmin = user.role === ROLES.ADMIN;
  const isManager = user.role === ROLES.MANAGER;

  const canAddNew = isAdmin || isManager;

  const selectedBranch = branches.find(
    (branch) => branch._id === selectedBranchId
  );

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">

      {/* Left Section */}
      <div className="flex items-center gap-6">
        <h1 className="text-lg font-semibold text-slate-800">
          {pageTitle}
        </h1>

        {/* Branch Selector */}
        <div className="flex items-center gap-2">
          <Building2 size={18} className="text-slate-500" />

          {isAdmin && branches.length > 1 ? (
            <select
              value={selectedBranchId}
              onChange={(e) =>
                onBranchChange?.(e.target.value)
              }
              className="max-w-48 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-600"
            >
              {branches.map((branch) => (
                <option key={branch._id} value={branch._id}>
                  {branch.name}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-sm font-medium text-slate-700">
              {selectedBranch?.name || "Assigned Branch"}
            </span>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">

        {/* Add New */}
        {canAddNew && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAddMenu((prev) => !prev)}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus size={17} />
              Add New
              <ChevronDown size={16} />
            </button>

            {showAddMenu && (
              <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddMenu(false);
                      onCreateBranch?.();
                    }}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    <Building2 size={17} />
                    Add Branch
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowAddMenu(false);
                    onCreateCounter?.();
                  }}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                >
                  <Monitor size={17} />
                  Add Counter
                </button>

              </div>
            )}
          </div>
        )}

        {/* Notifications - UI placeholder */}
        <div
          className="flex h-9 w-9 items-center justify-center rounded-md text-slate-600"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={19} />
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setShowProfileMenu((prev) => !prev)
            }
            className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-100"
          >
            <UserCircle size={25} className="text-slate-600" />

            <div className="text-left">
              <p className="text-sm font-medium text-slate-800">
                {user.name}
              </p>

              <p className="text-xs text-slate-500">
                {ROLE_LABELS[user.role] || user.role}
              </p>
            </div>

            <ChevronDown size={15} className="text-slate-500" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
