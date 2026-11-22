import { Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/services/firebase/config";
import { getUserProfile } from "@/services/firebase/firestore";

function TopNavbar() {
  const [name, setName] = useState("User");
  const [role, setRole] = useState("Employee");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);

        if (profile) {
          setName(profile.name || user.displayName || "User");
          setRole(profile.role || "Employee");
        }
      } catch (error) {
        console.error("Error loading navbar profile:", error);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-8">
      <div>
        <p className="text-sm text-gray-500">
          Claimora
        </p>
      </div>

      <div className="flex items-center gap-5">
        <button className="relative text-gray-500 transition hover:text-gray-900">
          <Bell className="h-5 w-5" />

          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">
              {name}
            </p>

            <p className="text-xs capitalize text-gray-500">
              {role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopNavbar;