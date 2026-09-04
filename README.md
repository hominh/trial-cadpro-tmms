# CadPro TMMS Frontend

Frontend quản lý thiết bị và dữ liệu giao thông cho CadPro TMMS, xây dựng bằng Next.js,
TypeScript strict mode, shadcn/ui, Axios và Zustand.

Repository hiện ở giai đoạn khởi tạo quản trị. Mọi feature phải đi qua Spec Kit trước khi có mã
ứng dụng:

```text
specify -> clarify (khi cần) -> plan -> tasks -> implement -> analyze -> pull request
```

## Tài liệu chính

- [Project constitution](.specify/memory/constitution.md)
- [SDLC](docs/SDLC.md)
- [Contributing guide](CONTRIBUTING.md)
- [Data architecture](CadPro-TMMS-Data-Architecture_1.html)
- [Security policy](SECURITY.md)

## Bắt đầu một feature

1. Tạo spec bằng `speckit-specify`.
2. Làm rõ các điểm chưa xác định bằng `speckit-clarify` khi cần.
3. Tạo thiết kế bằng `speckit-plan`.
4. Tạo danh sách công việc bằng `speckit-tasks`.
5. Chỉ bắt đầu code sau khi spec, plan và tasks đã được review.

Không thêm source feature trực tiếp vào `main` và không bỏ qua Constitution Check.

## Kiểm tra cục bộ

```powershell
powershell -ExecutionPolicy Bypass -File scripts/validate-sdlc.ps1
```

Trên PowerShell 7/macOS/Linux, dùng `pwsh -File scripts/validate-sdlc.ps1`.

Khi ứng dụng Next.js đã được khởi tạo, CI cũng chạy `npm ci`, lint, typecheck, test (nếu có)
và build.
