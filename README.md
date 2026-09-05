# CadPro TMMS Frontend

Frontend quản lý thiết bị và dữ liệu giao thông cho CadPro TMMS, xây dựng bằng Next.js,
TypeScript strict mode, shadcn/ui, Axios và Zustand.

Ứng dụng hiện có feature bản đồ thiết bị realtime tại `/map`. Mọi feature tiếp theo vẫn phải đi qua
Spec Kit trước khi có mã ứng dụng:

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

## Styling

Mọi UI mới dùng Tailwind CSS utility classes và shadcn/ui. Không thêm CSS Module, stylesheet riêng,
inline `style` hoặc CSS-in-JS. Chỉ override bắt buộc của thư viện bên thứ ba (ví dụ Leaflet) được đặt
trong `src/app/globals.css`, kèm comment nêu thư viện và lý do Tailwind không biểu đạt được rule đó.

## Kiểm tra cục bộ

Yêu cầu Node.js 22 (`.nvmrc`). Sao chép `.env.example` thành `.env.local`, sau đó:

```powershell
npm ci
npm run dev
```

Các biến môi trường bản đồ:

- `NEXT_PUBLIC_API_BASE_URL`: backend Device Map API.
- `NEXT_PUBLIC_USE_MOCK_API`: đặt `true` để dùng mock API tích hợp tại cùng origin; development mặc định dùng mock khi biến này chưa được khai báo.
- `NEXT_PUBLIC_MAP_TILE_URL` và `NEXT_PUBLIC_MAP_TILE_ATTRIBUTION`: tile provider và attribution.
- `NEXT_PUBLIC_DEVICE_MAP_POLL_MS`: chu kỳ polling, chỉ nhận 3.000–5.000 ms.

Với `.env.example` mặc định, mở `http://localhost:3000/map` sẽ hiển thị 120 thiết bị mẫu. Xe bus
di chuyển theo mỗi chu kỳ poll; camera, cảm biến và tủ điều khiển giữ nguyên vị trí. Để nối backend
thật, đặt `NEXT_PUBLIC_USE_MOCK_API=false` và cấu hình `NEXT_PUBLIC_API_BASE_URL`.

Backend phải triển khai [OpenAPI contract](specs/001-realtime-device-map/contracts/device-map.openapi.yaml).
Khi backend chưa sẵn sàng, test dùng MSW handlers trong `tests/mocks/device-map/`; mock không thay thế
provider-contract gate với backend thật.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/validate-sdlc.ps1
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

Trên PowerShell 7/macOS/Linux, dùng `pwsh -File scripts/validate-sdlc.ps1`.

Nếu API trả `422 VIEWPORT_TOO_DENSE`, giao diện giữ nguyên tính nguyên tử của snapshot và yêu cầu zoom
in hoặc lọc; không render dữ liệu truncate. Provider suite dùng `PROVIDER_CONTRACT_BASE_URL` và chỉ
đóng gate khi backend thật xác nhận ETag đổi lúc thiết bị tự chuyển offline sau 30 giây.

## Device management

Mở `/devices` để quản lý object/device, feature audit, enforcement approval và preset PTZ. Local mock
được MSW intercept khi chạy development (hoặc Playwright tại `127.0.0.1`); mọi request vẫn đi qua shared
Axios client. Contract chuẩn là [Device Management OpenAPI](specs/002-device-management/contracts/device-management.openapi.yaml).

Provider contract, transaction audit và approval evidence vẫn là release gate với backend thật; xem
[provider integration checklist](specs/002-device-management/checklists/provider-integration.md).
