import {
  ArrowRight,
  Plus,
  ReceiptText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Quick Actions
        </CardTitle>

        <p className="mt-1 text-sm text-gray-500">
          Manage your expenses quickly
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        <Button className="w-full justify-between">
          <span className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Submit Expense
          </span>

          <ArrowRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <ReceiptText className="h-4 w-4" />
            View My Expenses
          </span>

          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

export default QuickActions;