# Quickstart Validation: Bản đồ thiết bị realtime

## Purpose

Hướng dẫn này xác minh feature end-to-end sau implementation. Nó không thay thế tasks hoặc test
suite. Contract chuẩn nằm tại [contracts/device-map.openapi.yaml](./contracts/device-map.openapi.yaml)
và state rules tại [data-model.md](./data-model.md).

## Prerequisites

- Node.js 22 và npm tương thích.
- Backend hoặc mock server triển khai Device Map API contract.
- Tile provider phù hợp môi trường thử nghiệm.
- Fixture gồm tối thiểu camera LPR, GPS xe bus, cảm biến môi trường và signal controller.
- Performance fixture 2.000 thiết bị; density fixture trên 5.000 thiết bị cho error path.

Repository hiện chưa có application source/package manifest. Các lệnh dưới đây trở thành runnable sau
`/speckit-implement`.

## Install and quality gates

```powershell
npm ci
npm run lint
npm run typecheck
npm test
npm run build
powershell -ExecutionPolicy Bypass -File scripts/validate-sdlc.ps1
```

Expected: tất cả lệnh exit code 0; production build không báo `window is not defined` hoặc hydration
mismatch từ Leaflet.

## Run locally

```powershell
$env:NEXT_PUBLIC_API_BASE_URL = 'http://localhost:8080'
npm run dev
```

Mở route `/map`. Expected: skeleton giữ nguyên kích thước trong lúc Leaflet chunk tải, sau đó bản đồ
hiển thị mà không reload trang.

## Scenario 1: Initial viewport and fixed devices

1. Mock `200` snapshot có đủ bốn device types, trong đó camera/controller/sensor là fixed.
2. Mở `/map` và ghi lại request đầu.
3. Phát thêm telemetry có jitter cho fixed device.

Expected:

- Request chứa bbox theo `minLon,minLat,maxLon,maxLat`; không có request tải toàn fleet.
- Icon đúng device type; unknown type dùng fallback.
- Fixed marker lấy object-derived canonical position và không dịch chuyển/animate.
- Online/offline không chỉ phân biệt bằng màu.

## Scenario 2: Mobile interpolation and GPS validity

1. Trả bus mobile, `is_static=false`, có position version 10, course và speed hợp lệ.
2. Poll kế tiếp trả fix hợp lệ version 11 cách khoảng năm giây.
3. Sau đó trả telemetry `latest_gps_status=V` nhưng position version vẫn 11.

Expected:

- Bus retarget từ vị trí đang hiển thị đến fix 11, không snap và không update Zustand theo từng frame.
- Heading quay theo shortest angle; Leaflet pan/zoom không mất transform định vị.
- Void fix không đổi canonical marker position.
- Khi `prefers-reduced-motion` bật, marker snap/giảm motion an toàn.

## Scenario 3: Static mobile device

1. Trả mobile device với `is_static=true` và GPS jitter.
2. Poll nhiều lần, sau đó đổi `is_static=false` với fix hợp lệ mới.

Expected: marker đứng yên khi static; khi trở lại moving, fix mới trở thành target mà không tạo marker
trùng.

## Scenario 4: Poll cancellation and stale response

1. Delay request A lâu hơn bốn giây.
2. Cho tick kế tiếp tạo request B.
3. Trong lúc B chạy, pan map để tạo query C.
4. Cho A và B trả sau C.

Expected:

- A bị abort khi B bắt đầu; B bị abort khi viewport đổi.
- Chỉ C có generation/query key hiện tại được commit.
- Cancellation không hiện error; cleanup khi rời `/map` để lại zero interval và zero active request.
- React Strict Mode setup-cleanup-setup vẫn chỉ có một poller active.

## Scenario 5: Snapshot reconciliation and ETag

1. Snapshot đầu trả IDs A, B, C.
2. Snapshot sau cùng query trả B version mới, C không đổi, D mới; A biến mất.
3. Poll tiếp gửi `If-None-Match` và backend trả `304`.

Expected:

- Map được clone/commit một lần mỗi `200`; visible membership trở thành B, C, D.
- A không còn marker; B chỉ bị thay nếu `state_version` mới hơn; C giữ object reference.
- `304` không rebuild Map nhưng cập nhật freshness.

## Scenario 6: Offline and failure states

1. Dùng server `generated_at` và `last_seen_at` lần lượt 29 giây và 31 giây trước snapshot.
2. Sau một success, tạo network error; sau đó trả success mới.

Expected:

- Thiết bị 29 giây online; thiết bị 31 giây offline.
- Network error giữ snapshot, hiển thị stale/last-success; success tiếp theo tự phục hồi.
- Abort không bị tính là network error.

## Scenario 7: Filters, selection and accessibility

1. Lọc theo device type/status, tìm theo code rồi mở marker bằng mouse, keyboard và touch.
2. Cho snapshot kế tiếp loại selected device khỏi active query.

Expected: query phản ánh filters; detail panel có đủ field theo spec; selection được clear khi thiết bị
không còn trong complete snapshot; focus và status text vẫn hiểu được không cần màu.

## Scenario 8: Scale and density guard

1. Chạy fixture 2.000 device, có tỷ lệ mobile đang move đại diện production.
2. Đo initial display, pan/zoom/filter/select, frame rate và số store commits.
3. Trả `422 VIEWPORT_TOO_DENSE` với `matched > 5000`.

Expected:

- Đạt các SC-001, SC-002 và mục tiêu ít nhất 30 fps của plan.
- Một poll tạo tối đa một Map clone/store commit; chỉ marker đang di chuyển tham gia rAF.
- `422` không render partial data và hướng dẫn người dùng zoom hoặc lọc.

## Evidence to retain

- CI logs của lint/typecheck/unit/build/e2e.
- Network trace chứng minh bbox, abort và conditional request.
- Performance report cho fixture 2.000 thiết bị.
- Screenshot/video fixed, moving, offline, stale và too-dense states.
