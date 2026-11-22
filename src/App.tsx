
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";

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
import ManagerSignupPage from "@/pages/auth/ManagerSignupPage";

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
          } else {
            setRole(null);
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
          setRole(null);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // PUBLIC ROUTES
  if (path === "/register") {
    return <RegisterCompanyPage />;
  }

  if (path === "/manager-signup") {
    return <ManagerSignupPage />;
  }

  if (path === "/employee-signup") {
    return <EmployeeSignupPage />;
  }

  if (path === "/login") {
    return <LoginPage />;
  }

  // AUTHENTICATION LOADING
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading Claimora...</p>
      </div>
    );
  }

  // NOT LOGGED IN
  if (!role) {
    return <LoginPage />;
  }

  // PENDING MANAGER
  if (role === "pending_manager") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md rounded-xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">
            Registration Submitted!
          </h1>

          <p className="mt-3 text-gray-500">
            Your manager account is awaiting admin approval.
            You will be able to access the manager dashboard
            once your request is approved.
          </p>

          <button
            onClick={async () => {
              try {
                await signOut(auth);
                setRole(null);
                window.location.replace("/login");
              } catch (error) {
                console.error("Logout error:", error);
              }
            }}
            className="mt-6 rounded-lg bg-black px-5 py-2 text-white"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // DASHBOARD
  if (path === "/dashboard" || path === "/") {
    if (role === "admin") {
      return <AdminDashboard />;
    }

    return <EmployeeDashboard />;
  }

  // EMPLOYEES
  if (path === "/employees" && role === "admin") {
    return <EmployeesPage />;
  }

  // EXPENSES
  if (path === "/expenses") {
    if (role === "admin") {
      return <ExpensesPage />;
    }

    return <SubmitExpensePage />;
  }

  // APPROVALS
  if (path === "/approvals") {
    if (role === "admin" || role === "manager") {
      return <ApprovalsPage />;
    }

    return <EmployeeDashboard />;
  }

  // REPORTS
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

  // FALLBACK
  if (role === "admin") {
    return <AdminDashboard />;
  }

  return <EmployeeDashboard />;
}

export default App;
