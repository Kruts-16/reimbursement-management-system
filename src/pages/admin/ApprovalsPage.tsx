
import { useEffect, useState } from "react";
import { Check, X, ClipboardCheck } from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import { auth } from "@/services/firebase/config";

import {
  getUserProfile,
  getCompanyExpenses,
  updateExpenseStatus,
} from "@/services/firebase/firestore";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  status: string;
  userName?: string;
  approvalLevel?: number;
  totalApprovalLevels?: number;
  currentApproverRole?: string;
}

function ApprovalsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadExpenses() {
    try {
      const user = auth.currentUser;

      if (!user) return;

      const profile = await getUserProfile(user.uid);

      if (!profile) return;

      const data = await getCompanyExpenses(profile.companyId);

      const pendingExpenses = (data as Expense[]).filter(
        (expense) =>
          expense.status === "pending" &&
          (expense.currentApproverRole === "admin" ||
            expense.currentApproverRole === "manager" ||
            !expense.currentApproverRole)
      );

      setExpenses(pendingExpenses);
    } catch (error) {
      console.error("Error loading approvals:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExpenses();
  }, []);

  async function handleStatusUpdate(
    expenseId: string,
    status: string
  ) {
    try {
      setUpdatingId(expenseId);

      await updateExpenseStatus(expenseId, status);

      await loadExpenses();
    } catch (error) {
      console.error("Error updating expense:", error);
      alert("Could not update expense. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Approvals
          </h1>

          <p className="mt-2 text-gray-500">
            Review and manage pending reimbursement requests.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <p className="py-8 text-center text-sm text-gray-500">
                Loading requests...
              </p>
            ) : expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <ClipboardCheck className="h-6 w-6 text-gray-500" />
                </div>

                <h3 className="text-sm font-medium text-gray-900">
                  No pending requests
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  New reimbursement requests will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="rounded-xl border p-5"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {expense.title}
                          </h3>

                          <p className="text-sm text-gray-500">
                            Submitted by{" "}
                            {expense.userName || "Unknown user"}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                          <span>{expense.category}</span>
                          <span>{expense.date}</span>
                        </div>

                        {expense.description && (
                          <p className="text-sm text-gray-600">
                            {expense.description}
                          </p>
                        )}

                        <p className="text-sm font-medium text-blue-600">
                          Approval Level{" "}
                          {expense.approvalLevel || 1} of{" "}
                          {expense.totalApprovalLevels || 2}
                          {" · "}
                          {(expense.currentApproverRole || "manager")
                            .charAt(0)
                            .toUpperCase() +
                            (expense.currentApproverRole || "manager").slice(1)}
                          {" approval"}
                        </p>
                      </div>

                      <div className="flex flex-col items-start gap-3 md:items-end">
                        <p className="text-xl font-semibold text-gray-900">
                          ₹{expense.amount.toLocaleString("en-IN")}
                        </p>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            disabled={updatingId === expense.id}
                            onClick={() =>
                              handleStatusUpdate(expense.id, "rejected")
                            }
                          >
                            <X className="mr-2 h-4 w-4" />
                            Reject
                          </Button>

                          <Button
                            disabled={updatingId === expense.id}
                            onClick={() =>
                              handleStatusUpdate(expense.id, "approved")
                            }
                          >
                            <Check className="mr-2 h-4 w-4" />
                            {updatingId === expense.id
                              ? "Updating..."
                              : "Approve"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export default ApprovalsPage;
