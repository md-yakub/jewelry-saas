import { useState } from "react";
import http, { unwrap } from "../../api/http";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../hooks/useAuth";

export function ReportsPage() {
  const { selectedShopId } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [from, setFrom] = useState(new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [daily, setDaily] = useState<any | null>(null);
  const [summary, setSummary] = useState<any | null>(null);
  const [inventoryValue, setInventoryValue] = useState<any | null>(null);
  const [goldSold, setGoldSold] = useState<any | null>(null);

  const loadDaily = async () => {
    if (!selectedShopId) return;
    const response = await http.get(
      `/shops/${selectedShopId}/reports/daily-closing`,
      { params: { date } },
    );
    setDaily(unwrap(response));
  };

  const loadSummary = async () => {
    if (!selectedShopId) return;
    const [summaryResponse, inventoryResponse, goldResponse] =
      await Promise.all([
        http.get(`/shops/${selectedShopId}/reports/sales-summary`, {
          params: { from, to },
        }),
        http.get(`/shops/${selectedShopId}/reports/inventory-value`),
        http.get(`/shops/${selectedShopId}/reports/gold-sold`, {
          params: { from, to },
        }),
      ]);

    setSummary(unwrap(summaryResponse));
    setInventoryValue(unwrap(inventoryResponse));
    setGoldSold(unwrap(goldResponse));
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl">Reports</h1>
        <p className="text-sm text-slate-500">
          Generate daily closing, sales summary, inventory value, and gold sold
          reports.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Daily Closing">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-sm">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
            <Button onClick={() => void loadDaily()}>Run</Button>
          </div>
          <pre className="mt-3 overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-emerald-200">
            {daily ? JSON.stringify(daily, null, 2) : "No result yet."}
          </pre>
        </Card>

        <Card title="Range Reports">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <Input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
            <Input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
            <Button onClick={() => void loadSummary()}>Run</Button>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3">
            <pre className="overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-amber-200">
              {summary
                ? JSON.stringify(summary, null, 2)
                : "Sales summary pending."}
            </pre>
            <pre className="overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-sky-200">
              {inventoryValue
                ? JSON.stringify(inventoryValue, null, 2)
                : "Inventory value pending."}
            </pre>
            <pre className="overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-fuchsia-200">
              {goldSold
                ? JSON.stringify(goldSold, null, 2)
                : "Gold sold report pending."}
            </pre>
          </div>
        </Card>
      </div>
    </div>
  );
}
