import { useState } from "react";
import http, { unwrap } from "../../api/http";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../hooks/useAuth";
import { formatCurrency } from "../../lib/utils";

export function ReportsPage() {
  const { selectedShopId, selectedShop } = useAuth();
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
          {daily ? (
            <div className="mt-3 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
              <p>Total sales: {formatCurrency(daily.totalSales, selectedShop)}</p>
              <p>Cash: {formatCurrency(daily.cashTotal, selectedShop)}</p>
              <p>Card: {formatCurrency(daily.cardTotal, selectedShop)}</p>
              <p>Bank: {formatCurrency(daily.bankTotal, selectedShop)}</p>
              <p>
                Old gold:{" "}
                {formatCurrency(daily.oldGoldExchangeTotal, selectedShop)}
              </p>
              <p>Profit: {formatCurrency(daily.profitEstimate, selectedShop)}</p>
              <p>Invoices: {daily.totalInvoices}</p>
              <p>Gold sold: {daily.totalGoldWeightSold} g</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No result yet.</p>
          )}
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
          <div className="mt-3 grid grid-cols-1 gap-3 text-sm">
            {summary ? (
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="font-semibold text-slate-900">Sales Summary</p>
                <p>
                  Sales: {formatCurrency(summary.totalSalesAmount, selectedShop)}
                </p>
                <p>Discounts: {formatCurrency(summary.totalDiscount, selectedShop)}</p>
                <p>Tax: {formatCurrency(summary.totalTax, selectedShop)}</p>
                <p>Invoices: {summary.totalInvoices}</p>
              </div>
            ) : (
              <p className="text-slate-500">Sales summary pending.</p>
            )}
            {inventoryValue ? (
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="font-semibold text-slate-900">Inventory Value</p>
                <p>
                  Purchase cost:{" "}
                  {formatCurrency(inventoryValue.purchaseCostValue, selectedShop)}
                </p>
                <p>
                  Selling estimate:{" "}
                  {formatCurrency(
                    inventoryValue.sellingEstimateValue,
                    selectedShop,
                  )}
                </p>
                <p>
                  Gross margin:{" "}
                  {formatCurrency(
                    inventoryValue.estimatedGrossMargin,
                    selectedShop,
                  )}
                </p>
                <p>Stock count: {inventoryValue.stockCount}</p>
              </div>
            ) : (
              <p className="text-slate-500">Inventory value pending.</p>
            )}
            {goldSold ? (
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="font-semibold text-slate-900">Gold Sold</p>
                <p>{goldSold.totalGoldSoldWeight} g</p>
              </div>
            ) : (
              <p className="text-slate-500">Gold sold report pending.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
