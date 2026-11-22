import {
  LayoutDashboard,
  Receipt,
  ClipboardCheck,
  Users,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

import { logoutUser } from "@/services/firebase/auth";

const navigationItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    label: "Expenses",
    icon: Receipt,
    path: "/expenses",
  },
  {
    label: "Approvals",
    icon: ClipboardCheck,
    path: "/approvals",
  },
  {
    label: "Employees",
    icon: Users,
    path: "/employees",
  },
  {
    label: "Reports",
    icon: BarChart3,
    path: "/reports",
  },
];

function AppSidebar() {
  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-white">

      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-lg font-semibold">
          Claimora
        </h1>
      </div>

      <nav className="flex-1 space-y-1 p-4">

        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              onClick={() => handleNavigation(item.path)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}

      </nav>

      <div className="border-t p-4">

        <button
          onClick={() => handleNavigation("/settings")}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
        >
          <Settings className="h-5 w-5" />
          Settings
        </button>

        <button
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>

      </div>

    </aside>
  );
}

export default AppSidebar;