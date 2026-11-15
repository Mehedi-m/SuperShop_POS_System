
"use client";

import { useState } from "react";
import { ClipboardList, Users } from "lucide-react";

import useAuth from "@/features/auth/hooks/use-auth";
import PendingApprovals from "./pending-approvals";
import EmployeeManagement from "./employee-management";

export default function UserManagement() {
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";

  const [activeTab, setActiveTab] = useState(
    isAdmin ? "approvals" : "employees"
  );

  const tabs = [
    ...(isAdmin
      ? [{ id: "approvals", label: "Pending Approvals", icon: ClipboardList }]
      : []),
    { id: "employees", label: "Employees", icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          User Management
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage registrations and employee information.
        </p>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon size={17} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "approvals" && isAdmin && (
        <PendingApprovals />
      )}

      {activeTab === "employees" && (
        <EmployeeManagement />
      )}
    </div>
  );
}
