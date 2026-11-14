"use client";

import { useMemo, useState } from "react";

import {
  Search,
  Plus,
  Pencil,
  Power,
  X,
  Loader2,
  Monitor,
  RefreshCw,
} from "lucide-react";

import useBranchContext from "@/features/branches/hooks/use-branch-context";

import useCounters from "@/features/counters/hooks/use-counters";
import useCreateCounter from "@/features/counters/hooks/use-create-counter";
import useUpdateCounter from "@/features/counters/hooks/use-update-counter";
import useToggleCounterStatus from "@/features/counters/hooks/use-toggle-counter-status";

export default function CountersPage() {
  const { selectedBranch, selectedBranchId } = useBranchContext();

  const {
    data: counters = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useCounters(selectedBranchId);

  const createMutation = useCreateCounter(selectedBranchId);
  const updateMutation = useUpdateCounter(selectedBranchId);
  const statusMutation = useToggleCounterStatus(selectedBranchId);

  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingCounter, setEditingCounter] = useState(null);

  const [statusTarget, setStatusTarget] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
  });

  const [formError, setFormError] = useState("");

  const isSaving =
    createMutation.isPending || updateMutation.isPending;

  const filteredCounters = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return counters;

    return counters.filter((counter) => {
      return (
        counter.name?.toLowerCase().includes(keyword) ||
        counter.code?.toLowerCase().includes(keyword)
      );
    });
  }, [counters, search]);

  const activeCount = counters.filter(
    (counter) => counter.isActive
  ).length;

  const inactiveCount = counters.length - activeCount;

  const openCreateForm = () => {
    setEditingCounter(null);

    setFormData({
      name: "",
      code: "",
    });

    setFormError("");
    setFormOpen(true);
  };

  const openEditForm = (counter) => {
    setEditingCounter(counter);

    setFormData({
      name: counter.name || "",
      code: counter.code || "",
    });

    setFormError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingCounter(null);
    setFormError("");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    setFormError("");

    const payload = {
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
    };

    try {
      if (editingCounter) {
        await updateMutation.mutateAsync({
          counterId: editingCounter._id,
          payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }

      closeForm();
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  const handleStatusChange = async () => {
    if (!statusTarget) return;

    try {
      await statusMutation.mutateAsync(statusTarget._id);
      setStatusTarget(null);
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          "Unable to update counter status."
      );

      setStatusTarget(null);
    }
  };

  if (!selectedBranchId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500">
          Please select a branch first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Counter Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage counters for{" "}
            <span className="font-medium text-slate-700">
              {selectedBranch?.name || "Selected Branch"}
            </span>
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          <Plus size={18} />
          Add Counter
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <StatCard
          label="Total Counters"
          value={counters.length}
          icon={<Monitor size={20} />}
        />

        <StatCard
          label="Active Counters"
          value={activeCount}
          icon={<Power size={20} />}
        />

        <StatCard
          label="Inactive Counters"
          value={inactiveCount}
          icon={<Power size={20} />}
        />

      </div>

      {/* Counter List */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

        {/* Table Header */}
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">

          <div>
            <h2 className="font-semibold text-slate-900">
              All Counters
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {filteredCounters.length} counters found
            </p>
          </div>

          <div className="flex items-center gap-2">

            <div className="relative w-full sm:w-64">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search counters..."
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-600"
              />
            </div>

            <button
              onClick={() => refetch()}
              disabled={isLoading}
              title="Refresh counters"
              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={isLoading ? "animate-spin" : ""}
              />
            </button>

          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2
              size={26}
              className="animate-spin text-emerald-600"
            />
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center">

            <p className="text-sm text-red-600">
              {error?.response?.data?.message ||
                "Failed to load counters."}
            </p>

            <button
              onClick={() => refetch()}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              Try Again
            </button>

          </div>
        )}

        {/* Empty */}
        {!isLoading &&
          !isError &&
          counters.length === 0 && (
            <div className="flex min-h-64 flex-col items-center justify-center p-6 text-center">

              <div className="mb-3 rounded-full bg-slate-100 p-4 text-slate-500">
                <Monitor size={25} />
              </div>

              <h3 className="font-medium text-slate-900">
                No counters yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Create your first counter for this branch.
              </p>

              <button
                onClick={openCreateForm}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                <Plus size={17} />
                Add Counter
              </button>

            </div>
          )}

        {/* No Search Results */}
        {!isLoading &&
          !isError &&
          counters.length > 0 &&
          filteredCounters.length === 0 && (
            <div className="flex min-h-48 items-center justify-center text-sm text-slate-500">
              No counters match your search.
            </div>
          )}

        {/* Table */}
        {!isLoading &&
          !isError &&
          filteredCounters.length > 0 && (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[650px] text-left">

                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">
                      Counter
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Counter Code
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredCounters.map((counter) => (
                    <tr
                      key={counter._id}
                      className="transition hover:bg-slate-50"
                    >

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">

                          <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                            <Monitor size={18} />
                          </div>

                          <span className="text-sm font-medium text-slate-900">
                            {counter.name}
                          </span>

                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-medium text-slate-700">
                          {counter.code}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge isActive={counter.isActive} />
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() => openEditForm(counter)}
                            title="Edit counter"
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => setStatusTarget(counter)}
                            title={
                              counter.isActive
                                ? "Deactivate counter"
                                : "Activate counter"
                            }
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                          >
                            <Power size={16} />
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

      </div>

      {/* Create / Edit Dialog */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">

          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

              <div>
                <h2 className="font-semibold text-slate-900">
                  {editingCounter ? "Edit Counter" : "Create Counter"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {editingCounter
                    ? "Update counter information."
                    : "Add a new counter to this branch."}
                </p>
              </div>

              <button
                onClick={closeForm}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={19} />
              </button>

            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5 p-6">

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Counter Name
                </label>

                <input
                  type="text"
                  required
                  minLength={2}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Example: Counter 01"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Counter Code
                </label>

                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={20}
                  pattern="[a-zA-Z0-9-]+"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="Example: CNT-01"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm uppercase outline-none focus:border-emerald-600"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Only letters, numbers and hyphens are allowed.
                </p>
              </div>

              {formError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">

                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving && (
                    <Loader2 size={16} className="animate-spin" />
                  )}

                  {editingCounter ? "Save Changes" : "Create Counter"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* Status Confirmation */}
      {statusTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">

          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">

            <h2 className="font-semibold text-slate-900">
              {statusTarget.isActive
                ? "Deactivate Counter?"
                : "Activate Counter?"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to{" "}
              {statusTarget.isActive ? "deactivate" : "activate"}{" "}
              <span className="font-medium text-slate-700">
                {statusTarget.name}
              </span>
              ?
            </p>

            <div className="mt-6 flex justify-end gap-3">

              <button
                onClick={() => setStatusTarget(null)}
                disabled={statusMutation.isPending}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleStatusChange}
                disabled={statusMutation.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {statusMutation.isPending && (
                  <Loader2 size={15} className="animate-spin" />
                )}

                Confirm
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}


// Statistics Card
function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">

      <div className="flex items-center justify-between">

        <p className="text-sm text-slate-500">
          {label}
        </p>

        <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
          {icon}
        </div>

      </div>

      <p className="mt-3 text-2xl font-semibold text-slate-900">
        {value}
      </p>

    </div>
  );
}


// Status Badge
function StatusBadge({ isActive }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${
        isActive
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? "bg-emerald-600" : "bg-slate-400"
        }`}
      />

      {isActive ? "Active" : "Inactive"}
    </span>
  );
}