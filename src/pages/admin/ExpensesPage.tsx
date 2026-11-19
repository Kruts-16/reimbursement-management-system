import { useEffect, useState } from "react";

import AppLayout from "@/components/layout/AppLayout";
import { auth } from "@/services/firebase/config";
import {
  getCompanyExpenses,
  getUserProfile,
} from "@/services/firebase/firestore";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  status: string;
}

function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExpenses() {
      try {
        const user = auth.currentUser;

        if (!user) {
          return;
        }

        const profile = await getUserProfile(user.uid);

        if (!profile) {
          return;
        }

        const data = await getCompanyExpenses(
          profile.companyId
        );

        setExpenses(data as Expense[]);
      } catch (error) {
        console.error(
          "Error loading expenses:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadExpenses();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6 p-8">

        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Expenses
          </h1>

          <p className="mt-2 text-gray-500">
            View and manage reimbursement requests.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Expense Requests
            </CardTitle>
          </CardHeader>

          <CardContent>

            {loading ? (
              <p className="py-8 text-center text-sm text-gray-500">
                Loading expenses...
              </p>
            ) : expenses.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm font-medium text-gray-900">
                  No expenses yet
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Submitted expenses will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead>
                    <tr className="border-b text-left">
                      <th className="px-4 py-3 font-medium text-gray-500">
                        Expense
                      </th>

                      <th className="px-4 py-3 font-medium text-gray-500">
                        Category
                      </th>

                      <th className="px-4 py-3 font-medium text-gray-500">
                        Amount
                      </th>

                      <th className="px-4 py-3 font-medium text-gray-500">
                        Date
                      </th>

                      <th className="px-4 py-3 font-medium text-gray-500">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {expenses.map((expense) => (
                      <tr
                        key={expense.id}
                        className="border-b last:border-0"
                      >

                        <td className="px-4 py-4">
                          <p className="font-medium text-gray-900">
                            {expense.title}
                          </p>

                          {expense.description && (
                            <p className="mt-1 text-xs text-gray-500">
                              {expense.description}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-4 text-gray-600">
                          {expense.category}
                        </td>

                        <td className="px-4 py-4 font-medium text-gray-900">
                          ₹{expense.amount}
                        </td>

                        <td className="px-4 py-4 text-gray-600">
                          {expense.date}
                        </td>

                        <td className="px-4 py-4">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              expense.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : expense.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {expense.status}
                          </span>

                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>
            )}

          </CardContent>
        </Card>

      </div>
    </AppLayout>
  );
}

export default ExpensesPage;