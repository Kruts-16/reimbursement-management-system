import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const expenses = [
  {
    title: "Client Lunch",
    category: "Meals",
    amount: "₹1,850",
    date: "Aug 15, 2026",
    status: "Approved",
  },
  {
    title: "Uber - Client Meeting",
    category: "Travel",
    amount: "₹420",
    date: "Aug 14, 2026",
    status: "Pending",
  },
  {
    title: "AWS Subscription",
    category: "Software",
    amount: "₹2,400",
    date: "Aug 12, 2026",
    status: "Approved",
  },
  {
    title: "Office Supplies",
    category: "Office",
    amount: "₹780",
    date: "Aug 10, 2026",
    status: "Rejected",
  },
];

function RecentExpenses() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">
            Recent Expenses
          </CardTitle>

          <p className="mt-1 text-sm text-gray-500">
            Your latest reimbursement requests
          </p>
        </div>

        <button className="flex items-center gap-1 text-sm font-medium text-gray-600 transition hover:text-gray-900">
          View all
          <ArrowRight className="h-4 w-4" />
        </button>
      </CardHeader>

      <CardContent>
        <div className="divide-y">
          {expenses.map((expense) => (
            <div
              key={`${expense.title}-${expense.date}`}
              className="flex items-center justify-between py-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">
                  {expense.title}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {expense.category} · {expense.date}
                </p>
              </div>

              <div className="ml-4 flex flex-col items-end gap-2">
                <p className="text-sm font-semibold text-gray-900">
                  {expense.amount}
                </p>

                <Badge
                  variant={
                    expense.status === "Approved"
                      ? "default"
                      : expense.status === "Rejected"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {expense.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default RecentExpenses;