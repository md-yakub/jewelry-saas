import { render, screen } from "@testing-library/react";
import { InvoicePdfStatus } from "./InvoicePdfStatus";

describe("InvoicePdfStatus", () => {
  it("changes from generating to ready when the worker status updates", () => {
    const onDownload = vi.fn();
    const { rerender } = render(
      <InvoicePdfStatus status="PROCESSING" onDownload={onDownload} />,
    );

    expect(screen.getByText("Generating invoice...")).toBeVisible();

    rerender(<InvoicePdfStatus status="READY" onDownload={onDownload} />);

    expect(screen.getByText("Invoice ready")).toBeVisible();
    expect(screen.getByRole("button", { name: "Download PDF" })).toBeEnabled();
  });
});
