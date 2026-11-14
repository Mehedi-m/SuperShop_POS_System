import {
  Wallet,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const stats = [
  {
    title: "Today's Sales",
    value: "৳ 0.00",
    change: "No data yet",
    icon: Wallet,
  },
  {
    title: "Total Orders",
    value: "0",
    change: "No data yet",
    icon: ShoppingCart,
  },
  {
    title: "Total Products",
    value: "0",
    change: "No data yet",
    icon: Package,
  },
  {
    title: "Total Customers",
    value: "0",
    change: "No data yet",
    icon: Users,
  },
];

const DashboardPage = () => {
  return (
    <div className="space-y-6">

      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-800">
          Dashboard Overview
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Here's what's happening with your store today.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>

                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <Icon size={20} />
                </div>
              </div>

              <h3 className="mt-4 text-2xl font-semibold text-slate-800">
                {stat.value}
              </h3>

              <p className="mt-2 text-xs text-slate-500">
                {stat.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main Dashboard Sections */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">

        {/* Sales Overview */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-800">
                Sales Overview
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Sales performance summary
              </p>
            </div>

            <TrendingUp className="text-slate-500" size={20} />
          </div>

          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-slate-400">
              Sales chart will appear here
            </p>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="font-semibold text-slate-800">
            Quick Summary
          </h3>

          <div className="mt-5 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Completed Orders
              </span>
              <span className="font-semibold text-slate-800">
                0
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Pending Orders
              </span>
              <span className="font-semibold text-slate-800">
                0
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Low Stock Products
              </span>
              <span className="font-semibold text-slate-800">
                0
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Active Customers
              </span>
              <span className="font-semibold text-slate-800">
                0
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">
              Recent Transactions
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Latest sales transactions
            </p>
          </div>

          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View All
          </button>
        </div>

        <div className="flex h-40 items-center justify-center">
          <p className="text-sm text-slate-400">
            No transactions available
          </p>
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;