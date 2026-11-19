import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/services/firebase/config";
import { getUserProfile } from "@/services/firebase/firestore";

import LoginPage from "@/pages/auth/LoginPage";
import RegisterCompanyPage from "@/pages/auth/RegisterCompanyPage";
import EmployeeDashboard from "@/pages/employee/EmployeeDashboard";
import SubmitExpensePage from "@/pages/employee/SubmitExpensePage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import EmployeesPage from "@/pages/admin/EmployeesPage";
import ExpensesPage from "@/pages/admin/ExpensesPage";
import AppLayout from "@/components/layout/AppLayout";
import ApprovalsPage from "@/pages/admin/ApprovalsPage";
import EmployeeSignupPage from "@/pages/auth/EmployeeSignupPage";

function App() {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  const path = window.location.pathname;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          setRole(null);
          setLoading(false);
          return;
        }

        try {
          const profile = await getUserProfile(user.uid);

          if (profile) {
            setRole(profile.role);
          }
        } catch (error) {
          console.error(
            "Error loading user profile:",
            error
          );
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  if (path === "/register") {
    return <RegisterCompanyPage />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">
          Loading Claimora...
        </p>
      </div>
    );
  }

  if (!role) {
    return <LoginPage />;
  }

  /* Dashboard */
  if (path === "/dashboard" || path === "/") {
    if (role === "admin") {
      return <AdminDashboard />;
    }

    return <EmployeeDashboard />;
  }

  /* Employees */
  if (path === "/employees" && role === "admin") {
    return <EmployeesPage />;
  }

  /* Expenses */
  if (path === "/expenses") {
  if (role === "admin") {
    return <ExpensesPage />;
  }

  return <SubmitExpensePage />;
}

  /* Approvals */
if (path === "/approvals") {
  return <ApprovalsPage />;
}

  /* Reports */
  if (path === "/reports") {
    return (
      <AppLayout>
        <div className="p-8">
          <h1 className="text-3xl font-semibold text-gray-900">
            Reports
          </h1>

          <p className="mt-2 text-gray-500">
            Reimbursement reports will appear here.
          </p>
        </div>
      </AppLayout>
    );
  }
if (path === "/employee-signup") {
  return <EmployeeSignupPage />;
}

  /* Fallback */
  if (role === "admin") {
    return <AdminDashboard />;
  }

  return <EmployeeDashboard />;
}

export default App;