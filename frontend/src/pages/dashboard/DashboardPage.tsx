import { useEffect, useState } from "react";
import http, { unwrap } from "../../api/http";
import { Card } from "../../components/ui/Card";
import { useAuth } from "../../hooks/useAuth";
import { formatCurrency } from "../../lib/utils";

export function DashboardPage() {
  const { selectedShopId, selectedShop } = useAuth();
  const [daily, setDaily] = useState<any | null>(null);
  const [inventory, setInventory] = useState<any | null>(null);

  useEffect(() => {
    if (!selectedShopId) return;

    const today = new Date().toISOString().slice(0, 10);

    Promise.all([
      http.get(`/shops/${selectedShopId}/reports/daily-closing`, {
        params: { date: today },
      }),
      http.get(`/shops/${selectedShopId}/reports/inventory-value`),
    ])
      .then(([dailyResponse, inventoryResponse]) => {
        setDaily(unwrap(dailyResponse));
        setInventory(unwrap(inventoryResponse));
      })
      .catch(() => {
        setDaily(null);
        setInventory(null);
      });
  }, [selectedShopId]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Track your daily business performance and stock health.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Today Sales">
          <p className="text-2xl font-bold text-slate-900">
            {daily ? formatCurrency(daily.totalSales, selectedShop) : "--"}
          </p>
        </Card>
        <Card title="Invoices Today">
          <p className="text-2xl font-bold text-slate-900">
            {daily ? daily.totalInvoices : "--"}
          </p>
        </Card>
        <Card title="Stock Value">
          <p className="text-2xl font-bold text-slate-900">
            {inventory
              ? formatCurrency(inventory.sellingEstimateValue, selectedShop)
              : "--"}
          </p>
        </Card>
        <Card title="Gold Sold Today">
          <p className="text-2xl font-bold text-slate-900">
            {daily ? `${daily.totalGoldWeightSold} g` : "--"}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Daily Closing Snapshot">
          <pre className="overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-emerald-200">
            {daily ? JSON.stringify(daily, null, 2) : "No data yet for today."}
          </pre>
        </Card>
        <Card title="Inventory Snapshot">
          <pre className="overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-amber-200">
            {inventory
              ? JSON.stringify(inventory, null, 2)
              : "No inventory data."}
          </pre>
        </Card>
      </div>
    </div>
  );
}
