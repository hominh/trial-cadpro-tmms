# Quickstart Validation: Quản lý thiết bị và hiệu chỉnh camera

## Purpose

Hướng dẫn này xác minh feature end-to-end sau implementation. Contract chuẩn nằm tại
[contracts/device-management.openapi.yaml](./contracts/device-management.openapi.yaml), entity và
state transition tại [data-model.md](./data-model.md).

## Prerequisites

- Node.js 22 và dependencies đã cài bằng `npm ci`.
- Backend thật triển khai Device Management contract, hoặc MSW fallback dùng đúng contract để phát
  triển song song.
- Tài khoản thử nghiệm: requester có quyền cấu hình, approver là quản trị viên khác requester, auditor
  có quyền xem lịch sử, và một tài khoản không có quyền.
- Catalog seed có object/device types, feature thường, feature enforcement, camera PTZ/LPR kèm
  `ptz_constraints`.
- Dataset cố định 10.000 device; ít nhất 2.000 device cho scale checks; polygon fixture đến 500 vertices.
- Performance runner cố định 4 vCPU/8 GB RAM, Chromium headless qua Playwright và network throttle
  Fast 3G/4G; seed script phải deterministic và ghi hash/version vào report.

MSW pass chỉ là provisional. Integration/release chỉ pass khi provider contract suite chạy xanh với
backend thật và chứng minh transaction/audit semantics.

## Install and quality gates

```powershell
npm ci
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
powershell -ExecutionPolicy Bypass -File scripts/validate-sdlc.ps1
```

Expected: tất cả lệnh exit code 0; build không có lỗi Leaflet SSR/hydration; architecture validation
không phát hiện direct fetch, feature-local Axios, TanStack Query, UI library khác hoặc mixed stores.

## Mock mode

1. Khởi động MSW browser worker với handlers trong `tests/mocks/device-management/`.
2. Dùng fixed seed để tạo catalogs, 10.000 devices, feature/history, pending approvals và presets.
3. Chạy `npm run dev`, mở `/devices`.

Expected: mọi request vẫn đi qua shared Axios và bị MSW intercept theo OpenAPI; fixtures có thể tái lập
duplicate, 412 conflict, audit failure, invalid polygon và approval decisions.

## Provider contract gate

Chạy `tests/contract/device-management-provider.contract.spec.ts` với URL backend thật và seeded tenant.
Suite MUST xác minh:

- Session context trả đúng current actor và permission list; backend vẫn trả 403 cho mutation/audit
  không được phép dù client có ẩn action.
- Response shape, cursor/page limit và combined filters.
- ETag/`If-Match`; feature và approval items cung cấp opaque `etag`, stale mutation trả
  `412 VERSION_CONFLICT` và không đổi resource. Create được kiểm soát bằng uniqueness/idempotency,
  không yêu cầu ETag.
- Duplicate object/device code, kể cả tái sử dụng code của record đã soft delete, và
  `(device_id,preset_no)` trả problem code đúng.
- Device feature update và history append commit nguyên tử; forced audit failure không đổi effective state.
- Enforcement request vẫn disabled khi pending; self-approval bị chặn; authorized different-user approve
  atomically enables feature và appends decision/history; reject không enables.
- Soft delete loại record khỏi default list nhưng history vẫn truy vấn được; object có active device
  không thể soft delete.
- Invalid geometry/PTZ bị từ chối; calibration metadata do server derive.

Expected: toàn bộ provider suite pass trước khi integration tasks được Done.

## Scenario 1: Device list and filters

1. Mở `/devices` với dataset 10.000 device.
2. Kết hợp object, object type, device type, status và partial code/name query khác hoa thường.
3. Đổi page tới khi hết cursor.
4. Gõ liên tiếp nhiều query để request cũ trả sau request mới.

Expected: mỗi response có tối đa 100 row, filter giao nhau chính xác, default list không có soft-deleted
device, request cũ bị abort/ignored và không thay kết quả mới. Trên profile đã định nghĩa, chạy một
warm-up và ba measured runs với ít nhất 100 thao tác mỗi run; median của ba p95 không quá hai giây.

## Scenario 2: Create object and device

1. Mở create device và tìm object có sẵn bằng bounded object picker.
2. Chọn tạo object mới, đặt điểm trên map hoặc nhập tọa độ bằng keyboard, nhập `attrs` JSON, rồi lưu.
3. Tạo device gắn object mới với valid JSON config.
4. Thử malformed JSON và duplicate code.

