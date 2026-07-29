import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';

const schema = z.object({
  shopName: z.string().min(2),
  shopEmail: z.string().email().optional().or(z.literal('')),
  shopPhone: z.string().optional(),
  shopAddress: z.string().optional(),
  ownerName: z.string().min(2),
  ownerEmail: z.string().email(),
  ownerPhone: z.string().optional(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

export function RegisterShopPage() {
  const navigate = useNavigate();
  const { registerShop } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      shopEmail: '',
      shopPhone: '',
      shopAddress: '',
      ownerPhone: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setError(null);
      await registerShop({
        ...values,
        shopEmail: values.shopEmail || undefined,
      });
      navigate('/dashboard');
    } catch {
      setError('Shop registration failed. Please check your details and try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-2xl" title="Create Your Jewelry Shop" subtitle="Launch your SaaS workspace in minutes">
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Shop Name</label>
            <Input {...register('shopName')} />
            {errors.shopName ? <p className="mt-1 text-xs text-rose-600">{errors.shopName.message}</p> : null}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Shop Email</label>
            <Input type="email" {...register('shopEmail')} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Shop Phone</label>
            <Input {...register('shopPhone')} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Shop Address</label>
            <Input {...register('shopAddress')} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Owner Name</label>
            <Input {...register('ownerName')} />
            {errors.ownerName ? <p className="mt-1 text-xs text-rose-600">{errors.ownerName.message}</p> : null}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Owner Email</label>
            <Input type="email" {...register('ownerEmail')} />
            {errors.ownerEmail ? <p className="mt-1 text-xs text-rose-600">{errors.ownerEmail.message}</p> : null}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Owner Phone</label>
            <Input {...register('ownerPhone')} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <Input type="password" {...register('password')} />
            {errors.password ? <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p> : null}
          </div>

          <div className="md:col-span-2">
            {error ? <p className="mb-3 text-sm text-rose-600">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Shop...' : 'Register Shop'}
            </Button>
          </div>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Already have access?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
            Back to login
          </Link>
        </p>
      </Card>
    </div>
  );
}
