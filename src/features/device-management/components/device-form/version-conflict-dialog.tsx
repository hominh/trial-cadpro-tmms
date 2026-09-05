import { Alert } from "@/components/ui/alert";
export function VersionConflictDialog({ message }: { readonly message: string | null }) {
  return message ? (
    <Alert>
      <p className="alert-title">Dữ liệu đã thay đổi</p>
      <p className="alert-description">
        {message}. Bản nháp được giữ lại; hãy tải lại để so sánh trước khi lưu lại.
      </p>
    </Alert>
  ) : null;
}