Expected: object/device hợp lệ xuất hiện trong list; tọa độ lưu theo longitude/latitude; malformed
`object.attrs` hoặc `device.config` và duplicate bị chỉ đúng field, giữ nguyên draft. Playwright chạy
một warm-up rồi ít nhất 20 flow độc lập; 100% flow hợp lệ hoàn tất và p95 không quá ba phút.

## Scenario 3: Edit conflict and soft delete

1. Hai session mở cùng một device; session A lưu trước, session B lưu với ETag cũ.
2. Soft delete device rồi tải default list và audit history.
3. Thử soft delete object vẫn còn active device.

Expected: session B nhận conflict, giữ draft và được yêu cầu reload/compare; deleted device biến khỏi list
nhưng history còn; object delete bị chặn với hướng dẫn xử lý device.

## Scenario 4: Normal feature and append-only history

1. Mở detail của device có feature thường; xác minh mọi capability đều xuất hiện, feature chưa có state
   được hiển thị disabled.
2. Enable, đổi config rồi disable feature.
3. Mô phỏng audit write failure.

Expected: mỗi success tạo đúng một event theo `valid_from DESC`; UI không có edit/delete history;
audit failure không đổi effective feature và retry không tạo duplicate nhờ idempotency key.

## Scenario 5: Enforcement approval

1. Requester gửi enable request kèm reason cho enforcement feature.
2. Xác minh feature pending nhưng effective disabled.
3. Thử requester tự approve, sau đó để một approver khác approve.
4. Lặp lại với reject.

Expected: self-approval bị chặn; approve atomically enables và ghi request/decision/history; reject giữ
disabled; terminal request không quyết định lần hai; cùng device-feature không có hai pending requests.

## Scenario 6: Preset draft and calibration

1. Trên camera PTZ/LPR, tạo preset thiếu polygon rồi lưu draft.
2. Nhập pan/tilt/zoom trong metadata range, lane label và approach.
3. Vẽ polygon hợp lệ, chỉnh bằng coordinate table rồi lưu.
4. Xóa một giá trị required và lưu lại.

Expected: draft ban đầu chưa calibrated; đủ dữ liệu thì server trả calibrated time/user; xóa required
value đưa preset về draft và clear metadata cũ. Playwright chạy một warm-up rồi ít nhất 20 flow độc lập;
pointer/keyboard flows hợp lệ hoàn tất 100% và p95 không quá năm phút (touch được kiểm tra riêng).

## Scenario 7: Geometry and uniqueness guards

Thử preset number trùng trên cùng device, cùng số trên device khác, polygon dưới ba đỉnh, zero-area,
self-intersecting, out-of-range, antimeridian-crossing và polygon 501 vertices.

Expected: chỉ cùng preset number trên device khác được phép; các case geometry invalid bị từ chối với
field error, bản vẽ được giữ để sửa; map và coordinate table luôn biểu diễn cùng geometry.

## Scenario 8: Capability and authorization

1. Mở preset trên device không có PTZ/LPR.
2. Thử enable feature ngoài device-type capability.
3. Xác minh `/api/v1/device-management/session-context` phản ánh đúng actor/quyền, sau đó dùng tài khoản
   không quyền để gọi trực tiếp mutation và audit query.
4. Đổi device type khi còn unsupported enabled feature/preset.

Expected: preset action không xuất hiện, unsupported feature/type transition bị chặn, server trả 403
cho action không quyền và dữ liệu audit không bị lộ.

## Scenario 9: Scale and accessibility

1. Trên runner 4 vCPU/8 GB, Chromium headless và Fast 3G/4G, với fixed seed 10.000 device, chạy một
   warm-up và ba measured runs, mỗi run ít nhất 100 list/filter/page/select operations; ghi từng p95 và
   median của ba p95.
2. Edit polygon 500 vertices, pan/zoom, drag/add/remove/reorder vertex.
3. Chạy keyboard/focus/accessible-name/error announcement/touch-target checks.

Expected: SC-001/SC-009 pass, page không vượt 100 rows, polygon interaction đạt tối thiểu 30 fps, không
unbounded request, focus được phục hồi sau dialog/sheet và trạng thái/error không chỉ dựa vào màu.

## Evidence to retain

- CI logs cho lint, strict typecheck, unit/component, E2E, build và architecture validation.
- Provider contract report từ backend thật và database/transaction evidence cho audit atomicity.
- Network traces cho pagination, combined filters, AbortSignal, ETag/If-Match và idempotency retry.
- E2E screenshots/video cho create flow, conflict, pending/approve/reject, history và preset editor.
- Performance report ghi seed hash/version, 4 vCPU/8 GB RAM, Chromium headless, Fast 3G/4G, warm-up,
  operation/flow count, ba measured runs, từng p95 và median của ba p95, page size, polygon vertex count,
  FPS và memory.
