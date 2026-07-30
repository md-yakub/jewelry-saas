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
  rate18K: z.coerce.number().nonnegative(),
  rate21K: z.coerce.number().nonnegative(),
  rate22K: z.coerce.number().nonnegative(),
  rate24K: z.coerce.number().nonnegative(),
});

type FormValues = z.infer<typeof schema>;

export function GoldRatesPage() {
  const { selectedShopId } = useAuth();
  const [current, setCurrent] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      rate18K: 0,
      rate21K: 0,
      rate22K: 0,
      rate24K: 0,
    },
  });

  const load = async () => {
    if (!selectedShopId) return;
    const [currentResponse, historyResponse] = await Promise.all([
      http.get(`/shops/${selectedShopId}/gold-rates/current`).catch(() => null),
      http.get(`/shops/${selectedShopId}/gold-rates/history`, {
        params: { page: 1, limit: 20 },
      }),
    ]);

    if (currentResponse) {
      setCurrent(unwrap(currentResponse));
    } else {
      setCurrent(null);
    }

    setHistory(unwrap<{ items: any[] }>(historyResponse).items);
  };

  useEffect(() => {
    void load();
  }, [selectedShopId]);

  const onSubmit = async (values: FormValues) => {
    if (!selectedShopId) return;
    await http.post(`/shops/${selectedShopId}/gold-rates`, values);
    reset(values);
    await load();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl">Gold Rates</h1>
        <p className="text-sm text-slate-500">
          Update daily carat rates used by pricing and old-gold exchange.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Update Rates">
          <form
            className="grid grid-cols-2 gap-3"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div>
              <label className="mb-1 block text-sm">18K</label>
              <Input type="number" step="0.01" {...register("rate18K")} />
            </div>
            <div>
              <label className="mb-1 block text-sm">21K</label>
              <Input type="number" step="0.01" {...register("rate21K")} />
            </div>
            <div>
              <label className="mb-1 block text-sm">22K</label>
              <Input type="number" step="0.01" {...register("rate22K")} />
            </div>
            <div>
              <label className="mb-1 block text-sm">24K</label>
              <Input type="number" step="0.01" {...register("rate24K")} />
            </div>
            <div className="col-span-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Rate"}
              </Button>
            </div>
          </form>
        </Card>

        <Card title="Current Rate">
          <pre className="overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-emerald-200">
            {current
              ? JSON.stringify(current, null, 2)
              : "No current rate available."}
          </pre>
        </Card>
      </div>

      <Card title="Rate History">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="px-2 py-2">Date</th>
                <th className="px-2 py-2">18K</th>
                <th className="px-2 py-2">21K</th>
                <th className="px-2 py-2">22K</th>
                <th className="px-2 py-2">24K</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={entry.id} className="border-t border-slate-200">
                  <td className="px-2 py-2">
                    {new Date(entry.effectiveDate).toLocaleString()}
                  </td>
                  <td className="px-2 py-2">{entry.rate18K}</td>
                  <td className="px-2 py-2">{entry.rate21K}</td>
                  <td className="px-2 py-2">{entry.rate22K}</td>
                  <td className="px-2 py-2">{entry.rate24K}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
