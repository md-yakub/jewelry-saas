import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import http, { unwrap } from '../../api/http';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';

type Item = {
  id: string;
  name: string;
  sku: string;
  carat: string;
  status: string;
  sellingPriceEstimate: string;
};

export function InventoryPage() {
  const { selectedShopId } = useAuth();
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!selectedShopId) return;
    setLoading(true);
    try {
      const response = await http.get(`/shops/${selectedShopId}/items`, {
        params: { page: 1, limit: 50, search: search || undefined },
      });
      const data = unwrap<{ items: Item[] }>(response);
      setItems(data.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [selectedShopId]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl">Inventory</h1>
          <p className="text-sm text-slate-500">Manage jewelry stock, categories, and statuses.</p>
        </div>
        <Link to="/inventory/new">
          <Button>Add Jewelry Item</Button>
        </Link>
      </div>

      <Card>
        <div className="mb-3 flex gap-2">
          <Input placeholder="Search by name, SKU, barcode" value={search} onChange={(event) => setSearch(event.target.value)} />
          <Button onClick={() => void load()} disabled={loading}>{loading ? 'Loading...' : 'Search'}</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="px-2 py-2">Name</th>
                <th className="px-2 py-2">SKU</th>
                <th className="px-2 py-2">Carat</th>
                <th className="px-2 py-2">Estimate</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-slate-200">
                  <td className="px-2 py-2 font-medium text-slate-900">{item.name}</td>
                  <td className="px-2 py-2">{item.sku}</td>
                  <td className="px-2 py-2">{item.carat}</td>
                  <td className="px-2 py-2">{item.sellingPriceEstimate}</td>
                  <td className="px-2 py-2"><Badge value={item.status} /></td>
                  <td className="px-2 py-2">
                    <Link className="text-brand-700 hover:text-brand-800" to={`/inventory/${item.id}/edit`}>
                      Edit
                    </Link>
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
