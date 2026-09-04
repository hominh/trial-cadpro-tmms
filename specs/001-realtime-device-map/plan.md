# Implementation Plan: Bản đồ thiết bị realtime

**Branch**: `001-realtime-device-map` | **Date**: 2026-09-04 |
**Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-realtime-device-map/spec.md`

## Summary

Xây dựng màn hình bản đồ gần thời gian thực cho thiết bị cố định và di động. Next.js App Router giữ
route shell ở server side, còn Leaflet được cô lập trong client boundary và tải động. Dữ liệu được
poll trực tiếp qua shared Axios instance theo viewport; một store Zustand quản lý snapshot
`Map<device_id, DeviceState>`, store còn lại quản lý viewport, filters và selection. Mỗi chu kỳ hủy
request cũ, dùng generation guard chống stale response, rồi upsert theo version và reconcile toàn bộ
membership của snapshot. Marker di động dùng một scheduler `requestAnimationFrame` chung để nội suy
giữa hai fix hợp lệ; marker fixed/static không animate.

## Technical Context

**Language/Version**: TypeScript strict mode trên Node.js 22; Next.js App Router và React phiên bản
stable tương thích tại thời điểm scaffold

**Primary Dependencies**: Next.js, React, shadcn/ui, Axios, Zustand, Leaflet, react-leaflet

**Storage**: Không lưu client-side lâu dài; snapshot hiện tại nằm trong Zustand `Map`. Nguồn backend
là `device_state` kết hợp registry `object`, `device`, `device_type` và `device_preset`

**Testing**: Vitest, React Testing Library, fake timers cho polling/motion, Axios mocking và MSW cho
consumer contract/dev fallback, provider contract test với backend thật, Playwright cho luồng bản đồ
end-to-end và kiểm thử hiệu năng bằng fixture 2.000–5.000 thiết bị

**Target Platform**: Web desktop-first, responsive cho tablet; evergreen Chromium, Firefox và Safari

**Project Type**: Next.js web application, greenfield source trong repository governance hiện có

**Performance Goals**: Marker tương tác xuất hiện trong 2 giây ở p95; pan/zoom/filter/select phản hồi
trong 1 giây ở p95; animation của marker đang di chuyển duy trì tối thiểu 30 fps dưới fixture 2.000
thiết bị và hướng tới 60 fps ở mật độ viewport thông thường; Playwright search-to-complete-detail-panel
trên fixture 5.000 thiết bị đạt p95 không quá 10 giây

**Performance Test Profile**: Runner 4 vCPU/8 GB RAM; Chromium headless qua Playwright; network
throttle `Fast 3G/4G`; viewport fixture đúng 5.000 thiết bị với khoảng 40% mobile và 60% static từ seed
script cố định; chạy một lần warm-up rồi ba lần đo và dùng trung vị của ba lần đo để báo cáo

**Constraints**: Poll mặc định 4 giây, cho phép 3–5 giây; offline sau 30 giây; bbox bắt buộc; tối đa
5.000 item/snapshot không truncate; không direct `fetch`, TanStack Query, Axios instance riêng hoặc UI
library ngoài shadcn/ui; Leaflet chỉ chạy client-side; request cũ phải được abort và response cũ bị bỏ

**Scale/Scope**: Tối thiểu 2.000 thiết bị toàn hệ thống; endpoint hỗ trợ tối đa 5.000 thiết bị trong
một viewport; chỉ marker mobile, non-static, visible và có fix hợp lệ mới tham gia animation

## Constitution Check

*GATE: Passed before Phase 0 and re-checked after Phase 1 design.*

- **Strict TypeScript — PASS**: `strict: true` là gate scaffold; contract và store có kiểu tường minh,
  không dùng `any` hoặc untyped empty `Map`.
- **Feature ownership — PASS**: Toàn bộ map logic thuộc
  `src/features/realtime-device-map/`. `src/helpers/api` chỉ chứa Axios foundation dùng chung;
  `src/components/ui` chỉ chứa shadcn/ui primitives.
- **API boundary — PASS**: `device-map-api.ts` chỉ gọi shared Axios instance. Không có direct `fetch`
  hoặc feature-local Axios instance.
- **UI system — PASS**: Sheet/Drawer, Button, Input, Select, Badge, Tooltip, Skeleton và Alert của
  shadcn/ui tạo chrome UI. Leaflet/react-leaflet là engine bản đồ chuyên dụng, không phải component
  library thay thế design system.
- **Data fetching — PASS**: Custom polling coordinator gọi Axios trực tiếp; không dùng TanStack Query
  hoặc SWR.
- **State boundaries — PASS**: `device-state-store.ts` giữ server snapshot; `map-ui-store.ts` giữ
  viewport/filter/selection. Interval, controller, generation và animation frame nằm trong lifecycle
  coordinator/ref, không nằm trong store.
- **Spec-driven gate — PASS**: `spec.md` và requirements checklist đã hoàn tất; plan này được tạo
  trước `tasks.md` và source implementation.
- **Realtime/geo scale — PASS**: Contract bắt buộc bbox, snapshot/version/ETag, giới hạn rõ ràng và
  không truncate. Poller abort request cũ, generation-check response, cleanup khi viewport đổi/unmount.
  Motion dùng một rAF scheduler chung và chỉ cập nhật marker cần chuyển động.

**Post-design re-check**: `research.md`, `data-model.md`, OpenAPI contract và `quickstart.md` đều duy
trì các gate trên. Không có ngoại lệ cần ghi nhận.

## Project Structure

### Documentation (this feature)

```text
specs/001-realtime-device-map/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── device-map.openapi.yaml
├── checklists/
│   └── requirements.md
└── tasks.md                       # Created later by /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── map/
│       └── page.tsx               # Server route shell; composes client loader
├── components/ui/                 # shadcn/ui primitives only
├── features/realtime-device-map/
│   ├── components/
│   │   ├── map-client-loader.tsx  # 'use client' + dynamic import, ssr:false
│   │   ├── device-map.tsx         # MapContainer and viewport event bridge
│   │   ├── device-marker-layer.tsx
│   │   ├── device-detail-panel.tsx
│   │   ├── device-map-filters.tsx
│   │   └── map-status-overlay.tsx
│   ├── hooks/
│   │   ├── use-device-polling.ts
│   │   └── use-marker-motion.ts
│   ├── services/
│   │   └── device-map-api.ts
│   ├── stores/
│   │   ├── device-state-store.ts
│   │   └── map-ui-store.ts
│   ├── types/
│   │   └── device-map.types.ts
│   ├── utils/
│   │   ├── bbox.ts
│   │   ├── device-icon.ts
│   │   └── motion.ts
│   └── index.ts
└── helpers/api/
    └── client.ts                  # One shared Axios instance

