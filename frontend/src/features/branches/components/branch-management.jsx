"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  Search,
  Pencil,
  Power,
  X,
  MapPin,
  Phone,
  RefreshCw,
} from "lucide-react";

import useAuth from "@/features/auth/hooks/use-auth";
import useAdminBranches from "@/features/branches/hooks/use-admin-branches";
import useBranchMutations from "@/features/branches/hooks/use-branch-mutations";

const EMPTY_FORM = {
  name: "",
  code: "",
  address: "",
  phone: "",
};

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Something went wrong. Please try again.";

const BranchManagement = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const {
    data: branches = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminBranches();

  const {
    createBranch,
    updateBranch,
    toggleBranchStatus,
    isCreating,
    isUpdating,
    isTogglingStatus,
  } = useBranchMutations();

  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [statusTarget, setStatusTarget] = useState(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      openCreateDialog();
      router.replace("/branches", { scroll: false });
    }
    // This effect intentionally responds only to the URL query on mount/change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const filteredBranches = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return branches;

    return branches.filter((branch) =>
      [branch.name, branch.code, branch.address, branch.phone]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [branches, search]);

  function openCreateDialog() {
    setEditingBranch(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setIsDialogOpen(true);
  }

  function openEditDialog(branch) {
    setEditingBranch(branch);
    setForm({
      name: branch.name || "",
      code: branch.code || "",
      address: branch.address || "",
      phone: branch.phone || "",
    });
    setFormError("");
    setIsDialogOpen(true);
  }

  function closeDialog() {
    if (isCreating || isUpdating) return;
    setIsDialogOpen(false);
    setEditingBranch(null);
    setForm(EMPTY_FORM);
    setFormError("");
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      address: form.address.trim(),
      phone: form.phone.trim(),
    };

    if (payload.name.length < 2) {
      setFormError("Branch name must contain at least 2 characters.");
      return;
    }
    if (!/^[A-Z0-9-]{2,20}$/.test(payload.code)) {
      setFormError("Use 2–20 letters, numbers or hyphens for the branch code.");
      return;
    }
    if (payload.address.length < 5) {
      setFormError("Please enter a valid branch address.");
      return;
    }
    if (!/^01[3-9]\d{8}$/.test(payload.phone)) {
      setFormError("Enter a valid Bangladesh phone number (e.g. 017XXXXXXXX).");
      return;
    }

    try {
      if (editingBranch) {
        await updateBranch({
          branchId: editingBranch._id,
          payload,
        });
      } else {
        await createBranch(payload);
      }
      setIsDialogOpen(false);
      setEditingBranch(null);
      setForm(EMPTY_FORM);
    } catch (submitError) {
      setFormError(getErrorMessage(submitError));
    }
  };

  const handleStatusChange = async () => {
    if (!statusTarget) return;
    setActionError("");

    try {
      await toggleBranchStatus(statusTarget._id);
      setStatusTarget(null);
    } catch (statusError) {
      setActionError(getErrorMessage(statusError));
      setStatusTarget(null);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <h2 className="text-base font-semibold text-slate-900">Access restricted</h2>
        <p className="mt-1 text-sm text-slate-500">
          Only an administrator can manage branches.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
            <Building2 size={17} />
            Administration
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            Branch Management
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Create, update and manage your business branches.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateDialog}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <Plus size={17} />
          Add Branch
        </button>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Total branches</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{branches.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Active branches</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {branches.filter((branch) => branch.isActive).length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Inactive branches</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {branches.filter((branch) => !branch.isActive).length}
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h3 className="font-semibold text-slate-900">All branches</h3>
            <p className="mt-1 text-xs text-slate-500">
              {filteredBranches.length} {filteredBranches.length === 1 ? "branch" : "branches"} found
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1 sm:w-72 sm:flex-none">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search branches..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
              />
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoading}
              aria-label="Refresh branches"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {actionError && (
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-700">
            {actionError}
          </div>
        )}

        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-500">Loading branches...</div>
        ) : isError ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-slate-800">Unable to load branches</p>
            <p className="mt-1 text-sm text-slate-500">{getErrorMessage(error)}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Try again
            </button>
          </div>
        ) : filteredBranches.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <Building2 size={22} />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              {search ? "No matching branches" : "No branches created yet"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {search ? "Try another branch name or code." : "Create your first branch to get started."}
            </p>
            {!search && (
              <button
                type="button"
                onClick={openCreateDialog}
                className="mt-4 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Add your first branch
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Branch</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Manager</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBranches.map((branch) => (
                  <tr key={branch._id} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                          <Building2 size={17} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-slate-900">{branch.name}</p>
                            {branch.isMain && (
                              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                Main
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs font-medium text-slate-500">{branch.code}</p>
                          <p className="mt-1 flex max-w-sm items-center gap-1 text-xs text-slate-500">
                            <MapPin size={12} className="shrink-0" />
                            <span className="truncate">{branch.address}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                        <Phone size={13} className="text-slate-400" />
                        {branch.phone}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {branch.manager?.name || "Not assigned"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${branch.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {branch.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditDialog(branch)}
                          title="Edit branch"
                          aria-label={`Edit ${branch.name}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatusTarget(branch)}
                          disabled={isTogglingStatus}
                          title={branch.isActive ? "Deactivate branch" : "Activate branch"}
                          aria-label={`${branch.isActive ? "Deactivate" : "Activate"} ${branch.name}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40"
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
      </section>

      {isDialogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4">
          <div className="my-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {editingBranch ? "Edit branch" : "Create branch"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {editingBranch ? "Update the branch information below." : "Enter the details for your new branch."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                disabled={isCreating || isUpdating}
                aria-label="Close dialog"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Branch name <span className="text-emerald-700">*</span></span>
                  <input name="name" value={form.name} onChange={handleFormChange} required minLength={2} maxLength={80} placeholder="e.g. Dhanmondi Branch" className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Branch code <span className="text-emerald-700">*</span></span>
                  <input name="code" value={form.code} onChange={handleFormChange} required minLength={2} maxLength={20} placeholder="e.g. DHK-01" className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm uppercase text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Phone number <span className="text-emerald-700">*</span></span>
                  <input name="phone" type="tel" value={form.phone} onChange={handleFormChange} required inputMode="numeric" placeholder="017XXXXXXXX" className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Address <span className="text-emerald-700">*</span></span>
                  <textarea name="address" value={form.address} onChange={handleFormChange} required minLength={5} rows={3} placeholder="Full branch address" className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10" />
                </label>
              </div>

              {formError && (
                <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">{formError}</p>
              )}

              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeDialog} disabled={isCreating || isUpdating} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isCreating || isUpdating} className="h-10 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">
                  {isCreating || isUpdating ? "Saving..." : editingBranch ? "Save changes" : "Create branch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {statusTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              {statusTarget.isActive ? "Deactivate branch?" : "Activate branch?"}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {statusTarget.isActive
                ? `“${statusTarget.name}” will no longer be available for branch operations.`
                : `“${statusTarget.name}” will become available for branch operations again.`}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setStatusTarget(null)} disabled={isTogglingStatus} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={handleStatusChange} disabled={isTogglingStatus} className="h-10 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
                {isTogglingStatus ? "Updating..." : statusTarget.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchManagement;
