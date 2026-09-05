# Research: Quản lý thiết bị và hiệu chỉnh camera

## 1. Resource contract and concurrency

**Decision**: Dùng resource-oriented HTTP contract, cursor pagination, ETag trên resource detail và
`If-Match` bắt buộc cho update/soft delete. Object/device/preset update dùng full-replacement `PUT`.
Feature và enforcement request representation mang opaque `etag`; client không suy diễn ETag từ
`version`. Server trả `412 VERSION_CONFLICT` khi revision cũ. Create không dùng ETag mà dựa trên
uniqueness cùng `Idempotency-Key`; mọi mutation `POST`/`PUT`/`DELETE` đều yêu cầu idempotency key.

**Rationale**: Danh mục 10.000 device cần pagination ổn định; optimistic concurrency bảo vệ thay đổi
của nhiều quản trị viên mà không khóa form lâu. Draft được giữ để người dùng compare/retry.

**Alternatives considered**: Offset pagination đơn giản nhưng dễ lặp/bỏ row khi catalog thay đổi;
last-write-wins vi phạm yêu cầu không overwrite; pessimistic lock tạo lock mồ côi và UX kém.

## 2. Server state and request cancellation

**Decision**: Tách Zustand server state thành catalog, feature/approval và preset; UI filter/selection
ở store riêng, form draft local. List/search dùng AbortController và generation/query-key guard.

**Rationale**: Các domain có lifecycle và mutation frequency khác nhau. Abort cộng generation guard
ngăn response cũ ghi đè khi người dùng gõ/lọc nhanh, kể cả provider không dừng xử lý ngay khi abort.

**Alternatives considered**: Một store lớn làm mutation lan rộng; TanStack Query bị constitution cấm;
chỉ abort mà không generation guard chưa đủ chống response race.

## 3. Enforcement approval and audit atomicity

**Decision**: Enforcement enable là request state machine `pending -> approved|rejected`.
Requester bắt buộc reason; approver có quyền và khác requester. Approve atomically cập nhật effective
feature, đóng request và append audit; reject không enable feature và vẫn append event.

**Rationale**: Phân biệt desired state và effective state đáp ứng lựa chọn C, tạo separation of duties
và không cho trạng thái xử phạt tồn tại thiếu bằng chứng audit.

**Alternatives considered**: Toggle ngay rồi audit sau tạo khoảng không kiểm soát; warning-only không
phải approval; ghi feature và history bằng hai request làm mất tính nguyên tử.

## 4. Device capability and PTZ constraints

**Decision**: Device-type catalog trả capability và `ptz_constraints` gồm min/max/step cho pan, tilt,
zoom. Camera có PTZ/LPR capability phải có metadata này; frontend không dùng range toàn cục.

**Rationale**: Các model camera có range và zoom khác nhau. Metadata giúp cùng form vẫn validate chính
xác mà chưa cần dynamic config schema hoàn chỉnh.

**Alternatives considered**: Hard-code range phổ biến có thể chấp nhận giá trị phần cứng không hỗ trợ;
cho nhập số bất kỳ đẩy lỗi muộn và làm calibration khó hiểu.

## 5. JSON configuration editor

**Decision**: MVP dùng textarea có format/parse và báo line/column; model JSON dùng recursive
`JsonValue`. Client validate cú pháp, server validate JSON và rule nghiệp vụ được biết.

**Rationale**: Đáp ứng config đa dạng mà không giả định schema chưa tồn tại, vẫn giữ strict typing ở
boundary và giữ raw draft khi parse thất bại.

**Alternatives considered**: Form động cần schema chưa có; editor package mới tăng dependency và có
thể vi phạm UI-system constraint; chỉ validate server làm mất nội dung/feedback chậm.

## 6. Polygon representation and validation

**Decision**: Enforcement zone dùng GeoJSON Polygon CRS84, coordinate order longitude/latitude, một
outer ring khép kín trong MVP, tối đa 500 vertices. Client và server kiểm tra range, ba đỉnh phân biệt,
closed ring, diện tích dương và không self-intersection. Server là authority.

**Rationale**: GeoJSON tương thích PostGIS và map stack hiện có. Validation kép cho feedback nhanh mà
không tin dữ liệu client. Vertex bound giữ interaction/payload dự đoán được.

**Alternatives considered**: WKT khó chỉnh sửa/type; latitude-first dễ đảo trục; plugin drawing mới
không cần thiết vì Leaflet event primitives đủ cho point/polygon MVP.

## 7. Accessible map editing

**Decision**: Mỗi point/polygon có coordinate input/table tương đương, keyboard add/remove/reorder,
undo/reset và error text liên kết; map không phải con đường duy nhất để hoàn tất tác vụ.

**Rationale**: Canvas/map gesture đơn thuần không đủ cho keyboard hoặc tọa độ chính xác. Biểu diễn kép
cũng giúp kỹ thuật viên sửa trực tiếp và test hình học ổn định.

**Alternatives considered**: Chỉ pointer/touch loại trừ keyboard; chỉ nhập tọa độ làm mất khả năng
hiệu chỉnh trực quan tại hiện trường.

## 8. Mock fidelity and provider gate

**Decision**: MSW dùng cùng OpenAPI examples/schema cho browser và Node tests. Provider suite phải pass
với backend thật trước release, bao gồm atomic audit, approval, concurrency, soft delete và geometry.

**Rationale**: Mock cho phép frontend tiến triển khi API chưa có nhưng contract drift là rủi ro lớn
nhất. Provider gate biến các invariant quan trọng thành điều kiện release có thể kiểm chứng.

**Alternatives considered**: Next-only ad-hoc mock dễ khác backend contract; chờ backend chặn toàn bộ
frontend; chỉ schema validation không chứng minh transaction/state transitions.

## 9. Performance profile

**Decision**: Test trên máy 4 vCPU/8 GB RAM, Chromium headless qua Playwright, network throttle Fast
3G/4G và fixed seed 10.000 device (kèm dataset 2.000 device), page 50/100, polygon 500 vertices. Chạy
một warm-up rồi ba measured runs, mỗi run ít nhất 100 list/filter/page operations; lấy p95 từng run và
đánh giá median của ba p95 không quá hai giây. Create object/device và calibration chạy một warm-up rồi
ít nhất 20 flow độc lập để đo p95 theo SC-002/SC-006.

**Rationale**: Profile tái lập được và đo đúng bounded rendering thay vì cố render toàn catalog.

**Alternatives considered**: Dataset nhỏ không phát hiện unbounded fetch; render 10.000 rows cùng lúc
đi ngược pagination requirement; chỉ đo API không phản ánh kết quả người dùng nhìn thấy.

## 10. Session actor and authorization projection

**Decision**: Contract cung cấp `GET /api/v1/device-management/session-context` trả actor hiện tại và
danh sách permission ổn định. Frontend giữ projection này trong access store riêng để ẩn action không
được phép và chặn self-approval trước khi submit; backend vẫn kiểm tra authorization cho mọi request.

**Rationale**: Approval queue và permission-aware UI không thể dựa vào identity fixture hoặc suy đoán
role. Một nguồn typed, tenant-scoped giúp UI nhất quán nhưng không biến client thành security boundary.

**Alternatives considered**: Hard-code role trong frontend dễ drift; lấy actor từ approval item không
chứng minh quyền; chỉ chờ 403 làm UI hiển thị action mà người dùng không thể thực hiện.
