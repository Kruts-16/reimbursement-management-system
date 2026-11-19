import { ArrowLeft } from "lucide-react";
import { useState, type FormEvent } from "react";
import { auth } from "@/services/firebase/config";
import { getUserProfile, addExpense } from "@/services/firebase/firestore";

import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitExpensePage() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
const [receiptFile, setReceiptFile] = useState<File | null>(null);
const [scanning] = useState(false);
const [ocrMessage, setOcrMessage] = useState("");
  const handleSubmit = async (
  event: FormEvent<HTMLFormElement>
) => {
  event.preventDefault();

  console.log("SUBMIT BUTTON CLICKED");

  try {
    const user = auth.currentUser;

if (!user) {
  throw new Error("User is not logged in.");
}

const profile = await getUserProfile(user.uid);

if (!profile) {
  throw new Error("User profile not found.");
}

const expenseId = await addExpense({
  title,
  amount: Number(amount),
  category,
  date,
  description,
  companyId: profile.companyId,
  userId: user.uid,
  userName: profile.name,
});

    console.log("Expense saved to Firestore:", expenseId);

  } catch (error) {
    console.error("Error saving expense:", error);
  }
};

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6 p-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Submit Expense
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Submit a reimbursement request for an expense.
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Details</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Expense Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Expense Title
                </Label>

                <Input
                  id="title"
                  placeholder="e.g. Client Lunch"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                />
              </div>

              {/* Amount + Date */}
              <div className="grid gap-5 sm:grid-cols-2">

                <div className="space-y-2">
                  <Label htmlFor="amount">
                    Amount
                  </Label>

                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 1850"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">
                    Expense Date
                  </Label>

                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    required
                  />
                </div>

              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category
                </Label>

                <select
                  id="category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">
                    Select a category
                  </option>

                  <option value="Travel">
                    Travel
                  </option>

                  <option value="Meals">
                    Meals
                  </option>

                  <option value="Accommodation">
                    Accommodation
                  </option>

                  <option value="Office">
                    Office Supplies
                  </option>

                  <option value="Software">
                    Software
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description
                </Label>

                <textarea
                  id="description"
                  placeholder="Add some details about this expense..."
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
              </div>

{/* Receipt Upload */}

<div className="space-y-3">
  <label className="block text-sm font-medium">
    Receipt / Bill
  </label>

  <input
    type="file"
    accept="image/*,.pdf"
    className="w-full rounded-lg border p-3 text-sm"
    onChange={(event) => {
      const file = event.target.files?.[0];

      if (!file) return;

      setReceiptFile(file);
      setOcrMessage("Receipt selected. AI scanning will be available shortly.");
    }}
  />

  {scanning && (
    <p className="text-sm text-blue-600">
      AI is scanning your receipt...
    </p>
  )}

  {ocrMessage && (
    <p className="text-sm text-gray-600">
      {ocrMessage}
    </p>
  )}

  {receiptFile && (
    <p className="text-xs text-gray-500">
      Selected: {receiptFile.name}
    </p>
  )}
</div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 border-t pt-6">
                <Button
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>

                <Button type="submit">
                  Submit Expense
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export default SubmitExpensePage;