tests/
├── fixtures/device-map/
├── performance/device-map.performance.test.ts
└── e2e/device-map.spec.ts
```

**Structure Decision**: Khởi tạo Next.js tại repository root. Route chỉ compose feature; business
logic, state, services, map rendering và tests gần domain nằm trong
`src/features/realtime-device-map`. Chỉ hạ tầng Axios và shadcn/ui primitives được đặt ngoài feature.

## Design Decisions

### Client boundary and map lifecycle

`src/app/map/page.tsx` không import Leaflet. Nó render `map-client-loader.tsx`, một Client Component
dùng `dynamic(() => import('./device-map'), { ssr: false })` và skeleton có kích thước cố định. Mọi
Leaflet stylesheet/import và truy cập `window` nằm phía dưới boundary này. `MapContainer` được tạo một
lần; `moveend` đọc bounds, normalize thành `west,south,east,north` rồi cập nhật UI store khi bounds
thực sự thay đổi.

### Polling and snapshot reconciliation

`use-device-polling.ts` sở hữu đúng một interval cho query key đã normalize. Nó poll ngay khi mount,
sau đó mỗi bốn giây. Trước mỗi request, controller trước bị abort; request mới nhận controller và
generation mới. Viewport/filter đổi hoặc unmount sẽ clear interval, abort và invalidate generation.
Chỉ response có generation/query key hiện tại mới được commit.

Mỗi `200` là snapshot đầy đủ của query. Store clone `Map` đúng một lần, upsert item chỉ khi
`state_version` mới hơn, giữ reference của item không đổi, rồi xóa item không còn thuộc snapshot.
`304` chỉ cập nhật freshness metadata. Lỗi thật giữ snapshot cuối và đánh dấu stale; cancellation
không tạo error. `422 VIEWPORT_TOO_DENSE` yêu cầu người dùng zoom hoặc lọc, không hiển thị dữ liệu bị
cắt cụt.

Backend integration có một provider-contract gate đối chiếu trực tiếp
`contracts/device-map.openapi.yaml`: response shape, ETag/304, `422 VIEWPORT_TOO_DENSE` và việc ETag
thay đổi khi `online` tự chuyển sang offline sau 30 giây dù không có telemetry mới. Khi backend chưa
sẵn sàng, MSW MUST mô phỏng đúng OpenAPI để US1–US3 phát triển song song; kết quả mock không thay thế
provider gate và các integration/E2E checkpoint cuối của US1 không được coi là hoàn tất trước khi gate
PASS với backend thật.

### Marker rendering and motion

`device-marker-layer.tsx` reconcile Leaflet markers theo `device_id` và cache `L.divIcon` theo
`device_type.code`, online/offline, alert và selected state. HTML icon chỉ đến từ enum/asset tin cậy.
Leaflet sở hữu transform của marker ngoài; hướng được xoay trên phần tử con.

Một rAF scheduler dùng chung giữ motion track tạm thời ngoài Zustand. Khi mobile marker nhận fix mới
hợp lệ, track lấy vị trí đang hiển thị làm điểm đầu và vị trí mới làm đích, retarget bằng easing
`linear`. Thời lượng animation bằng đúng thời gian trôi qua giữa hai fix hợp lệ. Marker chỉ snap tức
thời nếu tốc độ suy ra từ khoảng cách hai điểm lớn hơn 120 km/h hoặc khoảng thời gian giữa hai fix lớn
hơn tám giây. Không ngoại suy vô hạn quá fix xác nhận. Static/fixed, tọa độ lỗi hoặc GPS void không tạo
motion track. Background tab/resume tiếp tục tính vị trí theo elapsed time; `prefers-reduced-motion`
loại bỏ hiệu ứng không thiết yếu nhưng không tạo thêm điều kiện snap ngoài hai ngưỡng trên.

### Failure and density strategy

Snapshot cuối tiếp tục hiển thị khi mạng lỗi, kèm stale overlay và last-success time. Backoff không
thay polling cadence trong phiên bản đầu; server `429`/`Retry-After` được tôn trọng trước khi khởi
động lại interval. Nếu performance test 2.000 marker không đạt 30 fps, implementation MUST tối ưu
imperative layer/icon DOM trước; clustering/canvas/WebGL là thay đổi UX/architecture cần cập nhật
spec và plan, không được tự thêm trong implementation.

## Complexity Tracking

Không có Constitution Check violation. Leaflet/react-leaflet là dependency domain-specific cần để
render bản đồ và không cung cấp design system cạnh tranh với shadcn/ui.
