
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
  Store,
  ChevronRight,
} from "lucide-react";

import { NAVIGATION } from "@/constants/navigation";
import { hasPermission } from "@/constants/permissions";
import useAuth from "@/features/auth/hooks/use-auth";

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
      if (item.roles && !item.roles.includes(user.role)) {
        return false;
      }

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
    <aside className="sticky top-0 flex h-screen w-[260px] shrink-0 flex-col border-r border-slate-200 bg-white">

      {/* Brand */}
      <div className="flex h-[76px] shrink-0 items-center border-b border-slate-100 px-5">
        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/20">
            <Store size={21} strokeWidth={2.2} />
          </div>

          <div>
            <h2 className="text-[15px] font-bold tracking-tight text-slate-900">
              Super Shop
            </h2>

            <p className="mt-0.5 text-[11px] font-medium tracking-wide text-slate-400">
              MANAGEMENT SYSTEM
            </p>
          </div>

        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

        {filteredNavigation.map((group) => (
          <div key={group.title}>

            <h3 className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
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
                    className={`group relative flex items-center justify-between rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >

                    <span className="flex min-w-0 items-center gap-3">

                      {isActive && (
                        <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-emerald-600" />
                      )}

                      {Icon && (
                        <Icon
                          size={18}
                          strokeWidth={isActive ? 2.2 : 1.8}
                          className={`shrink-0 transition-colors ${
                            isActive
                              ? "text-emerald-600"
                              : "text-slate-400 group-hover:text-slate-700"
                          }`}
                        />
                      )}

                      <span className="truncate">
                        {item.label}
                      </span>

                    </span>

                    {isActive && (
                      <ChevronRight
                        size={15}
                        className="shrink-0 text-emerald-600"
                      />
                    )}

                  </Link>
                );
              })}

            </div>
          </div>
        ))}

      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-slate-100 p-4">
        <div className="rounded-lg bg-slate-50 px-3 py-3">

          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-700">
              Super Shop POS
            </p>

            <span className="rounded-md bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">
              v1.0
            </span>
          </div>

          <p className="mt-1 text-[10px] text-slate-400">
            Management System
          </p>

        </div>
      </div>

    </aside>
  );
};

export default Sidebar;
