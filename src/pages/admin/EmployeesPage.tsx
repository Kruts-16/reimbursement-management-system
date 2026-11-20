import { useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import { auth } from "@/services/firebase/config";
import { getOrCreateCompanyCode } from "@/services/firebase/firestore";
import {
  createEmployee,
  getUserProfile,
  getCompanyEmployees,
} from "@/services/firebase/firestore";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
}

function EmployeesPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("employee");
const [companyCode, setCompanyCode] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [message, setMessage] = useState("");

  async function loadEmployees() {
    try {
      const user = auth.currentUser;

      if (!user) {
        return;
      }

      const profile = await getUserProfile(user.uid);

      if (!profile) {
        return;
      }

      const data = await getCompanyEmployees(
        profile.companyId
      );
      const code = await getOrCreateCompanyCode(profile.companyId);
setCompanyCode(code);

      setEmployees(data as Employee[]);
    } catch (error) {
      console.error(
        "Error loading employees:",
        error
      );
    } finally {
      setLoadingEmployees(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleCreateEmployee = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const user = auth.currentUser;

      if (!user) {
        throw new Error("Admin is not logged in.");
      }

      const profile = await getUserProfile(user.uid);

      if (!profile) {
        throw new Error("Admin profile not found.");
      }

      const employeeId = await createEmployee({
        name,
        email,
        role,
        companyId: profile.companyId,
      });

      console.log(
        "Employee created:",
        employeeId
      );

      setMessage(
        "Employee added successfully!"
      );

      setName("");
      setEmail("");
      setRole("employee");

      await loadEmployees();
    } catch (error) {
      console.error(
        "Error creating employee:",
        error
      );

      setMessage(
        "Could not add employee. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>

      <div className="mb-6 rounded-xl border bg-white p-5">
  <h2 className="font-semibold">Employee Signup Code</h2>
  <p className="mt-1 text-sm text-gray-500">
    Share this code with employees so they can join your company.
  </p>

  <div className="mt-3 flex items-center gap-3">
    <span className="font-mono text-lg font-bold">{companyCode || "Loading..."}</span>
    <button
      className="rounded-lg border px-3 py-2 text-sm"
      onClick={() => navigator.clipboard.writeText(companyCode)}
      disabled={!companyCode}
    >
      Copy Code
    </button>
  </div>
</div>

      <div className="space-y-6 p-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Employees
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage employees and managers in your company.
            </p>
          </div>

          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>

        {/* Add Employee */}
        <Card>
          <CardHeader>
            <CardTitle>
              Add Employee
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleCreateEmployee}
              className="space-y-5"
            >

              <div className="space-y-2">
                <Label htmlFor="employeeName">
                  Full Name
                </Label>

                <Input
                  id="employeeName"
                  placeholder="Enter employee name"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeEmail">
                  Email
                </Label>

                <Input
                  id="employeeEmail"
                  type="email"
                  placeholder="employee@company.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeRole">
                  Role
                </Label>

                <select
                  id="employeeRole"
                  value={role}
                  onChange={(event) =>
                    setRole(event.target.value)
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="employee">
                    Employee
                  </option>

                  <option value="manager">
                    Manager
                  </option>
                </select>
              </div>

              {message && (
                <div className="rounded-lg border bg-gray-50 p-3 text-sm text-gray-700">
                  {message}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Adding..."
                    : "Add Employee"}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>

        {/* Employee List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Company Employees
            </CardTitle>
          </CardHeader>

          <CardContent>

            {loadingEmployees ? (
              <p className="py-8 text-center text-sm text-gray-500">
                Loading employees...
              </p>
            ) : employees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">

                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <Users className="h-6 w-6 text-gray-500" />
                </div>

                <h3 className="text-sm font-medium text-gray-900">
                  No employees yet
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Add your first employee or manager above.
                </p>

              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead>
                    <tr className="border-b text-left">
                      <th className="px-4 py-3 font-medium text-gray-500">
                        Name
                      </th>

                      <th className="px-4 py-3 font-medium text-gray-500">
                        Email
                      </th>

                      <th className="px-4 py-3 font-medium text-gray-500">
                        Role
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {employees.map((employee) => (
                      <tr
                        key={employee.id}
                        className="border-b last:border-0"
                      >
                        <td className="px-4 py-4 font-medium text-gray-900">
                          {employee.name}
                        </td>

                        <td className="px-4 py-4 text-gray-600">
                          {employee.email}
                        </td>

                        <td className="px-4 py-4">
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-700">
                            {employee.role}
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

export default EmployeesPage;