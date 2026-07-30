import { useEffect, useState } from "react";
import http, { unwrap } from "../../api/http";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import type { PaginatedResponse } from "../../types/api";

type SuperAdminUser = {
  id: string;
  name: string;
  email: string;
  isSuperAdmin: boolean;
  isActive: boolean;
  createdAt: string;
};

export function SuperAdminUsersPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<SuperAdminUser[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const response = await http.get("/super-admin/users", {
        params: { page: 1, limit: 50, search: search || undefined },
      });
      setUsers(unwrap<PaginatedResponse<SuperAdminUser>>(response).items);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, isActive: boolean) => {
    await http.patch(`/super-admin/users/${id}/status`, { isActive });
    await load();
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl">Users</h1>
        <p className="text-sm text-slate-500">
          Manage platform users and Super Admin accounts.
        </p>
      </div>

      <Card>
        <div className="mb-3 flex gap-2">
          <Input
            placeholder="Search name or email"
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
                <th className="px-2 py-2">Name</th>
                <th className="px-2 py-2">Email</th>
                <th className="px-2 py-2">Active</th>
                <th className="px-2 py-2">Super Admin</th>
                <th className="px-2 py-2">Created</th>
                <th className="px-2 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-slate-200">
                  <td className="px-2 py-2 font-medium text-slate-900">
                    {user.name}
                  </td>
                  <td className="px-2 py-2">{user.email}</td>
                  <td className="px-2 py-2">
                    <Badge value={user.isActive ? "ACTIVE" : "INACTIVE"} />
                  </td>
                  <td className="px-2 py-2">
                    {user.isSuperAdmin ? "Yes" : "No"}
                  </td>
                  <td className="px-2 py-2">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-2 py-2">
                    <Button
                      onClick={() => void updateStatus(user.id, !user.isActive)}
                    >
                      {user.isActive ? "Deactivate" : "Activate"}
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
