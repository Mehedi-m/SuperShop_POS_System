
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Package,
  Boxes,
  Truck,
  Users,
  Contact,
  ChartColumn,
  ChartPie,
  UserCog,
  Building2,
  Monitor,
  Settings,
} from "lucide-react";

import { NAVIGATION } from "@/constants/navigation";
import { hasPermission } from "@/constants/permissions";
import useAuth from "@/features/auth/hooks/use-auth";

// Map icon names to Lucide components
const ICONS = {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Package,
  Boxes,
  Truck,
  Users,
  Contact,
  ChartColumn,
  ChartPie,
  UserCog,
  Building2,
  Monitor,
  Settings,
};

const Sidebar = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const filteredNavigation = NAVIGATION.map((group) => {
    const filteredItems = group.items.filter((item) => {
      // Check role restriction
      if (item.roles && !item.roles.includes(user.role)) {
        return false;
      }

      // Check permission
      if (
        item.permission &&
        !hasPermission(user.role, item.permission)
      ) {
        return false;
      }

      return true;
    });

    return {
      ...group,
      items: filteredItems,
    };
  }).filter((group) => group.items.length > 0);

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Brand */}
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold text-white">
            S
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">
              Super Shop
            </h2>
            <p className="text-xs text-gray-500">
              Management System
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {filteredNavigation.map((group) => (
          <div key={group.title}>
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              {group.title}
            </h3>

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = ICONS[item.icon];

                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    {Icon && <Icon size={19} />}

                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 px-5 py-4">
        <p className="text-xs text-gray-400">
          Super Shop Management
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Version 1.0.0
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
