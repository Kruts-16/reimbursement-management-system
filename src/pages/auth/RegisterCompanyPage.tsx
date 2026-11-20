import { useState } from "react";
import { Building2 } from "lucide-react";

import { registerUser } from "@/services/firebase/auth";
import {
  createCompany,
  createUserProfile,
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

function RegisterCompanyPage() {
  const [companyName, setCompanyName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      // 1. Create Firebase Authentication user
      const user = await registerUser(
        email,
        password
      );

      // 2. Create company
      const companyId = user.uid;

      await createCompany(companyId, {
        name: companyName,
        createdBy: user.uid,
      });

      // 3. Create admin profile
      await createUserProfile(user.uid, {
        name: adminName,
        email: email,
        role: "admin",
        companyId: companyId,
      });

      console.log(
        "Company registration successful!"
      );

      console.log("User ID:", user.uid);
      console.log("Company ID:", companyId);

    } catch (error: any) {
      console.error(
        "Registration error:",
        error
      );

      if (error.code === "auth/email-already-in-use") {
        setError(
          "An account with this email already exists."
        );
      } else if (
        error.code === "auth/weak-password"
      ) {
        setError(
          "Password should be at least 6 characters."
        );
      } else if (
        error.code === "auth/invalid-email"
      ) {
        setError(
          "Please enter a valid email address."
        );
      } else {
        setError(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 text-white">
            <Building2 className="h-6 w-6" />
          </div>

          <div>
            <CardTitle className="text-2xl">
              Create your company
            </CardTitle>

            <p className="mt-2 text-sm text-gray-500">
              Set up your Claimora workspace.
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleRegister}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="companyName">
                Company Name
              </Label>

              <Input
                id="companyName"
                placeholder="Acme Technologies"
                value={companyName}
                onChange={(event) =>
                  setCompanyName(event.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminName">
                Your Name
              </Label>

              <Input
                id="adminName"
                placeholder="John Doe"
                value={adminName}
                onChange={(event) =>
                  setAdminName(event.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email
              </Label>

              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password
              </Label>

              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading
                ? "Creating company..."
                : "Create Company"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default RegisterCompanyPage;