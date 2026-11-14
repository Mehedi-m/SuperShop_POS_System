
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import useBranchContext from "@/features/branches/hooks/use-branch-context";
import useAuth from "@/features/auth/hooks/use-auth";

import { ROLES, ROLE_LABELS } from "@/constants/roles";

import {
  ChevronDown,
  Plus,
  Bell,
  UserCircle,
  LogOut,
  Building2,
  Monitor,
  Store,
  Check,
} from "lucide-react";

const Navbar = ({
  pageTitle = "Dashboard",
  onCreateBranch,
  onCreateCounter,
}) => {
  const {
    branches = [],
    selectedBranch,
    selectedBranchId,
    changeBranch,
    isLoading: isBranchesLoading,
    isError: isBranchesError,
  } = useBranchContext();

  const { user, logout } = useAuth();
  const router = useRouter();

  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  if (!user) return null;

  const isAdmin = user.role === ROLES.ADMIN;
  const isManager = user.role === ROLES.MANAGER;

  const canAddNew = isAdmin || isManager;

  const canSwitchBranch = isAdmin && branches.length > 1;

  const closeAllMenus = () => {
    setShowBranchMenu(false);
    setShowAddMenu(false);
    setShowProfileMenu(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleBranchChange = (branchId) => {
    changeBranch(branchId);
    setShowBranchMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 flex h-[76px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm md:px-7">

      {/* Left Section */}
      <div className="flex min-w-0 items-center gap-5">

        {/* Page Title */}
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold tracking-tight text-slate-900">
            {pageTitle}
          </h1>
        </div>

        <div className="hidden h-8 w-px bg-slate-200 lg:block" />

        {/* Branch Selector */}
        <div className="relative hidden sm:block">

          <button
            type="button"
            disabled={
              isBranchesLoading ||
              isBranchesError ||
              !canSwitchBranch
            }
            onClick={() => {
              setShowBranchMenu((prev) => !prev);
              setShowAddMenu(false);
              setShowProfileMenu(false);
            }}
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 transition hover:border-emerald-200 hover:bg-emerald-50/40 disabled:cursor-default"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-emerald-600 shadow-sm">
              <Building2 size={17} />
            </div>

            <div className="min-w-0 text-left">


              <p className="max-w-40 truncate text-xs font-semibold text-slate-700">
                {isBranchesLoading
                  ? "Loading..."
                  : isBranchesError
                    ? "Unable to load branches"
                    : selectedBranch?.name || "No branch assigned"}
              </p>
            </div>

            {canSwitchBranch && (
              <ChevronDown
                size={15}
                className={`text-slate-400 transition-transform ${
                  showBranchMenu ? "rotate-180" : ""
                }`}
              />
            )}
          </button>

          {/* Branch Dropdown */}
          {showBranchMenu && canSwitchBranch && (
            <div className="absolute left-0 z-50 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">

              <div className="border-b border-slate-100 px-3 py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Branch
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Select a branch to manage
                </p>
              </div>

              <div className="max-h-64 overflow-y-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {branches.map((branch) => {
                  const isSelected =
                    branch._id === selectedBranchId;

                  return (
                    <button
                      key={branch._id}
                      type="button"
                      onClick={() =>
                        handleBranchChange(branch._id)
                      }
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition ${
                        isSelected
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <Building2
                          size={16}
                          className={
                            isSelected
                              ? "text-emerald-600"
                              : "text-slate-400"
                          }
                        />

                        <span className="truncate text-sm font-medium">
                          {branch.name}
                        </span>
                      </span>

                      {isSelected && (
                        <Check
                          size={16}
                          className="shrink-0 text-emerald-600"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

            </div>
          )}
        </div>

      </div>

      {/* Right Section */}
      <div className="flex shrink-0 items-center gap-2 md:gap-4">

        {/* Add New */}
        {canAddNew && (
          <div className="relative">

            <button
              type="button"
              onClick={() => {
                setShowAddMenu((prev) => !prev);
                setShowBranchMenu(false);
                setShowProfileMenu(false);
              }}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2.5 text-xs font-semibold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-[0.98] sm:px-4 sm:text-sm"
            >
              <Plus size={17} />

              <span className="hidden sm:inline">
                Add New
              </span>

              <ChevronDown size={15} />
            </button>

            {showAddMenu && (
              <div className="absolute right-0 z-50 mt-2 w-52 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      closeAllMenus();
                      if (onCreateBranch) {
                        onCreateBranch();
                      } else {
                        router.push("/branches?create=true");
                      }
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <Building2 size={17} />
                    Add Branch
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    closeAllMenus();
                    onCreateCounter?.();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <Monitor size={17} />
                  Add Counter
                </button>

              </div>
            )}
          </div>
        )}

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          title="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <Bell size={19} strokeWidth={1.8} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-emerald-600" />
        </button>

        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

        {/* Profile */}
        <div className="relative">

          <button
            type="button"
            onClick={() => {
              setShowProfileMenu((prev) => !prev);
              setShowBranchMenu(false);
              setShowAddMenu(false);
            }}
            className="flex items-center gap-2 rounded-lg p-1.5 transition hover:bg-slate-50 sm:gap-3 sm:px-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-700">
              <UserCircle size={22} />
            </div>

            <div className="hidden text-left sm:block">
              <p className="max-w-28 truncate text-xs font-semibold text-slate-800">
                {user.name}
              </p>

              <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                {ROLE_LABELS[user.role] || user.role}
              </p>
            </div>

            <ChevronDown
              size={15}
              className="hidden text-slate-400 sm:block"
            />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 z-50 mt-2 w-52 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">

              <div className="border-b border-slate-100 px-3 py-3">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {user.name}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {ROLE_LABELS[user.role] || user.role}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
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
