import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../lib/utils";

const menu = [
  { label: "Overview", to: "/super-admin" },
  { label: "Users", to: "/super-admin/users" },
  { label: "Shops", to: "/super-admin/shops" },
];

export function SuperAdminLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1450px]">
        <aside className="w-64 border-r border-slate-200 bg-[linear-gradient(170deg,#241006_0%,#3b1f10_45%,#1f2937_100%)] px-5 py-6 text-slate-100">
          <div className="mb-8">
            <p className="font-heading text-2xl tracking-wide">Jewelry SaaS</p>
            <p className="text-xs text-amber-200/80">Super Admin</p>
          </div>
          <nav className="space-y-2">
            {menu.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/super-admin"}
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
                Signed in as Super Admin
              </p>
              <p className="font-medium">{user?.name}</p>
            </div>
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
          </header>
          <div className="flex-1 p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
