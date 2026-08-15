import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { RoleCode } from "../../types/auth";
import { cn } from "../../lib/utils";

type MenuItem = {
  label: string;
  to: string;
  roles: RoleCode[];
};

const menu: MenuItem[] = [
  {
    label: "Dashboard",
    to: "/dashboard",
    roles: ["SHOP_OWNER", "MANAGER", "STAFF", "SUPER_ADMIN"],
  },
  {
    label: "Inventory",
    to: "/inventory",
    roles: ["SHOP_OWNER", "MANAGER", "SUPER_ADMIN"],
  },
  {
    label: "Categories",
    to: "/inventory/categories",
    roles: ["SHOP_OWNER", "MANAGER", "SUPER_ADMIN"],
  },
  {
    label: "Sales / POS",
    to: "/sales",
    roles: ["SHOP_OWNER", "MANAGER", "STAFF", "SUPER_ADMIN"],
  },
  {
    label: "Gold Rates",
    to: "/gold-rates",
    roles: ["SHOP_OWNER", "MANAGER", "SUPER_ADMIN"],
  },
  {
    label: "Customers",
    to: "/customers",
    roles: ["SHOP_OWNER", "MANAGER", "STAFF", "SUPER_ADMIN"],
  },
  {
    label: "Calculator",
    to: "/calculator",
    roles: ["SHOP_OWNER", "MANAGER", "STAFF", "SUPER_ADMIN"],
  },
  {
    label: "Custom Orders",
    to: "/custom-orders",
    roles: ["SHOP_OWNER", "MANAGER", "STAFF", "SUPER_ADMIN"],
  },
  {
    label: "Reports",
    to: "/reports",
    roles: ["SHOP_OWNER", "MANAGER", "SUPER_ADMIN"],
  },
  {
    label: "Settings",
    to: "/settings",
    roles: ["SHOP_OWNER", "MANAGER", "STAFF", "SUPER_ADMIN"],
  },
];

export function AppLayout() {
  const navigate = useNavigate();
  const {
    user,
    memberships,
    selectedShopId,
    selectedRole,
    logout,
    setSelectedShopId,
  } = useAuth();

  const visibleMenu = menu.filter((item) => {
    if (user?.isSuperAdmin) {
      return true;
    }
    if (!selectedRole) {
      return false;
    }
    return item.roles.includes(selectedRole);
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1450px]">
        <aside className="w-64 border-r border-slate-200 bg-[linear-gradient(170deg,#241006_0%,#3b1f10_45%,#1f2937_100%)] px-5 py-6 text-slate-100">
          <Link to="/dashboard" className="mb-8 block">
            <p className="font-heading text-2xl tracking-wide">Jewelry SaaS</p>
            <p className="text-xs text-amber-200/80">Multi-tenant Operations</p>
          </Link>
          <nav className="space-y-2">
            {visibleMenu.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "block rounded-lg px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-white/15 text-white"
                      : "text-slate-100/80 hover:bg-white/10 hover:text-white",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Signed in as
              </p>
              <p className="font-medium">{user?.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedShopId ?? ""}
                onChange={(event) => setSelectedShopId(event.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                {memberships.length === 0 ? (
                  <option value="">No shop memberships</option>
                ) : null}
                {memberships.map((membership) => (
                  <option key={membership.shopId} value={membership.shopId}>
                    {membership.shop.name} ({membership.role})
                  </option>
                ))}
              </select>
              <button
                onClick={async () => {
                  await logout();
                  navigate("/login");
                }}
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                type="button"
              >
                Logout
              </button>
            </div>
          </header>
          <div className="flex-1 p-6">
            {!selectedShopId ? (
              <div className="rounded-panel border border-amber-300 bg-amber-50 p-4 text-amber-800 shadow-panel">
                No shop is selected. Please pick a shop from the dropdown to
                continue.
              </div>
            ) : (
              <Outlet />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
