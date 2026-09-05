import { Alert } from "@/components/ui/alert";
export function VersionConflictDialog({ message }: { readonly message: string | null }) {
  return message ? (
    <Alert>
      <p className={"alert-title m-[0_0_0.2rem] text-[0.9rem]"}>Dữ liệu đã thay đổi</p>
      <p className={"alert-description m-0 text-[#5b6b65] text-[0.82rem]"}>
        {message}. Bản nháp được giữ lại; hãy tải lại để so sánh trước khi lưu lại.
      </p>
    </Alert>
  ) : null;
}
