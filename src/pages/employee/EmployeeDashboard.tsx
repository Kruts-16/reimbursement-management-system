import {
  ArrowDownRight,
  ArrowUpRight,
  Clock3,
  IndianRupee,
  Receipt,
  CheckCircle2,
} from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import RecentExpenses from "@/components/common/RecentExpenses";
import QuickActions from "@/components/common/QuickActions";
function EmployeeDashboard() {
  return (
    <AppLayout>
      <div className="space-y-8 p-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Overview
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening with your expenses.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Expenses
              </CardTitle>

              <div className="rounded-lg bg-gray-100 p-2">
                <IndianRupee className="h-4 w-4 text-gray-600" />
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-2xl font-semibold text-gray-900">
                ₹24,580
              </p>

              <p className="mt-1 flex items-center gap-1 text-xs text-green-600">
                <ArrowUpRight className="h-3 w-3" />
                12.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Pending
              </CardTitle>

              <div className="rounded-lg bg-gray-100 p-2">
                <Clock3 className="h-4 w-4 text-gray-600" />
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-2xl font-semibold text-gray-900">
                ₹8,420
              </p>

              <p className="mt-1 text-xs text-gray-500">
                4 expenses awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Approved
              </CardTitle>

              <div className="rounded-lg bg-gray-100 p-2">
                <CheckCircle2 className="h-4 w-4 text-gray-600" />
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-2xl font-semibold text-gray-900">
                ₹16,160
              </p>

              <p className="mt-1 flex items-center gap-1 text-xs text-green-600">
                <ArrowUpRight className="h-3 w-3" />
                8.2% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Rejected
              </CardTitle>

              <div className="rounded-lg bg-gray-100 p-2">
                <Receipt className="h-4 w-4 text-gray-600" />
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-2xl font-semibold text-gray-900">
                ₹1,250
              </p>

              <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                <ArrowDownRight className="h-3 w-3" />
                2 expenses rejected
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Recent Expenses */}
<div className="grid gap-5 lg:grid-cols-3">
  <div className="lg:col-span-2">
    <RecentExpenses />
  </div>

  <QuickActions />
</div>
    </AppLayout>
  );
}

export default EmployeeDashboard;