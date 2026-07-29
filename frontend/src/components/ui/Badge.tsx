import { cn } from '../../lib/utils';

const styles: Record<string, string> = {
  AVAILABLE: 'bg-emerald-100 text-emerald-700',
  RESERVED: 'bg-amber-100 text-amber-700',
  SOLD: 'bg-slate-200 text-slate-700',
  PENDING: 'bg-amber-100 text-amber-700',
  READY: 'bg-emerald-100 text-emerald-700',
  DELIVERED: 'bg-sky-100 text-sky-700',
  CANCELLED: 'bg-rose-100 text-rose-700',
};

export function Badge({ value }: { value: string }) {
  return (
    <span className={cn('rounded-full px-2 py-1 text-xs font-semibold', styles[value] ?? 'bg-slate-100 text-slate-700')}>
      {value}
    </span>
  );
}
