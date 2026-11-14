import { Suspense } from "react";
import BranchManagement from "@/features/branches/components/branch-management";

const BranchesPage = () => (
  <Suspense
    fallback={
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Loading branch management...
      </div>
    }
  >
    <BranchManagement />
  </Suspense>
);

export default BranchesPage;
