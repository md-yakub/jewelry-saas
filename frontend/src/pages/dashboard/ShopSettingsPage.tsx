import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import http, { getApiErrorMessage, unwrap } from "../../api/http";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { useAuth } from "../../hooks/useAuth";

const currencyCodes = ["BDT", "INR", "PKR", "EUR", "USD"] as const;

const schema = z.object({
  currencyCode: z.enum(currencyCodes),
  locale: z.string().min(2),
});

type FormValues = z.infer<typeof schema>;

type ShopSettings = {
  id: string;
  name: string;
  slug: string;
  currencyCode: string;
  locale: string;
};

export function ShopSettingsPage() {
  const {
    selectedShopId,
    selectedRole,
    selectedShop,
    user,
    updateSelectedShopSettings,
  } = useAuth();
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const canEdit = selectedRole === "SHOP_OWNER" && !user?.isSuperAdmin;

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currencyCode: (selectedShop?.currencyCode ??
        "USD") as FormValues["currencyCode"],
      locale: selectedShop?.locale ?? "en-US",
    },
  });

  useEffect(() => {
    if (!selectedShopId) return;

    http
      .get(`/shops/${selectedShopId}/settings`)
      .then((response) => {
        const data = unwrap<ShopSettings>(response);
        setSettings(data);
        reset({
          currencyCode: data.currencyCode as FormValues["currencyCode"],
          locale: data.locale,
        });
        updateSelectedShopSettings({
          currencyCode: data.currencyCode,
          locale: data.locale,
        });
      })
      .catch((loadError) => {
        setError(getApiErrorMessage(loadError, "Unable to load shop settings."));
      });
  }, [reset, selectedShopId, updateSelectedShopSettings]);

  const onSubmit = async (values: FormValues) => {
    if (!selectedShopId || !canEdit) return;

    setMessage("");
    setError("");

    try {
      const response = await http.patch(
        `/shops/${selectedShopId}/settings`,
        values,
      );
      const data = unwrap<ShopSettings>(response);
      setSettings(data);
      updateSelectedShopSettings({
        currencyCode: data.currencyCode,
        locale: data.locale,
      });
      setMessage("Shop settings updated successfully.");
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, "Unable to save shop settings."));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl">Shop Settings</h1>
        <p className="text-sm text-slate-500">
          Configure shop-level currency and locale used across the application.
        </p>
      </div>

      {message ? (
        <div className="rounded-panel border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-panel border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <Card
        title={settings?.name ?? selectedShop?.name ?? "Selected Shop"}
        subtitle={
          canEdit
            ? "Shop Owners can update these settings."
            : "Your role can view these settings but cannot change them."
        }
      >
        <form
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <label className="mb-1 block text-sm font-medium">Currency</label>
            <Select {...register("currencyCode")} disabled={!canEdit}>
              {currencyCodes.map((currencyCode) => (
                <option key={currencyCode} value={currencyCode}>
                  {currencyCode}
                </option>
              ))}
            </Select>
            {errors.currencyCode ? (
              <p className="mt-1 text-xs text-rose-600">
                {errors.currencyCode.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Locale</label>
            <Input
              placeholder="en-US"
              readOnly={!canEdit}
              {...register("locale")}
            />
            {errors.locale ? (
              <p className="mt-1 text-xs text-rose-600">
                {errors.locale.message}
              </p>
            ) : null}
          </div>

          {canEdit ? (
            <div className="md:col-span-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          ) : null}
        </form>
      </Card>
    </div>
  );
}
