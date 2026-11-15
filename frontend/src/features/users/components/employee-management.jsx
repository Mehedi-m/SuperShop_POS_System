"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Search,
  Users,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  UserRound,
  Building2,
  Monitor,
} from "lucide-react";

import useAuth from "@/features/auth/hooks/use-auth";
import useEmployees from "@/features/users/hooks/use-employees";

import { ROLE_LABELS } from "@/constants/roles";

const PAGE_LIMIT = 10;

const getRoleLabel = (role) => {
  return ROLE_LABELS[role] || "Unknown";
};

const getEmployeeBranch = (employee) => {
  return (
    employee.assignedBranch ||
    employee.assignedCounter?.branch ||
    null
  );
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Unable to load employees."
  );
};

const EmployeeManagement = () => {
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("approved");
  const [isActive, setIsActive] = useState("all");

  const [page, setPage] = useState(1);

  // Debounce search to avoid unnecessary API requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // Build API query parameters
  const queryParams = useMemo(() => {
    const params = {
      page,
      limit: PAGE_LIMIT,
    };

    if (debouncedSearch) {
      params.search = debouncedSearch;
    }

    if (role !== "all") {
      params.role = role;
    }

    if (isAdmin) {
      params.status = status;
    }

    if (isActive !== "all") {
      params.isActive = isActive;
    }

    return params;
  }, [
    page,
    debouncedSearch,
    role,
    status,
    isActive,
    isAdmin,
  ]);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useEmployees(queryParams);

  const employees = data?.employees || [];
  const pagination = data?.pagination || {};

  const totalEmployees = pagination.totalEmployees || 0;
  const totalPages = pagination.totalPages || 1;

  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setRole("all");
    setStatus("approved");
    setIsActive("all");
    setPage(1);
  };

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Users size={20} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Employee Management
              </h1>

              <p className="mt-0.5 text-sm text-slate-500">
                Manage your organization's employees.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            className={isFetching ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {isAdmin ? "Total Employees" : "Branch Employees"}
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {isLoading ? "—" : totalEmployees}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Users size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Current Page
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {isLoading
                  ? "—"
                  : `${pagination.currentPage || 1} / ${totalPages}`}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <UserRound size={21} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

          {/* Search */}
          <div className="relative min-w-0 flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, phone or email..."
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
            />
          </div>

          {/* Role Filter */}
          <select
            value={role}
            onChange={(event) =>
              handleFilterChange(setRole, event.target.value)
            }
            className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-600"
          >
            <option value="all">All roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Branch Manager</option>
            <option value="inventory_manager">Inventory Manager</option>
            <option value="cashier">Cashier</option>
          </select>

          {/* Admin-only status filter */}
          {isAdmin && (
            <select
              value={status}
              onChange={(event) =>
                handleFilterChange(setStatus, event.target.value)
              }
              className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-600"
            >
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="all">All statuses</option>
            </select>
          )}

          {/* Active Filter */}
          <select
            value={isActive}
            onChange={(event) =>
              handleFilterChange(setIsActive, event.target.value)
            }
            className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-600"
          >
            <option value="all">All activity</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <button
            type="button"
            onClick={handleResetFilters}
            className="h-11 shrink-0 rounded-lg px-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            Reset
          </button>
        </div>
      </section>

      {/* Employee Table */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Employees
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {totalEmployees} employees found
            </p>
          </div>

          {isFetching && (
            <span className="text-xs font-medium text-emerald-700">
              Updating...
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="text-center">
              <RefreshCw
                size={24}
                className="mx-auto animate-spin text-emerald-600"
              />

              <p className="mt-3 text-sm text-slate-500">
                Loading employees...
              </p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
            <p className="text-sm font-semibold text-slate-800">
              Failed to load employees
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {getErrorMessage(error)}
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Try again
            </button>
          </div>
        ) : employees.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <Users size={22} />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-800">
              No employees found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">

              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Employee
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Role
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Branch
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Counter
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Joined
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {employees.map((employee) => {
                  const branch = getEmployeeBranch(employee);

                  return (
                    <tr
                      key={employee._id}
                      className="transition hover:bg-slate-50/70"
                    >
                      {/* Employee */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-700">
                            {employee.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {employee.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {employee.phone}
                            </p>

                            {employee.email && (
                              <p className="mt-0.5 max-w-48 truncate text-xs text-slate-400">
                                {employee.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-slate-700">
                          {getRoleLabel(employee.role)}
                        </span>
                      </td>

                      {/* Branch */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Building2
                            size={15}
                            className="shrink-0 text-slate-400"
                          />

                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {branch?.name || "Not assigned"}
                            </p>

                            {branch?.code && (
                              <p className="mt-0.5 text-xs text-slate-400">
                                {branch.code}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Counter */}
                      <td className="px-5 py-4">
                        {employee.assignedCounter ? (
                          <div className="flex items-center gap-2">
                            <Monitor
                              size={15}
                              className="shrink-0 text-slate-400"
                            />

                            <div>
                              <p className="text-sm font-medium text-slate-700">
                                {employee.assignedCounter.name}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-400">
                                {employee.assignedCounter.code}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">
                            —
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col items-start gap-1.5">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              employee.accountStatus === "approved"
                                ? "bg-emerald-50 text-emerald-700"
                                : employee.accountStatus === "pending"
                                  ? "bg-slate-100 text-slate-600"
                                  : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {employee.accountStatus}
                          </span>

                          <span
                            className={`text-xs font-medium ${
                              employee.isActive
                                ? "text-emerald-700"
                                : "text-slate-400"
                            }`}
                          >
                            {employee.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {formatDate(employee.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !isError && employees.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {(page - 1) * PAGE_LIMIT + 1}
              </span>
              {" "}to{" "}
              <span className="font-semibold text-slate-700">
                {Math.min(page * PAGE_LIMIT, totalEmployees)}
              </span>
              {" "}of{" "}
              <span className="font-semibold text-slate-700">
                {totalEmployees}
              </span>
              {" "}employees
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || isFetching}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <span className="min-w-16 text-center text-sm font-semibold text-slate-700">
                {page} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.min(totalPages, current + 1)
                  )
                }
                disabled={page >= totalPages || isFetching}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default EmployeeManagement;