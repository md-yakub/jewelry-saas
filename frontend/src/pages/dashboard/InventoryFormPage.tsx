import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import http, { unwrap } from "../../api/http";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { useAuth } from "../../hooks/useAuth";

const schema = z.object({
  name: z.string().min(2),
  categoryId: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  goldWeight: z.coerce.number().nonnegative(),
  stoneWeight: z.coerce.number().nonnegative().default(0),
  netGoldWeight: z.coerce.number().nonnegative().optional(),
  carat: z.enum(["K18", "K21", "K22", "K24"]),
  makingCharge: z.coerce.number().nonnegative().default(0),
  wastagePercentage: z.coerce.number().nonnegative().default(0),
  stonePrice: z.coerce.number().nonnegative().default(0),
  purchaseCost: z.coerce.number().nonnegative().default(0),
  sellingPriceEstimate: z.coerce.number().nonnegative().default(0),
});

type FormValues = z.infer<typeof schema>;

type Category = { id: string; name: string };

export function InventoryFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedShopId } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const isEdit = Boolean(id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      categoryId: "",
      sku: "",
      barcode: "",
      goldWeight: 0,
      stoneWeight: 0,
      netGoldWeight: 0,
      carat: "K22",
      makingCharge: 0,
      wastagePercentage: 0,
      stonePrice: 0,
      purchaseCost: 0,
      sellingPriceEstimate: 0,
    },
  });

  useEffect(() => {
    if (!selectedShopId) return;

    http
      .get(`/shops/${selectedShopId}/categories`)
      .then((response) => {
        setCategories(unwrap<Category[]>(response));
      })
      .catch(() => setCategories([]));

    if (id) {
      http.get(`/shops/${selectedShopId}/items/${id}`).then((response) => {
        const item = unwrap<any>(response);
        reset({
          ...item,
          categoryId: item.categoryId ?? "",
          goldWeight: Number(item.goldWeight),
          stoneWeight: Number(item.stoneWeight),
          netGoldWeight: Number(item.netGoldWeight),
          makingCharge: Number(item.makingCharge),
          wastagePercentage: Number(item.wastagePercentage),
          stonePrice: Number(item.stonePrice),
          purchaseCost: Number(item.purchaseCost),
          sellingPriceEstimate: Number(item.sellingPriceEstimate),
        });
      });
    }
  }, [id, reset, selectedShopId]);

  const onSubmit = async (values: FormValues) => {
    if (!selectedShopId) return;

    const payload = {
      ...values,
      categoryId: values.categoryId || undefined,
      sku: values.sku || undefined,
      barcode: values.barcode || undefined,
    };

    if (isEdit) {
      await http.patch(`/shops/${selectedShopId}/items/${id}`, payload);
    } else {
      await http.post(`/shops/${selectedShopId}/items`, payload);
    }

    navigate("/inventory");
  };

  const fields = [
    { name: "name", label: "Item Name", type: "text" },
    { name: "sku", label: "SKU (optional)", type: "text" },
    { name: "barcode", label: "Barcode (optional)", type: "text" },
    { name: "goldWeight", label: "Gold Weight", type: "number" },
    { name: "stoneWeight", label: "Stone Weight", type: "number" },
    { name: "netGoldWeight", label: "Net Gold Weight", type: "number" },
    { name: "makingCharge", label: "Making Charge", type: "number" },
    { name: "wastagePercentage", label: "Wastage %", type: "number" },
    { name: "stonePrice", label: "Stone Price", type: "number" },
    { name: "purchaseCost", label: "Purchase Cost", type: "number" },
    { name: "sellingPriceEstimate", label: "Selling Estimate", type: "number" },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl">
            {isEdit ? "Edit Jewelry Item" : "Add Jewelry Item"}
          </h1>
          <p className="text-sm text-slate-500">
            Keep stock details accurate for POS and reports.
          </p>
        </div>
        <Link
          to="/inventory"
          className="text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          Back to inventory
        </Link>
      </div>

      <Card>
        <form
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <Select {...register("categoryId")}>
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Carat</label>
            <Select {...register("carat")}>
              <option value="K18">18K</option>
              <option value="K21">21K</option>
              <option value="K22">22K</option>
              <option value="K24">24K</option>
            </Select>
          </div>

          {fields.map((field) => (
            <div key={field.name}>
              <label className="mb-1 block text-sm font-medium">
                {field.label}
              </label>
              <Input step="0.001" type={field.type} {...register(field.name)} />
              {errors[field.name] ? (
                <p className="mt-1 text-xs text-rose-600">
                  {errors[field.name]?.message as string}
                </p>
              ) : null}
            </div>
          ))}

          <div className="md:col-span-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEdit
                  ? "Update Item"
                  : "Create Item"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
