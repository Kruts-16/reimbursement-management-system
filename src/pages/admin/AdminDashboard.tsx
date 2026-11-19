import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { auth } from "@/services/firebase/config";
import { getUserProfile, getCompanyStats } from "@/services/firebase/firestore";

function AdminDashboard() {
  const [employees, setEmployees] = useState(0);
  const [pendingExpenses, setPendingExpenses] = useState(0);
  const [totalReimbursements, setTotalReimbursements] = useState(0);

  useEffect(() => {
    async function loadStats() {
      try {
        const user = auth.currentUser;

        if (!user) {
          return;
        }

        const profile = await getUserProfile(user.uid);

        if (!profile) {
          return;
        }

        const stats = await getCompanyStats(profile.companyId);

        setEmployees(stats.employees);
        setPendingExpenses(stats.pendingExpenses);
        setTotalReimbursements(stats.totalReimbursements);
      } catch (error) {
        console.error("Error loading dashboard:", error);
      }
    }

    loadStats();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-8 p-8">

        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your company, employees and reimbursements.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">

          <div className="rounded-xl border bg-white p-6">
            <p className="text-sm text-gray-500">
              Employees
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {employees}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6">
            <p className="text-sm text-gray-500">
              Pending Expenses
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {pendingExpenses}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6">
            <p className="text-sm text-gray-500">
              Total Reimbursements
            </p>

            <p className="mt-2 text-3xl font-semibold">
              ₹{totalReimbursements}
            </p>
          </div>

        </div>

        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">
            Company Management
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Employee management and approval settings will appear here.
          </p>
        </div>

      </div>
    </AppLayout>
  );
}

export default AdminDashboard;