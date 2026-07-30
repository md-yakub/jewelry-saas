import { useEffect, useState } from "react";
import http, { unwrap } from "../../api/http";
import { Card } from "../../components/ui/Card";

type Overview = {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalShops: number;
  activeShops: number;
  inactiveShops: number;
  totalMemberships: number;
};

const labels: Array<{ key: keyof Overview; label: string }> = [
  { key: "totalUsers", label: "Total Users" },
  { key: "activeUsers", label: "Active Users" },
  { key: "inactiveUsers", label: "Inactive Users" },
  { key: "totalShops", label: "Total Shops" },
  { key: "activeShops", label: "Active Shops" },
  { key: "inactiveShops", label: "Inactive Shops" },
  { key: "totalMemberships", label: "Memberships" },
];

export function SuperAdminOverviewPage() {
  const [overview, setOverview] = useState<Overview | null>(null);

  useEffect(() => {
    http
      .get("/super-admin/overview")
      .then((response) => setOverview(unwrap<Overview>(response)))
      .catch(() => setOverview(null));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl">Super Admin Overview</h1>
        <p className="text-sm text-slate-500">
          Platform-wide users, shops, and memberships.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {labels.map((item) => (
          <Card key={item.key} title={item.label}>
            <p className="text-2xl font-bold text-slate-900">
              {overview ? overview[item.key] : "--"}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
