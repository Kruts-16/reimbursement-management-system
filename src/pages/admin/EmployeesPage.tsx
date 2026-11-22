
import { useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import { auth } from "@/services/firebase/config";

import {
  getOrCreateCompanyCode,
  createEmployee,
  getUserProfile,
  getCompanyEmployees,
  createGroup,
  getCompanyGroups,
  assignEmployeeToGroup,
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
  groupId?: string;
}

interface EmployeeGroup {
  id: string;
  name: string;
  managerId: string;
}

function EmployeesPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("employee");

  const [groupName, setGroupName] = useState("");
  const [managerId, setManagerId] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");

  const [companyId, setCompanyId] = useState("");
  const [companyCode, setCompanyCode] = useState("");

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [groups, setGroups] = useState<EmployeeGroup[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [message, setMessage] = useState("");

  async function loadEmployees() {
    try {
      const user = auth.currentUser;

      if (!user) return;

      const profile = await getUserProfile(user.uid);

      if (!profile) return;

      setCompanyId(profile.companyId);

      const [employeeData, groupData, code] = await Promise.all([
        getCompanyEmployees(profile.companyId),
        getCompanyGroups(profile.companyId),
        getOrCreateCompanyCode(profile.companyId),
      ]);

      setEmployees(employeeData as Employee[]);
      setGroups(groupData as EmployeeGroup[]);
      setCompanyCode(code);
    } catch (error) {
      console.error("Error loading employees:", error);
    } finally {
      setLoadingEmployees(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  const managers = employees.filter(
    (employee) => employee.role === "manager"
  );

  const availableManagers = managers.filter(
    (manager) =>
      !groups.some((group) => group.managerId === manager.id)
  );

  const availableEmployees = employees.filter(
    (employee) =>
      employee.role === "employee" && !employee.groupId
  );

  async function handleCreateEmployee(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      if (!companyId) {
        throw new Error("Company not found.");
      }

      await createEmployee({
        name,
        email,
        role,
        companyId,
      });

      setMessage("Employee added successfully!");

      setName("");
      setEmail("");
      setRole("employee");

      await loadEmployees();
    } catch (error) {
      console.error(error);
      setMessage("Could not add employee. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateGroup(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      if (!managerId) {
        throw new Error("Please select a manager.");
      }

      await createGroup(groupName, companyId, managerId);

      setGroupName("");
      setManagerId("");
      setMessage("Group created successfully!");

      await loadEmployees();
    } catch (error) {
      console.error(error);
      setMessage("Could not create group. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAssignEmployee(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      if (!selectedEmployee || !selectedGroup) {
        throw new Error("Please select an employee and group.");
      }

      await assignEmployeeToGroup(selectedEmployee, selectedGroup);

      setSelectedEmployee("");
      setSelectedGroup("");
      setMessage("Employee assigned successfully!");

      await loadEmployees();
    } catch (error) {
      console.error(error);
      setMessage("Could not assign employee. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function getManagerName(managerId: string) {
    return employees.find((employee) => employee.id === managerId)?.name
      || "Manager not found";
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-8">

        {/* Signup Code */}
        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold">Employee Signup Code</h2>

          <p className="mt-1 text-sm text-gray-500">
            Share this code with employees so they can join your company.
          </p>

          <div className="mt-3 flex items-center gap-3">
            <span className="font-mono text-lg font-bold">
              {companyCode || "Loading..."}
            </span>

            <button
              className="rounded-lg border px-3 py-2 text-sm"
              onClick={() => navigator.clipboard.writeText(companyCode)}
              disabled={!companyCode}
            >
              Copy Code
            </button>
          </div>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Employees & Groups
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage employees, managers and employee groups.
          </p>
        </div>

        {/* Add Employee */}
        <Card>
          <CardHeader>
            <CardTitle>Add Employee or Manager</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleCreateEmployee} className="space-y-4">

              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="employee@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <Button type="submit" disabled={loading}>
                <Plus className="mr-2 h-4 w-4" />
                Add {role === "manager" ? "Manager" : "Employee"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Create Group */}
        <Card>
          <CardHeader>
            <CardTitle>Create Employee Group</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleCreateGroup} className="space-y-4">

              <div className="space-y-2">
                <Label>Group Name</Label>
                <Input
                  placeholder="Example: Marketing Team"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Assign Manager</Label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  required
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">Select Manager</option>

                  {availableManagers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name}
                    </option>
                  ))}
                </select>

                {availableManagers.length === 0 && (
                  <p className="text-xs text-gray-500">
                    Add a manager first, or all managers are already assigned.
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading || availableManagers.length === 0}
              >
                Create Group
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Assign Employee */}
        <Card>
          <CardHeader>
            <CardTitle>Assign Employee to Group</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleAssignEmployee} className="space-y-4">

              <div className="space-y-2">
                <Label>Select Employee</Label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  required
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">Select Employee</option>

                  {availableEmployees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Select Group</Label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  required
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">Select Group</option>

                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                disabled={
                  loading ||
                  availableEmployees.length === 0 ||
                  groups.length === 0
                }
              >
                Assign Employee
              </Button>
            </form>
          </CardContent>
        </Card>

        {message && (
          <div className="rounded-lg border bg-gray-50 p-3 text-sm text-gray-700">
            {message}
          </div>
        )}

        {/* Groups List */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Groups</CardTitle>
          </CardHeader>

          <CardContent>
            {groups.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">
                No groups created yet.
              </p>
            ) : (
              <div className="space-y-3">
                {groups.map((group) => (
                  <div key={group.id} className="rounded-lg border p-4">
                    <h3 className="font-semibold">{group.name}</h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Manager: {getManagerName(group.managerId)}
                    </p>

                    <p className="mt-2 text-sm text-gray-600">
                      Employees:{" "}
                      {employees
                        .filter((employee) => employee.groupId === group.id)
                        .map((employee) => employee.name)
                        .join(", ") || "No employees assigned"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employee List */}
        <Card>
          <CardHeader>
            <CardTitle>Company Employees</CardTitle>
          </CardHeader>

          <CardContent>
            {loadingEmployees ? (
              <p className="py-8 text-center text-sm text-gray-500">
                Loading employees...
              </p>
            ) : employees.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <Users className="mb-3 h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-500">No employees yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Group</th>
                    </tr>
                  </thead>

                  <tbody>
                    {employees.map((employee) => (
                      <tr key={employee.id} className="border-b last:border-0">
                        <td className="px-4 py-4 font-medium">
                          {employee.name}
                        </td>

                        <td className="px-4 py-4 text-gray-600">
                          {employee.email}
                        </td>

                        <td className="px-4 py-4 capitalize">
                          {employee.role}
                        </td>

                        <td className="px-4 py-4 text-gray-600">
                          {groups.find((group) => group.id === employee.groupId)
                            ?.name || "Not assigned"}
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
