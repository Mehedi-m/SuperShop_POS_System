
import { Store, ShieldCheck, BarChart3, Boxes } from "lucide-react";

export default function AuthLayout({ children, variant = "default" }) {
  const isReverse = variant === "reverse";

  return (
    <main className="relative flex h-screen overflow-hidden bg-white">
      {/* Desktop Emerald Background */}
      <div
        className="absolute inset-0 hidden bg-emerald-600 lg:block"
        style={{
          clipPath: isReverse
            ? "polygon(0 0, 62% 0, 38% 100%, 0 100%)"
            : "polygon(62% 0, 100% 0, 100% 100%, 38% 100%)",
        }}
      />

      {/* Mobile Branding */}
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center gap-3 bg-emerald-600 px-6 py-4 text-white lg:hidden">
        <Store size={24} />
        <span className="text-lg font-bold">Super Shop</span>
      </div>

      {/* Form Section */}
      <section
        className={`relative z-10 flex h-screen w-full items-center px-5 py-4 lg:w-[58%] lg:py-6 ${
          isReverse
            ? "order-2 justify-end lg:pl-20 lg:pr-16"
            : "order-1 justify-start lg:pl-16 lg:pr-20 xl:pl-24"
        }`}
      >
        <div className="w-full max-w-md">
          {children}
        </div>
      </section>

      {/* Branding Section */}
      <section
        className={`relative z-10 hidden h-screen flex-1 items-center px-10 text-white lg:flex ${
          isReverse
            ? "order-1 justify-start"
            : "order-2 justify-center"
        }`}
      >
        <div
          className={`w-full max-w-md ${
            isReverse ? "mr-auto pr-8" : "ml-auto pl-8"
          }`}
        >
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
            <Store size={30} />
          </div>

          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">
            Super Shop Management
          </p>

          <h2 className="text-4xl font-bold leading-tight xl:text-5xl">
            Manage Your Business
            <span className="block text-emerald-100">
              Smarter & Better.
            </span>
          </h2>

          <p className="mt-6 max-w-sm text-sm leading-7 text-emerald-50">
            Take control of your branches, inventory, sales and business
            operations with one complete management platform.
          </p>

          <div className="mt-10 space-y-5">
            <div className="flex items-center gap-3">
              <ShieldCheck size={21} />
              <span className="text-sm">
                Secure Business Management
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Boxes size={21} />
              <span className="text-sm">
                Centralized Inventory Control
              </span>
            </div>

            <div className="flex items-center gap-3">
              <BarChart3 size={21} />
              <span className="text-sm">
                Smart Sales & Analytics
              </span>
            </div>
          </div>

          <p className="mt-16 text-xs text-emerald-100/80">
            One Platform. Complete Control.
          </p>
        </div>
      </section>
    </main>
  );
}
