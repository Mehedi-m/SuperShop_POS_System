"use client";

import { useMemo, useState } from "react";

import {
  Search,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  UserCheck,
  Loader2,
  X,
  Building2,
  Monitor,
  ShieldCheck,
  Phone,
  Mail,
} from "lucide-react";

import {
  usePendingUsers,
  useAllBranches,
  useBranchCounters,
  useApproveUser,
  useRejectUser,
} from "@/features/users/hooks/use-user-management";

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Branch Manager" },
  {
    value: "inventory_manager",
    label: "Inventory Manager",
  },
  { value: "cashier", label: "Cashier" },
];

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Something went wrong. Please try again.";

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function UsersPage() {
  const [search, setSearch] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);

  const [role, setRole] = useState("");
  const [branchId, setBranchId] = useState("");
  const [counterId, setCounterId] = useState("");

  const [notice, setNotice] = useState("");
  const [pageError, setPageError] = useState("");

  const {
    data: pendingUsers = [],
    isLoading: usersLoading,
    isError: usersError,
    refetch: refetchUsers,
  } = usePendingUsers();

  const {
    data: branches = [],
    isLoading: branchesLoading,
  } = useAllBranches();

  const {
    data: counters = [],
    isLoading: countersLoading,
  } = useBranchCounters(
    role === "cashier" ? branchId : null
  );

  const approveMutation = useApproveUser();
  const rejectMutation = useRejectUser();

  const filteredUsers = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) return pendingUsers;

    return pendingUsers.filter((user) => {
      return (
        user.name?.toLowerCase().includes(searchValue) ||
        user.phone?.includes(searchValue) ||
        user.email?.toLowerCase().includes(searchValue)
      );
    });
  }, [pendingUsers, search]);

  const availableBranches = useMemo(() => {
    return branches.filter((branch) => {
      if (!branch.isActive) return false;

      if (role === "manager") {
        return !branch.manager;
      }

      if (role === "inventory_manager") {
        return !branch.inventoryManager;
      }

      return true;
    });
  }, [branches, role]);

  const availableCounters = useMemo(() => {
    return counters.filter(
      (counter) =>
        counter.isActive && !counter.cashier
    );
  }, [counters]);

  const openApprovalModal = (user) => {
    setSelectedUser(user);
    setRole("");
    setBranchId("");
    setCounterId("");
    setPageError("");
    setNotice("");
  };

  const closeApprovalModal = () => {
    if (approveMutation.isPending) return;

    setSelectedUser(null);
    setRole("");
    setBranchId("");
    setCounterId("");
    setPageError("");
  };

  const handleRoleChange = (value) => {
    setRole(value);
    setBranchId("");
    setCounterId("");
    setPageError("");
  };

  const handleBranchChange = (value) => {
    setBranchId(value);
    setCounterId("");
    setPageError("");
  };

  const handleApprove = async (event) => {
    event.preventDefault();

    setPageError("");
    setNotice("");

    if (!selectedUser || !role) {
      setPageError("Please select a role.");
      return;
    }

    if (
      ["manager", "inventory_manager", "cashier"].includes(
        role
      ) &&
      !branchId
    ) {
      setPageError("Please select a branch.");
      return;
    }

    if (role === "cashier" && !counterId) {
      setPageError("Please select a counter.");
      return;
    }

    try {
      await approveMutation.mutateAsync({
        userId: selectedUser._id,
        role,
        branchId: role === "admin" ? undefined : branchId,
        counterId: role === "cashier" ? counterId : undefined,
      });

      setNotice(
        `${selectedUser.name} has been approved successfully.`
      );

      setSelectedUser(null);
      setRole("");
      setBranchId("");
      setCounterId("");
    } catch (error) {
      setPageError(getErrorMessage(error));
    }
  };

  const handleReject = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to reject ${user.name}'s registration?`
    );

    if (!confirmed) return;

    setPageError("");
    setNotice("");

    try {
      await rejectMutation.mutateAsync(user._id);

      setNotice(
        `${user.name}'s registration has been rejected.`
      );
    } catch (error) {
      setPageError(getErrorMessage(error));
    }
  };

  const isBranchRole = [
    "manager",
    "inventory_manager",
    "cashier",
  ].includes(role);

  const canApprove =
    Boolean(role) &&
    (!isBranchRole || Boolean(branchId)) &&
    (role !== "cashier" || Boolean(counterId));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            User Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review registrations and manage staff access.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetchUsers()}
          disabled={usersLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Loader2
            size={16}
            className={usersLoading ? "animate-spin" : "hidden"}
          />
          Refresh
        </button>
      </div>

      {/* Success Message */}
      {notice && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 size={18} />
          <span>{notice}</span>

          <button
            type="button"
            onClick={() => setNotice("")}
            className="ml-auto"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Page Error */}
      {pageError && !selectedUser && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {pageError}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Pending Applications
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                {pendingUsers.length}
              </h2>
            </div>

            <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
              <Clock size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Matching Results
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                {filteredUsers.length}
              </h2>
            </div>

            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
              <Users size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Users */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Pending Registrations
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Users waiting for admin approval
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search name, phone or email..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        {usersLoading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2
              size={28}
              className="animate-spin text-emerald-600"
            />
          </div>
        ) : usersError ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
            <XCircle size={32} className="text-red-500" />

            <p className="mt-3 font-medium text-slate-800">
              Failed to load pending users
            </p>

            <button
              type="button"
              onClick={() => refetchUsers()}
              className="mt-3 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Try again
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
            <div className="rounded-full bg-slate-100 p-4 text-slate-400">
              <Users size={28} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-800">
              {search
                ? "No matching users found"
                : "No pending registrations"}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {search
                ? "Try searching with another name or phone number."
                : "New user registrations will appear here."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">
                      User
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Contact
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Registered
                    </th>

                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-700">
                            {user.name?.charAt(0)?.toUpperCase()}
                          </div>

                          <div>
                            <p className="font-medium text-slate-900">
                              {user.name}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              Pending approval
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-700">
                          {user.phone}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {user.email || "No email"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(user.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openApprovalModal(user)
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                          >
                            <UserCheck size={15} />
                            Review
                          </button>

                          <button
                            type="button"
                            onClick={() => handleReject(user)}
                            disabled={rejectMutation.isPending}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          >
                            <XCircle size={15} />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="divide-y divide-slate-100 md:hidden">
              {filteredUsers.map((user) => (
                <div key={user._id} className="space-y-4 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 font-semibold text-emerald-700">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        {user.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        Registered {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <p className="flex items-center gap-2">
                      <Phone size={15} />
                      {user.phone}
                    </p>

                    <p className="flex items-center gap-2">
                      <Mail size={15} />
                      {user.email || "No email provided"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openApprovalModal(user)}
                      className="flex-1 rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      Review
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReject(user)}
                      disabled={rejectMutation.isPending}
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Approval Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeApprovalModal();
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Approve User
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Assign a role and access location.
                </p>
              </div>

              <button
                type="button"
                onClick={closeApprovalModal}
                disabled={approveMutation.isPending}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleApprove} className="space-y-5 p-5">
              {/* User Information */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
                    {selectedUser.name
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </div>

                  <div>
                    <p className="font-semibold text-slate-900">
                      {selectedUser.name}
                    </p>

                    <p className="text-sm text-slate-500">
                      {selectedUser.phone}
                    </p>
                  </div>
                </div>

                {selectedUser.email && (
                  <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                    <Mail size={15} />
                    {selectedUser.email}
                  </p>
                )}
              </div>

              {/* Role */}
              <div>
                <label
                  htmlFor="user-role"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Assign Role
                </label>

                <select
                  id="user-role"
                  value={role}
                  onChange={(event) =>
                    handleRoleChange(event.target.value)
                  }
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="">Select a role</option>

                  {roleOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Branch Selection */}
              {isBranchRole && (
                <div>
                  <label
                    htmlFor="user-branch"
                    className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
                  >
                    <Building2 size={16} />
                    Select Branch
                  </label>

                  <select
                    id="user-branch"
                    value={branchId}
                    onChange={(event) =>
                      handleBranchChange(event.target.value)
                    }
                    required
                    disabled={branchesLoading}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
                  >
                    <option value="">
                      {branchesLoading
                        ? "Loading branches..."
                        : "Select a branch"}
                    </option>

                    {availableBranches.map((branch) => (
                      <option
                        key={branch._id}
                        value={branch._id}
                      >
                        {branch.name} ({branch.code})
                      </option>
                    ))}
                  </select>

                  {!branchesLoading &&
                    availableBranches.length === 0 && (
                      <p className="mt-2 text-xs text-amber-600">
                        No available branch found for this role.
                      </p>
                    )}
                </div>
              )}

              {/* Counter Selection */}
              {role === "cashier" && branchId && (
                <div>
                  <label
                    htmlFor="user-counter"
                    className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
                  >
                    <Monitor size={16} />
                    Select Counter
                  </label>

                  <select
                    id="user-counter"
                    value={counterId}
                    onChange={(event) =>
                      setCounterId(event.target.value)
                    }
                    required
                    disabled={countersLoading}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
                  >
                    <option value="">
                      {countersLoading
                        ? "Loading counters..."
                        : "Select a counter"}
                    </option>

                    {availableCounters.map((counter) => (
                      <option
                        key={counter._id}
                        value={counter._id}
                      >
                        {counter.name} ({counter.code})
                      </option>
                    ))}
                  </select>

                  {!countersLoading &&
                    availableCounters.length === 0 && (
                      <p className="mt-2 text-xs text-amber-600">
                        No available counter found in this branch.
                      </p>
                    )}
                </div>
              )}

              {/* Assignment Information */}
              {role === "admin" && (
                <div className="flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <ShieldCheck
                    size={19}
                    className="shrink-0 text-emerald-700"
                  />

                  <p className="text-sm text-emerald-800">
                    Admin will have access to all branches and
                    counters. No assignment is required.
                  </p>
                </div>
              )}

              {role === "manager" && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  The Manager will manage the selected branch.
                </div>
              )}

              {role === "inventory_manager" && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  The Inventory Manager will manage inventory
                  for the selected branch.
                </div>
              )}

              {role === "cashier" && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  The Cashier will be assigned to one counter
                  in the selected branch.
                </div>
              )}

              {/* Error */}
              {(pageError || approveMutation.isError) && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
                  {pageError ||
                    getErrorMessage(approveMutation.error)}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeApprovalModal}
                  disabled={approveMutation.isPending}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    !canApprove ||
                    approveMutation.isPending ||
                    (role === "cashier" &&
                      countersLoading) ||
                    (isBranchRole && branchesLoading)
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {approveMutation.isPending ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Approve User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}