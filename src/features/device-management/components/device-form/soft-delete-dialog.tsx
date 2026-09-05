import { Button } from "@/components/ui/button";
export function SoftDeleteDialog({
  label,
  onConfirm,
}: {
  readonly label: string;
  readonly onConfirm: () => void;
}) {
  return (
    <Button
      variant="outline"
      onClick={() => {
        if (window.confirm(`Soft delete ${label}?`)) onConfirm();
      }}
    >
      Xóa mềm
    </Button>
  );
}
