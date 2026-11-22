
import { useState, type FormEvent } from "react";
import {
  createUserWithEmailAndPassword,
  deleteUser,
} from "firebase/auth";

import { auth } from "@/services/firebase/config";

import {
  createManagerRequest,
  getCompanyBySignupCode,
} from "@/services/firebase/firestore";

export default function ManagerSignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  
async function handleSignup(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setLoading(true);
  setError("");

  let createdUser = false;

  try {
    // First create the Firebase Authentication account
    const credential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    createdUser = true;

    // Now look up the company signup code
    const company = await getCompanyBySignupCode(companyCode);

    if (!company) {
      await deleteUser(credential.user);
      createdUser = false;
      throw new Error("Invalid company signup code.");
    }

    // Create a pending manager profile
    await createManagerRequest(credential.user.uid, {
      name: name.trim(),
      email: email.trim(),
      companyId: company.id,
    });

    window.location.href = "/manager-pending";

  } catch (err) {
    console.error("Manager signup error:", err);

    if (createdUser && auth.currentUser) {
      try {
        await deleteUser(auth.currentUser);
      } catch (deleteError) {
        console.error("Account cleanup error:", deleteError);
      }
    }

    setError(
      err instanceof Error
        ? err.message
        : "Signup failed. Please try again."
    );
  } finally {
    setLoading(false);
  }
}


  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md space-y-5 rounded-2xl border bg-white p-8 shadow-sm"
      >
        <div>
          <h1 className="text-3xl font-bold">Manager Registration</h1>
          <p className="mt-2 text-sm text-gray-500">
            Register as a manager for your company.
            Your account requires admin approval.
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Full name</label>
          <input
            className="w-full rounded-lg border p-3"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <input
            className="w-full rounded-lg border p-3"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Password</label>
          <input
            className="w-full rounded-lg border p-3"
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">
            Company signup code
          </label>
          <input
            className="w-full rounded-lg border p-3 uppercase"
            value={companyCode}
            onChange={(e) =>
              setCompanyCode(e.target.value.toUpperCase())
            }
            placeholder="CLM-XXXXXX"
            required
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button
          className="w-full rounded-lg bg-black p-3 font-medium text-white disabled:opacity-50"
          type="submit"
          disabled={loading}
        >
          {loading ? "Submitting request..." : "Request Manager Account"}
        </button>

        <p className="text-center text-sm text-gray-500">
          Already registered?{" "}
          <a className="font-medium text-black underline" href="/login">
            Log in
          </a>
        </p>
      </form>
    </div>
  );
}
