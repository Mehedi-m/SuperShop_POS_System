
import AuthGuard from "@/features/auth/components/auth-guard";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import BranchProvider from "@/providers/branch-provider";

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <BranchProvider>
        <div className="flex h-screen overflow-hidden bg-slate-50">

          {/* Sidebar */}
          <Sidebar />

          {/* Main Section */}
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

            {/* Navbar */}
            <Navbar />

            {/* Scrollable Content */}
            <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
              {children}
            </main>

          </div>
        </div>
      </BranchProvider>
    </AuthGuard>
  );
}
