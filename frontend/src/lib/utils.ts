import clsx from "clsx";

export function cn(...classes: Array<string | false | null | undefined>) {
  return clsx(classes);
}

export type CurrencyFormatSettings = {
  currencyCode?: string | null;
  locale?: string | null;
};

export function formatCurrency(
  value: number | string | null | undefined,
  settings?: CurrencyFormatSettings,
) {
  const numericValue = Number(value ?? 0);
  const safeValue = Number.isFinite(numericValue) ? numericValue : 0;

  try {
    return new Intl.NumberFormat(settings?.locale || "en-US", {
      style: "currency",
      currency: settings?.currencyCode || "USD",
      minimumFractionDigits: 2,
    }).format(safeValue);
  } catch {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(safeValue);
  }
}
