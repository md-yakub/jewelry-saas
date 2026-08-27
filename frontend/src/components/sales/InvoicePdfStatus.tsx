import { Button } from "../ui/Button";

type InvoicePdfStatusProps = {
  status?: string;
  onDownload: () => void;
};

export function InvoicePdfStatus({
  status,
  onDownload,
}: InvoicePdfStatusProps) {
  if (status === "READY") {
    return (
      <div className="space-y-2">
        <p className="font-medium text-emerald-700">Invoice ready</p>
        <Button className="px-3 py-1 text-xs" onClick={onDownload}>
          Download PDF
        </Button>
      </div>
    );
  }

  if (status === "FAILED") {
    return <p className="font-medium text-rose-700">Generation failed</p>;
  }

  return (
    <p className="font-medium text-amber-700">Generating invoice...</p>
  );
}
