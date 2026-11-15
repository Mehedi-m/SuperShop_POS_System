
"use client";

import {
  Wallet,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  CalendarDays,
  Receipt,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";

// Dummy Statistics
const stats = [
  {
    title: "Today's Sales",
    value: "৳ 45,850",
    change: "+12.5%",
    positive: true,
    icon: Wallet,
  },
  {
    title: "Total Orders",
    value: "248",
    change: "+8.2%",
    positive: true,
    icon: ShoppingCart,
  },
  {
    title: "Total Products",
    value: "1,240",
    change: "+4.3%",
    positive: true,
    icon: Package,
  },
  {
    title: "Total Customers",
    value: "856",
    change: "-2.4%",
    positive: false,
    icon: Users,
  },
];

// Last 7 Days Sales
const salesData = [
  { day: "Mon", sales: 12500 },
  { day: "Tue", sales: 18500 },
  { day: "Wed", sales: 15000 },
  { day: "Thu", sales: 24000 },
  { day: "Fri", sales: 19500 },
  { day: "Sat", sales: 32000 },
  { day: "Sun", sales: 28500 },
];

// Order Status
const orderData = [
  {
    name: "Completed",
    value: 68,
    fill: "#059669",
  },
  {
    name: "Pending",
    value: 22,
    fill: "#64748B",
  },
  {
    name: "Cancelled",
    value: 10,
    fill: "#CBD5E1",
  },
];

// Recent Transactions
const transactions = [
  {
    id: "INV-1024",
    customer: "Rahim Ahmed",
    date: "Nov 15, 2026",
    amount: 2450,
    status: "Completed",
  },
  {
    id: "INV-1023",
    customer: "Karim Hasan",
    date: "Nov 15, 2026",
    amount: 1850,
    status: "Pending",
  },
  {
    id: "INV-1022",
    customer: "Nusrat Jahan",
    date: "Nov 14, 2026",
    amount: 4200,
    status: "Completed",
  },
  {
    id: "INV-1021",
    customer: "Sakib Rahman",
    date: "Nov 14, 2026",
    amount: 950,
    status: "Cancelled",
  },
];

const formatCurrency = (value) =>
  `৳ ${Number(value).toLocaleString("en-BD")}`;

const DashboardPage = () => {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">
            Dashboard Overview
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Here's what's happening with your store today.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
          <CalendarDays size={16} />
          November 15, 2026
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.positive
            ? ArrowUpRight
            : ArrowDownRight;

          return (
            <div
              key={stat.title}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>

                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                  <Icon size={20} />
                </div>
              </div>

              <h3 className="mt-4 text-2xl font-semibold text-slate-800">
                {stat.value}
              </h3>

              <div className="mt-3 flex items-center gap-1.5">
                <TrendIcon
                  size={15}
                  className={
                    stat.positive
                      ? "text-emerald-600"
                      : "text-red-500"
                  }
                />

                <span
                  className={`text-xs font-medium ${
                    stat.positive
                      ? "text-emerald-600"
                      : "text-red-500"
                  }`}
                >
                  {stat.change}
                </span>

                <span className="text-xs text-slate-400">
                  vs last week
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">

        {/* Sales Bar Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-800">
                Sales Overview
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Daily sales performance for the last 7 days
              </p>
            </div>

            <button className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100">
              <MoreHorizontal size={20} />
            </button>
          </div>

          <div className="mt-6 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={salesData}
                margin={{
                  top: 5,
                  right: 5,
                  left: 5,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0"
                />

                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748B", fontSize: 12 }}
                  dy={10}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748B", fontSize: 12 }}
                  tickFormatter={(value) =>
                    `${value / 1000}k`
                  }
                />

                <Tooltip
                  cursor={{ fill: "#ECFDF5" }}
                  formatter={(value) => [
                    formatCurrency(value),
                    "Sales",
                  ]}
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  }}
                />

                <Bar
                  dataKey="sales"
                  fill="#059669"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={42}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Radial Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div>
            <h3 className="font-semibold text-slate-800">
              Order Overview
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Current order status distribution
            </p>
          </div>

          <div className="relative mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="35%"
                outerRadius="100%"
                barSize={13}
                data={orderData}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  tick={false}
                />

                <RadialBar
                  background={{ fill: "#F1F5F9" }}
                  dataKey="value"
                  cornerRadius={10}
                />

                <Tooltip
                  formatter={(value) => [`${value}%`, "Orders"]}
                />
              </RadialBarChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-semibold text-slate-800">
                248
              </span>
              <span className="text-xs text-slate-500">
                Total Orders
              </span>
            </div>
          </div>

          <div className="mt-2 space-y-4">
            {orderData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-sm text-slate-600">
                    {item.name}
                  </span>
                </div>

                <span className="text-sm font-semibold text-slate-800">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Completed Orders",
            value: "169",
          },
          {
            label: "Pending Orders",
            value: "55",
          },
          {
            label: "Low Stock Products",
            value: "12",
          },
          {
            label: "Active Customers",
            value: "724",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <p className="text-sm text-slate-500">
              {item.label}
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-800">
              {item.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h3 className="font-semibold text-slate-800">
              Recent Transactions
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Latest sales transactions
            </p>
          </div>

          <button className="text-sm font-medium text-emerald-700 transition hover:text-emerald-800">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead className="bg-slate-50">
              <tr className="text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Invoice</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4 text-sm font-medium text-slate-800">
                    {transaction.id}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {transaction.customer}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-500">
                    {transaction.date}
                  </td>

                  <td className="px-5 py-4 text-sm font-medium text-slate-800">
                    {formatCurrency(transaction.amount)}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        transaction.status === "Completed"
                          ? "bg-emerald-50 text-emerald-700"
                          : transaction.status === "Pending"
                          ? "bg-slate-100 text-slate-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;
