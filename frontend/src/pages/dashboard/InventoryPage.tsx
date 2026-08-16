import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import http, { unwrap } from "../../api/http";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../hooks/useAuth";
import { formatCurrency } from "../../lib/utils";

type Item = {
  id: string;
  name: string;
  sku: string;
  carat: string;
  status: string;
  sellingPriceEstimate: string;
};

type InventoryListResponse = {
  items: Item[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };
};

const PAGE_LIMIT = 50;
const paginationNavButtonClass =
  "border border-slate-700 !bg-slate-800 !text-white shadow-sm hover:!bg-slate-700 focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-brand-500 focus-visible:!ring-offset-2 disabled:cursor-not-allowed disabled:!border-slate-300 disabled:!bg-slate-200 disabled:!text-slate-500 disabled:!opacity-100 disabled:hover:!bg-slate-200";
const activePageButtonClass =
  "min-w-10 border border-brand-700 !bg-brand-700 !text-white shadow-sm hover:!bg-brand-800 focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-brand-500 focus-visible:!ring-offset-2";
const inactivePageButtonClass =
  "min-w-10 border border-slate-300 !bg-white !text-slate-800 shadow-sm hover:!border-slate-400 hover:!bg-slate-100 focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-brand-500 focus-visible:!ring-offset-2";

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | "start-ellipsis" | "end-ellipsis"> = [1];
  const start = Math.max(2, currentPage - 2);
  const end = Math.min(totalPages - 1, currentPage + 2);

  if (start > 2) pages.push("start-ellipsis");
  for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
    pages.push(pageNumber);
  }
  if (end < totalPages - 1) pages.push("end-ellipsis");
  pages.push(totalPages);

  return pages;
}

export function InventoryPage() {
  const { selectedShopId, selectedShop } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const navigationMessage =
    typeof location.state === "object" &&
    location.state !== null &&
    "message" in location.state &&
    typeof location.state.message === "string"
      ? location.state.message
      : "";
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message] = useState(navigationMessage);

  const load = async (requestedPage: number, searchTerm = appliedSearch) => {
    if (!selectedShopId) return;
    setLoading(true);
    try {
      const response = await http.get(`/shops/${selectedShopId}/items`, {
        params: {
          page: requestedPage,
          limit: PAGE_LIMIT,
          includeTotal: true,
          search: searchTerm || undefined,
        },
      });
      const data = unwrap<InventoryListResponse>(response);
      setItems(data.items);
      setPage(data.pagination.page);
      setTotalPages(Math.max(data.pagination.totalPages, 1));
    } finally {
      setLoading(false);
    }
  };

  const applySearch = () => {
    setAppliedSearch(search);
    setPage(1);
    void load(1, search);
  };

  const changePage = (requestedPage: number) => {
    if (
      loading ||
      requestedPage < 1 ||
      requestedPage > totalPages ||
      requestedPage === page
    ) {
      return;
    }

    void load(requestedPage);
  };

  useEffect(() => {
    setPage(1);
    void load(1);
  }, [selectedShopId]);

  useEffect(() => {
    if (!navigationMessage) return;
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, navigationMessage, navigate]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl">Inventory</h1>
          <p className="text-sm text-slate-500">
            Manage jewelry stock, categories, and statuses.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/inventory/categories">
            <Button className="bg-slate-800 hover:bg-slate-700">
              Manage Categories
            </Button>
          </Link>
          <Link to="/inventory/new">
            <Button>Add Jewelry Item</Button>
          </Link>
        </div>
      </div>

      {message ? (
        <div className="rounded-panel border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      <Card>
        <div className="mb-3 flex gap-2">
          <Input
            placeholder="Search by name, SKU, barcode"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Button onClick={applySearch} disabled={loading}>
            {loading ? "Loading..." : "Search"}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="px-2 py-2">Name</th>
                <th className="px-2 py-2">SKU</th>
                <th className="px-2 py-2">Carat</th>
                <th className="px-2 py-2">Estimate</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-slate-200">
                  <td className="px-2 py-2 font-medium text-slate-900">
                    {item.name}
                  </td>
                  <td className="px-2 py-2">{item.sku}</td>
                  <td className="px-2 py-2">{item.carat}</td>
                  <td className="px-2 py-2">
                    {formatCurrency(item.sellingPriceEstimate, selectedShop)}
                  </td>
                  <td className="px-2 py-2">
                    <Badge value={item.status} />
                  </td>
                  <td className="px-2 py-2">
                    <Link
                      className="text-brand-700 hover:text-brand-800"
                      to={`/inventory/${item.id}/edit`}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <p className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              className={paginationNavButtonClass}
              disabled={loading || page === 1}
              onClick={() => changePage(page - 1)}
            >
              Previous
            </Button>

            {getVisiblePages(page, totalPages).map((pageItem) =>
              typeof pageItem === "number" ? (
                <Button
                  key={pageItem}
                  className={
                    pageItem === page
                      ? activePageButtonClass
                      : inactivePageButtonClass
                  }
                  disabled={loading}
                  onClick={() => changePage(pageItem)}
                  aria-current={pageItem === page ? "page" : undefined}
                >
                  {pageItem}
                </Button>
              ) : (
                <span
                  key={pageItem}
                  className="px-1 text-sm font-medium text-slate-500"
                  aria-hidden="true"
                >
                  ...
                </span>
              ),
            )}

            <Button
              className={paginationNavButtonClass}
              disabled={loading || page >= totalPages}
              onClick={() => changePage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
