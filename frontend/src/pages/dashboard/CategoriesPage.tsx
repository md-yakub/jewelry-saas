import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import http, { getApiErrorMessage, unwrap } from "../../api/http";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../hooks/useAuth";

const schema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters."),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Category = {
  id: string;
  name: string;
  description?: string | null;
};

export function CategoriesPage() {
  const { selectedShopId } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const load = async () => {
    if (!selectedShopId) return;

    setLoading(true);
    setError("");
    try {
      const response = await http.get(`/shops/${selectedShopId}/categories`);
      setCategories(unwrap<Category[]>(response));
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Unable to load categories."));
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [selectedShopId]);

  const startEdit = (category: Category) => {
    setEditingCategory(category);
    reset({
      name: category.name,
      description: category.description ?? "",
    });
    setMessage("");
    setError("");
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    reset({ name: "", description: "" });
    setError("");
  };

  const onSubmit = async (values: FormValues) => {
    if (!selectedShopId) return;

    setMessage("");
    setError("");

    const payload = {
      name: values.name.trim(),
      description: values.description?.trim() ?? "",
    };

    try {
      if (editingCategory) {
        await http.patch(
          `/shops/${selectedShopId}/categories/${editingCategory.id}`,
          payload,
        );
        setMessage("Category updated successfully.");
      } else {
        await http.post(`/shops/${selectedShopId}/categories`, payload);
        setMessage("Category created successfully.");
      }

      setEditingCategory(null);
      reset({ name: "", description: "" });
      await load();
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, "Unable to save category."));
    }
  };

  const removeCategory = async (category: Category) => {
    if (!selectedShopId) return;

    const confirmed = window.confirm(
      `Delete ${category.name}? Existing jewelry items will be moved to no category.`,
    );
    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await http.delete(
        `/shops/${selectedShopId}/categories/${category.id}`,
      );
      const result = unwrap<{ message: string }>(response);
      setMessage(result.message);
      if (editingCategory?.id === category.id) {
        cancelEdit();
      }
      await load();
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError, "Unable to delete category."));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl">Categories</h1>
          <p className="text-sm text-slate-500">
            Organize jewelry stock with shop-specific category names.
          </p>
        </div>
        <Link
          to="/inventory"
          className="text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          Back to inventory
        </Link>
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card
          title={editingCategory ? "Edit Category" : "Add Category"}
          subtitle="Names must be unique within the selected shop."
          className="lg:col-span-1"
        >
          <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Input placeholder="Category name" {...register("name")} />
              {errors.name ? (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.name.message}
                </p>
              ) : null}
            </div>
            <Input
              placeholder="Description (optional)"
              {...register("description")}
            />
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : editingCategory
                    ? "Update Category"
                    : "Add Category"}
              </Button>
              {editingCategory ? (
                <Button
                  className="bg-slate-200 text-slate-800 hover:bg-slate-300"
                  onClick={cancelEdit}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </Card>

        <Card title="Category List" className="lg:col-span-2">
          {loading ? (
            <p className="text-sm text-slate-500">Loading categories...</p>
          ) : categories.length === 0 ? (
            <div className="rounded-panel border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <p className="font-medium text-slate-900">No categories yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Add a category to make item entry faster and inventory easier to scan.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="px-2 py-2">Name</th>
                    <th className="px-2 py-2">Description</th>
                    <th className="px-2 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} className="border-t border-slate-200">
                      <td className="px-2 py-2 font-medium text-slate-900">
                        {category.name}
                      </td>
                      <td className="px-2 py-2">
                        {category.description || "-"}
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex flex-wrap gap-3">
                          <button
                            className="text-brand-700 hover:text-brand-800"
                            onClick={() => startEdit(category)}
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            className="text-rose-700 hover:text-rose-800"
                            onClick={() => void removeCategory(category)}
                            type="button"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
