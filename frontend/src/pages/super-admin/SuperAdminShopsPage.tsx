import { useEffect, useState } from "react";
import http, { unwrap } from "../../api/http";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import type { PaginatedResponse } from "../../types/api";

type SuperAdminShop = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  owner?: {
    name: string;
    email: string;
  } | null;
};

export function SuperAdminShopsPage() {
  const [search, setSearch] = useState("");
  const [shops, setShops] = useState<SuperAdminShop[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const response = await http.get("/super-admin/shops", {
        params: { page: 1, limit: 50, search: search || undefined },
      });
      setShops(unwrap<PaginatedResponse<SuperAdminShop>>(response).items);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, isActive: boolean) => {
    await http.patch(`/super-admin/shops/${id}/status`, { isActive });
    await load();
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl">Shops</h1>
        <p className="text-sm text-slate-500">
          Manage tenant shops across the platform.
        </p>
      </div>

      <Card>
        <div className="mb-3 flex gap-2">
          <Input
            placeholder="Search shop name, slug, or email"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Button onClick={() => void load()} disabled={loading}>
            {loading ? "Loading..." : "Search"}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="px-2 py-2">Shop</th>
                <th className="px-2 py-2">Owner</th>
                <th className="px-2 py-2">Active</th>
                <th className="px-2 py-2">Created</th>
                <th className="px-2 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {shops.map((shop) => (
                <tr key={shop.id} className="border-t border-slate-200">
                  <td className="px-2 py-2">
                    <p className="font-medium text-slate-900">{shop.name}</p>
                    <p className="text-xs text-slate-500">{shop.slug}</p>
                  </td>
                  <td className="px-2 py-2">
                    {shop.owner ? (
                      <>
                        <p>{shop.owner.name}</p>
                        <p className="text-xs text-slate-500">
                          {shop.owner.email}
                        </p>
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-2 py-2">
                    <Badge value={shop.isActive ? "ACTIVE" : "INACTIVE"} />
                  </td>
                  <td className="px-2 py-2">
                    {new Date(shop.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-2 py-2">
                    <Button
                      onClick={() => void updateStatus(shop.id, !shop.isActive)}
                    >
                      {shop.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
