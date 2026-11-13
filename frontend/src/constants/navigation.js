
import { ROLES } from "@/constants/roles";
import { PERMISSIONS } from "@/constants/permissions";

export const NAVIGATION = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: "LayoutDashboard",
        permission: PERMISSIONS.DASHBOARD_VIEW,
      },
    ],
  },

  {
    title: "Sales",
    items: [
      {
        label: "POS",
        href: "/pos",
        icon: "ShoppingCart",
        permission: PERMISSIONS.POS_ACCESS,
      },
      {
        label: "Sales History",
        href: "/sales",
        icon: "Receipt",
        permission: PERMISSIONS.SALES_VIEW,
      },
    ],
  },

  {
    title: "Products & Inventory",
    items: [
      {
        label: "Products",
        href: "/products",
        icon: "Package",
        permission: PERMISSIONS.PRODUCT_VIEW,
      },
      {
        label: "Inventory",
        href: "/inventory",
        icon: "Boxes",
        permission: PERMISSIONS.INVENTORY_VIEW,
      },
      {
        label: "Purchases",
        href: "/purchases",
        icon: "Truck",
        permission: PERMISSIONS.PURCHASE_VIEW,
      },
    ],
  },

  {
    title: "People",
    items: [
      {
        label: "Customers",
        href: "/customers",
        icon: "Users",
        permission: PERMISSIONS.CUSTOMER_VIEW,
      },
      {
        label: "Suppliers",
        href: "/suppliers",
        icon: "Contact",
        permission: PERMISSIONS.SUPPLIER_VIEW,
      },
    ],
  },

  {
    title: "Reports",
    items: [
      {
        label: "Sales Reports",
        href: "/reports/sales",
        icon: "ChartColumn",
        permission: PERMISSIONS.SALES_REPORT_VIEW,
      },
      {
        label: "Inventory Reports",
        href: "/reports/inventory",
        icon: "ChartPie",
        permission: PERMISSIONS.INVENTORY_REPORT_VIEW,
      },
    ],
  },

  {
    title: "Administration",
    items: [
      {
        label: "Users",
        href: "/users",
        icon: "UserCog",
        permission: PERMISSIONS.USER_VIEW,
      },
      {
        label: "Branches",
        href: "/branches",
        icon: "Building2",
        roles: [ROLES.ADMIN],
      },
      {
        label: "Counters",
        href: "/counters",
        icon: "Monitor",
        roles: [ROLES.ADMIN, ROLES.MANAGER],
      },
      {
        label: "Business Settings",
        href: "/settings",
        icon: "Settings",
        permission: PERMISSIONS.BUSINESS_SETTINGS_VIEW,
      },
    ],
  },
];

