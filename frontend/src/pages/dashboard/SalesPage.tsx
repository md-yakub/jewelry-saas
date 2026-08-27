import { useEffect, useMemo, useState } from "react";
import http, { unwrap } from "../../api/http";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { InvoicePdfStatus } from "../../components/sales/InvoicePdfStatus";
import { useAuth } from "../../hooks/useAuth";
import { formatCurrency } from "../../lib/utils";

type Customer = { id: string; name: string; phone: string };

type Item = {
  id: string;
  name: string;
  sku: string;
  status: string;
  sellingPriceEstimate: string;
};

export function SalesPage() {
  const { selectedShopId, selectedShop } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "CARD" | "BANK_TRANSFER" | "MIXED"
  >("CASH");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [taxAmount, setTaxAmount] = useState("0");
  const [message, setMessage] = useState<string | null>(null);

  const selectedItems = useMemo(
    () => items.filter((item) => selectedItemIds.includes(item.id)),
    [items, selectedItemIds],
  );

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + Number(item.sellingPriceEstimate),
    0,
  );
  const total = subtotal + Number(taxAmount || 0) - Number(discountAmount || 0);

  const load = async () => {
    if (!selectedShopId) return;

    const [customerResponse, itemResponse, salesResponse] = await Promise.all([
      http.get(`/shops/${selectedShopId}/customers`, {
        params: { page: 1, limit: 100 },
      }),
      http.get(`/shops/${selectedShopId}/items`, {
        params: { page: 1, limit: 100, status: "AVAILABLE" },
      }),
      http.get(`/shops/${selectedShopId}/sales`, {
        params: { page: 1, limit: 20 },
      }),
    ]);

    setCustomers(unwrap<{ items: Customer[] }>(customerResponse).items);
    setItems(unwrap<{ items: Item[] }>(itemResponse).items);
    setSales(unwrap<{ items: any[] }>(salesResponse).items);
  };

  useEffect(() => {
    void load();
  }, [selectedShopId]);

  const hasPendingInvoice = sales.some((sale) =>
    ["PENDING", "PROCESSING"].includes(sale.invoice?.pdfStatus),
  );

  useEffect(() => {
    if (!selectedShopId || !hasPendingInvoice) return;

    const timer = window.setInterval(() => {
      void http
        .get(`/shops/${selectedShopId}/sales`, {
          params: { page: 1, limit: 20 },
        })
        .then((response) => {
          setSales(unwrap<{ items: any[] }>(response).items);
        })
        .catch(() => undefined);
    }, 3_000);

    return () => window.clearInterval(timer);
  }, [hasPendingInvoice, selectedShopId]);

  const submitSale = async () => {
    if (!selectedShopId || selectedItemIds.length === 0) return;

    await http.post(`/shops/${selectedShopId}/sales`, {
      customerId: customerId || undefined,
      items: selectedItemIds.map((id) => ({ itemId: id })),
      paymentMethod,
      discountAmount: Number(discountAmount || 0),
      taxAmount: Number(taxAmount || 0),
    });

    setMessage(
      "Sale created successfully. Inventory updated to SOLD. Generating invoice...",
    );
    setSelectedItemIds([]);
    setDiscountAmount("0");
    setTaxAmount("0");
    await load();
  };

  const downloadInvoice = async (sale: any) => {
    if (!selectedShopId || !sale.invoice) return;

    try {
      const response = await http.get(
        `/shops/${selectedShopId}/sales/${sale.id}/invoice/pdf`,
        { responseType: "blob" },
      );
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${sale.invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setMessage("Invoice PDF is not available yet.");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl">Sales / POS</h1>
        <p className="text-sm text-slate-500">
          Create transactions, apply discounts/tax, and generate invoices.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card title="Create Sale" className="xl:col-span-2">
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm">Customer</label>
              <Select
                value={customerId}
                onChange={(event) => setCustomerId(event.target.value)}
              >
                <option value="">Walk-in customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.phone})
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Select Available Items</p>
              <div className="max-h-52 space-y-2 overflow-auto rounded-lg border border-slate-200 p-3">
                {items.map((item) => {
                  const checked = selectedItemIds.includes(item.id);
                  return (
                    <label
                      key={item.id}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span>
                        {item.name} ({item.sku})
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="font-semibold">
                          {formatCurrency(item.sellingPriceEstimate, selectedShop)}
                        </span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => {
                            if (event.target.checked) {
                              setSelectedItemIds((prev) => [...prev, item.id]);
                            } else {
                              setSelectedItemIds((prev) =>
                                prev.filter((value) => value !== item.id),
                              );
                            }
                          }}
                        />
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm">Payment Method</label>
                <Select
                  value={paymentMethod}
                  onChange={(event) =>
                    setPaymentMethod(event.target.value as any)
                  }
                >
                  <option value="CASH">CASH</option>
                  <option value="CARD">CARD</option>
                  <option value="BANK_TRANSFER">BANK_TRANSFER</option>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm">Discount</label>
                <Input
                  type="number"
                  value={discountAmount}
                  onChange={(event) => setDiscountAmount(event.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">Tax</label>
                <Input
                  type="number"
                  value={taxAmount}
                  onChange={(event) => setTaxAmount(event.target.value)}
                />
              </div>
            </div>

            <div className="rounded-lg bg-slate-100 p-3 text-sm">
              <p>Subtotal: {formatCurrency(subtotal, selectedShop)}</p>
              <p>Total: {formatCurrency(total, selectedShop)}</p>
            </div>

            {message ? (
              <p className="text-sm text-emerald-700">{message}</p>
            ) : null}
            <Button onClick={() => void submitSale()}>Create Sale</Button>
          </div>
        </Card>

        <Card title="Recent Sales">
          <div className="max-h-[420px] space-y-3 overflow-auto">
            {sales.map((sale) => (
              <div
                key={sale.id}
                className="rounded-lg border border-slate-200 p-3 text-sm"
              >
                <p className="font-semibold">
                  {sale.invoice?.invoiceNumber ?? sale.id}
                </p>
                <p>
                  Total:{" "}
                  {formatCurrency(sale.totalAmount, {
                    currencyCode: sale.currencyCode ?? selectedShop?.currencyCode,
                    locale: selectedShop?.locale,
                  })}
                </p>
                <div className="mt-1">
                  <Badge value={sale.status} />
                </div>
                <div className="mt-2 text-xs">
                  <InvoicePdfStatus
                    status={sale.invoice?.pdfStatus}
                    onDownload={() => void downloadInvoice(sale)}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
