import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, type SubmitErrorHandler } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import http, { getApiErrorMessage, unwrap } from "../../api/http";
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
  const [categoryError, setCategoryError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
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
        setCategoryError("");
      })
      .catch((error) => {
        setCategories([]);
        setCategoryError(
          getApiErrorMessage(error, "Unable to load categories."),
        );
      });

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
    setSubmitError("");
    setSuccessMessage("");

    if (!selectedShopId) {
      setSubmitError("Select a shop before saving an inventory item.");
      return;
    }

    const payload = {
      ...values,
      categoryId: values.categoryId || undefined,
      sku: values.sku || undefined,
      barcode: values.barcode || undefined,
    };

    try {
      if (isEdit) {
        await http.patch(`/shops/${selectedShopId}/items/${id}`, payload);
        setSuccessMessage("Jewelry item updated successfully.");
      } else {
        await http.post(`/shops/${selectedShopId}/items`, payload);
        setSuccessMessage("Jewelry item created successfully.");
      }

      navigate("/inventory", {
        state: {
          message: isEdit
            ? "Jewelry item updated successfully."
            : "Jewelry item created successfully.",
        },
      });
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Unable to save item."));
    }
  };

  const onInvalid: SubmitErrorHandler<FormValues> = () => {
    setSuccessMessage("");
    setSubmitError("Fix the highlighted fields before saving this item.");
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

      {successMessage ? (
        <div className="rounded-panel border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          {successMessage}
        </div>
      ) : null}
      {submitError ? (
        <div className="rounded-panel border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {submitError}
        </div>
      ) : null}

      <Card>
        <form
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
          onSubmit={handleSubmit(onSubmit, onInvalid)}
        >
          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
              <label className="block text-sm font-medium">Category</label>
              <Link
                to="/inventory/categories"
                className="text-xs font-semibold text-brand-700 hover:text-brand-800"
              >
                Add category
              </Link>
            </div>
            <Select {...register("categoryId")}>
              <option value="">
                {categories.length === 0 ? "No categories yet" : "No category"}
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            {errors.categoryId ? (
              <p className="mt-1 text-xs text-rose-600">
                {errors.categoryId.message}
              </p>
            ) : null}
            {categoryError ? (
              <p className="mt-1 text-xs text-rose-600">{categoryError}</p>
            ) : categories.length === 0 ? (
              <p className="mt-1 text-xs text-slate-500">
                Create categories to organize inventory items.
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Carat</label>
            <Select {...register("carat")}>
              <option value="K18">18K</option>
              <option value="K21">21K</option>
              <option value="K22">22K</option>
              <option value="K24">24K</option>
            </Select>
            {errors.carat ? (
              <p className="mt-1 text-xs text-rose-600">
                {errors.carat.message}
              </p>
            ) : null}
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
