import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import http, { unwrap } from "../../api/http";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { useAuth } from "../../hooks/useAuth";
import { formatCurrency } from "../../lib/utils";

const schema = z.object({
  customerId: z.string().min(1),
  designNotes: z.string().min(5),
  estimatedWeight: z.coerce.number().nonnegative(),
  advancePayment: z.coerce.number().nonnegative(),
  deliveryDate: z.string().min(1),
  craftsmanId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Customer = { id: string; name: string; phone: string };
type Craftsman = { id: string; name: string };

export function CustomOrdersPage() {
  const { selectedShopId, selectedShop } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [craftsmen, setCraftsmen] = useState<Craftsman[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const load = async () => {
    if (!selectedShopId) return;

    const [customerResponse, craftsmanResponse, ordersResponse] =
      await Promise.all([
        http.get(`/shops/${selectedShopId}/customers`, {
          params: { page: 1, limit: 100 },
        }),
        http.get(`/shops/${selectedShopId}/craftsmen`),
        http.get(`/shops/${selectedShopId}/custom-orders`, {
          params: { page: 1, limit: 50 },
        }),
      ]);

    setCustomers(unwrap<{ items: Customer[] }>(customerResponse).items);
    setCraftsmen(unwrap<Craftsman[]>(craftsmanResponse));
    setOrders(unwrap<{ items: any[] }>(ordersResponse).items);
  };

  useEffect(() => {
    void load();
  }, [selectedShopId]);

  const onSubmit = async (values: FormValues) => {
    if (!selectedShopId) return;

    await http.post(`/shops/${selectedShopId}/custom-orders`, {
      ...values,
      craftsmanId: values.craftsmanId || undefined,
    });

    reset();
    await load();
  };

  const updateStatus = async (id: string, status: string) => {
    if (!selectedShopId) return;
    await http.patch(`/shops/${selectedShopId}/custom-orders/${id}/status`, {
      status,
    });
    await load();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl">Custom Orders</h1>
        <p className="text-sm text-slate-500">
          Track bespoke designs from intake to delivery.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card title="Create Order" className="xl:col-span-1">
          <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
            <Select {...register("customerId")}>
              <option value="">Select customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.phone})
                </option>
              ))}
            </Select>
            <Input placeholder="Design notes" {...register("designNotes")} />
            <Input
              type="number"
              step="0.001"
              placeholder="Estimated weight"
              {...register("estimatedWeight")}
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Advance payment"
              {...register("advancePayment")}
            />
            <Input type="date" {...register("deliveryDate")} />
            <Select {...register("craftsmanId")}>
              <option value="">Assign later</option>
              {craftsmen.map((craftsman) => (
                <option key={craftsman.id} value={craftsman.id}>
                  {craftsman.name}
                </option>
              ))}
            </Select>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Create Order"}
            </Button>
          </form>
        </Card>

        <Card title="Order Pipeline" className="xl:col-span-2">
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-lg border border-slate-200 p-3 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">
                    {order.customer?.name ?? "Customer"} -{" "}
                    {order.estimatedWeight} g
                  </p>
                  <Badge value={order.status} />
                </div>
                <p className="mt-1 text-slate-600">{order.designNotes}</p>
                <p className="mt-1 text-slate-600">
                  Advance: {formatCurrency(order.advancePayment, selectedShop)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    "PENDING",
                    "DESIGN_CONFIRMED",
                    "IN_PROGRESS",
                    "READY",
                    "DELIVERED",
                    "CANCELLED",
                  ].map((status) => (
                    <button
                      key={status}
                      onClick={() => void updateStatus(order.id, status)}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100"
                      type="button"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
