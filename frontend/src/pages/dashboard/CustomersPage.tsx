import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import http, { unwrap } from "../../api/http";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../hooks/useAuth";

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(4),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
};

export function CustomersPage() {
  const { selectedShopId } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      address: "",
      notes: "",
    },
  });

  const load = async () => {
    if (!selectedShopId) return;
    const response = await http.get(`/shops/${selectedShopId}/customers`, {
      params: { page: 1, limit: 50 },
    });
    setCustomers(unwrap<{ items: Customer[] }>(response).items);
  };

  useEffect(() => {
    void load();
  }, [selectedShopId]);

  const onSubmit = async (values: FormValues) => {
    if (!selectedShopId) return;

    await http.post(`/shops/${selectedShopId}/customers`, {
      ...values,
      email: values.email || undefined,
    });
    reset();
    await load();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl">Customers</h1>
        <p className="text-sm text-slate-500">
          Create and track customer profiles with contact history.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Add Customer" className="lg:col-span-1">
          <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
            <Input placeholder="Name" {...register("name")} />
            <Input placeholder="Phone" {...register("phone")} />
            <Input placeholder="Email (optional)" {...register("email")} />
            <Input placeholder="Address" {...register("address")} />
            <Input placeholder="Notes" {...register("notes")} />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Add Customer"}
            </Button>
          </form>
        </Card>

        <Card title="Customer List" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2">Phone</th>
                  <th className="px-2 py-2">Email</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-t border-slate-200">
                    <td className="px-2 py-2 font-medium">{customer.name}</td>
                    <td className="px-2 py-2">{customer.phone}</td>
                    <td className="px-2 py-2">{customer.email ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
