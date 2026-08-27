import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { InventoryPage } from "./InventoryPage";

const getMock = vi.hoisted(() => vi.fn());

vi.mock("../../api/http", () => ({
  default: { get: getMock },
  unwrap: (response: { data: { data: unknown } }) => response.data.data,
}));

vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({
    selectedShopId: "shop-1",
    selectedShop: { currencyCode: "USD", locale: "en-US" },
  }),
}));

function inventoryResponse(page: number, itemName: string) {
  return {
    data: {
      data: {
        items: [
          {
            id: `item-${page}`,
            name: itemName,
            sku: `SKU-${page}`,
            carat: "K22",
            status: "AVAILABLE",
            sellingPriceEstimate: "100",
          },
        ],
        pagination: {
          page,
          limit: 50,
          total: 150,
          totalPages: 3,
          hasNextPage: page < 3,
        },
      },
      timestamp: "2026-01-01T00:00:00.000Z",
    },
  };
}

describe("InventoryPage pagination", () => {
  it("requests the next exact-total page and updates the current page", async () => {
    getMock
      .mockResolvedValueOnce(inventoryResponse(1, "First page ring"))
      .mockResolvedValueOnce(inventoryResponse(2, "Second page necklace"));
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <InventoryPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("First page ring")).toBeVisible();
    expect(screen.getByText("Page 1 of 3")).toBeVisible();
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(await screen.findByText("Second page necklace")).toBeVisible();
    expect(screen.getByText("Page 2 of 3")).toBeVisible();
    expect(screen.getByRole("button", { name: "Previous" })).toBeEnabled();
    await waitFor(() =>
      expect(getMock).toHaveBeenLastCalledWith("/shops/shop-1/items", {
        params: {
          page: 2,
          limit: 50,
          includeTotal: true,
          search: undefined,
        },
      }),
    );
  });
});
