import AuthGuard from "@/features/auth/components/auth-guard";

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  );
}