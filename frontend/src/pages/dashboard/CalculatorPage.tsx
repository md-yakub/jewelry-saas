import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import http, { unwrap } from '../../api/http';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useAuth } from '../../hooks/useAuth';

const schema = z.object({
  goldWeight: z.coerce.number().nonnegative(),
  carat: z.enum(['K18', 'K21', 'K22', 'K24']),
  makingCharge: z.coerce.number().nonnegative(),
  wastagePercentage: z.coerce.number().nonnegative(),
  stonePrice: z.coerce.number().nonnegative(),
  discount: z.coerce.number().nonnegative(),
  taxPercentage: z.coerce.number().nonnegative(),
});

type FormValues = z.infer<typeof schema>;

export function CalculatorPage() {
  const { selectedShopId } = useAuth();
  const [result, setResult] = useState<any | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      goldWeight: 0,
      carat: 'K22',
      makingCharge: 0,
      wastagePercentage: 0,
      stonePrice: 0,
      discount: 0,
      taxPercentage: 0,
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!selectedShopId) return;
    const response = await http.post(`/shops/${selectedShopId}/calculator/price`, values);
    setResult(unwrap(response));
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl">Price Calculator</h1>
        <p className="text-sm text-slate-500">Calculate final jewelry pricing using current carat rates.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Calculate Price">
          <form className="grid grid-cols-2 gap-3" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="mb-1 block text-sm">Gold Weight</label>
              <Input type="number" step="0.001" {...register('goldWeight')} />
            </div>
            <div>
              <label className="mb-1 block text-sm">Carat</label>
              <Select {...register('carat')}>
                <option value="K18">18K</option>
                <option value="K21">21K</option>
                <option value="K22">22K</option>
                <option value="K24">24K</option>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm">Making Charge</label>
              <Input type="number" step="0.01" {...register('makingCharge')} />
            </div>
            <div>
              <label className="mb-1 block text-sm">Wastage %</label>
              <Input type="number" step="0.01" {...register('wastagePercentage')} />
            </div>
            <div>
              <label className="mb-1 block text-sm">Stone Price</label>
              <Input type="number" step="0.01" {...register('stonePrice')} />
            </div>
            <div>
              <label className="mb-1 block text-sm">Discount</label>
              <Input type="number" step="0.01" {...register('discount')} />
            </div>
            <div>
              <label className="mb-1 block text-sm">Tax %</label>
              <Input type="number" step="0.01" {...register('taxPercentage')} />
            </div>
            <div className="col-span-2">
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Calculating...' : 'Calculate'}</Button>
            </div>
          </form>
        </Card>

        <Card title="Breakdown">
          <pre className="overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-amber-200">
            {result ? JSON.stringify(result, null, 2) : 'Run a calculation to view full breakdown.'}
          </pre>
        </Card>
      </div>
    </div>
  );
}
