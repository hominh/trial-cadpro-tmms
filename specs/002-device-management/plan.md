# Implementation Plan: Quản lý thiết bị và hiệu chỉnh camera

**Branch**: `002-device-management` (logical; Git branch chưa được tạo) | **Date**: 2026-09-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-device-management/spec.md`

## Summary

Xây dựng module quản trị có danh sách phân trang cho object/device, form CRUD với JSON config, capability
và feature audit, approval queue cho enforcement, cùng trình hiệu chỉnh preset PTZ và polygon. Frontend
dùng contract typed qua Axios chung, các store Zustand tách theo domain, Leaflet chỉ được tải phía client,
và MSW mô phỏng đúng OpenAPI trong lúc chờ backend. Mutation sửa/toggle/xóa dùng optimistic concurrency,
mọi mutation dùng idempotency key; feature state, approval và audit phải được backend commit nguyên tử.

## Technical Context

**Language/Version**: TypeScript 5.9 strict; Node.js 22; React 19

**Primary Dependencies**: Next.js 15.5 App Router, Axios 1.11, Zustand 5, shadcn/ui primitives,
Leaflet 1.9 và react-leaflet 5; không thêm TanStack Query hoặc UI framework khác

**Storage**: Frontend không sở hữu persistent storage; backend dự kiến lưu PostgreSQL/PostGIS. Form
draft chỉ tồn tại trong component/UI store và không được coi là dữ liệu đã lưu.

**Testing**: Vitest, React Testing Library, jsdom, MSW, Playwright Chromium, provider contract tests
đối chiếu `contracts/device-management.openapi.yaml`

**Target Platform**: Web desktop và tablet hiện đại; server rendering cho route shell, client-only cho
Leaflet editor

**Project Type**: Next.js web application

**Performance Goals**: Trên profile cố định 4 vCPU/8 GB RAM, Chromium headless qua Playwright và
network throttle Fast 3G/4G, median của ba giá trị p95 (sau một warm-up, mỗi run ít nhất 100
list/filter/page operations) không quá 2 giây trên catalog 10.000 device; một page tối đa 100 row;
polygon editing duy trì tối thiểu 30 fps với 500 vertices. Playwright usability flows chạy một warm-up
và ít nhất 20 flow độc lập để đo p95 cho create object/device và calibration.

**Constraints**: HTTP chỉ qua shared Axios; mutation sửa/toggle/xóa cần ETag/`If-Match`, create dùng
uniqueness thay vì ETag; request list/search cũ phải abort; audit append-only và transaction-atomic;
không unbounded catalog fetch; GeoJSON dùng CRS84
longitude/latitude; Leaflet không được vào server module graph

**Scale/Scope**: 10.000 device trong catalog test, ít nhất 2.000 device cho constitution scale;
object/device/feature/history/approval/preset; page size mặc định 50, tối đa 100; polygon tối đa 500
vertices trong MVP

## Constitution Check

*GATE: PASS before Phase 0; PASS again after Phase 1 design.*

- **Strict TypeScript — PASS**: DTO, entity, mutation, problem và geometry đều có type cụ thể; không
  dùng unbounded `any` hay tắt strict checks. JSON config được biểu diễn bằng recursive `JsonValue`.
- **Feature ownership — PASS**: toàn bộ module thuộc `src/features/device-management/`. Chỉ shared
  Axios client, shadcn primitives và Leaflet CSS hiện có nằm ngoài feature vì đã có nhiều consumer.
- **API boundary — PASS**: service feature dùng duy nhất `src/helpers/api/client.ts`; không gọi
  `fetch` và không tạo Axios instance khác.
- **UI system — PASS**: dùng Button, Input, Select, Badge, Alert, Dialog/AlertDialog, Tabs, Sheet,
  Table, Textarea, Label, Switch và project-owned JSON/polygon editors theo shadcn conventions.
- **Data fetching — PASS**: gọi Axios trực tiếp; không đưa TanStack Query vào dependency graph.
- **State boundaries — PASS**: `device-catalog-store`, `device-feature-store`, `device-preset-store`
  giữ server state theo domain; `device-management-access-store` giữ actor/quyền từ session context;
  `device-management-ui-store` giữ filter/selection/approval panel.
  Draft form và geometry edit cục bộ ở component, không đưa vào store server.
- **Spec-driven gate — PASS**: `spec.md` đã Ready for planning; plan này có trước tasks/implementation.
- **Realtime/geo scale — PASS**: không polling. List dùng cursor/page limit; mỗi search/filter abort
  request trước bằng AbortController và generation guard. Map chỉ tải tile/context đang xem, Leaflet
  được dynamic import client-only; 2.000/10.000-device fixture và polygon performance được kiểm thử.

### Post-design re-check

PASS. OpenAPI quy định phân trang, `If-Match`, error semantics và geometry bounds; data model quy định
atomic audit/approval transitions; quickstart kiểm tra cancellation, scale và client-only Leaflet.
Không có exception cần Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/002-device-management/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── device-management.openapi.yaml
├── checklists/
│   └── requirements.md
└── tasks.md                         # generated later by /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── app/
│   └── devices/
│       ├── page.tsx                 # server route shell
│       └── [deviceId]/page.tsx      # server route shell
├── components/ui/                   # existing/new shadcn primitives only
├── features/device-management/
│   ├── components/
│   │   ├── device-list/
│   │   ├── device-form/
│   │   ├── feature-management/
│   │   └── preset-calibration/
│   ├── hooks/                       # abortable list/detail operations
│   ├── services/                    # typed calls through shared Axios
│   ├── stores/
│   │   ├── device-catalog-store.ts
│   │   ├── device-feature-store.ts
│   │   ├── device-preset-store.ts
│   │   ├── device-management-access-store.ts
│   │   └── device-management-ui-store.ts
│   ├── types/
│   ├── utils/                       # JSON and polygon validation
│   └── index.ts
├── helpers/api/client.ts
└── test/

tests/
├── contract/device-management-provider.contract.spec.ts
├── e2e/device-management*.spec.ts
├── fixtures/device-management/
└── mocks/device-management/
```

**Structure Decision**: Một feature boundary `device-management` sở hữu tất cả luồng quản trị. Route
App Router chỉ compose public exports. Shared Axios và các shadcn primitive tiếp tục dùng vị trí hiện
có vì là hạ tầng đa feature. Leaflet polygon editor nằm trong feature nhưng tái sử dụng dependency và
CSS map đã có; không chia sẻ sớm một abstraction chưa có consumer thứ hai rõ ràng.

## Design Decisions

### Request lifecycle and consistency

- List query được normalize theo cursor, limit, filters và search; mỗi thay đổi abort request trước,
  tăng generation và chỉ commit response của generation hiện tại.
- Detail resources trả ETag. Object/device/preset update là full-replacement `PUT`; update/delete gửi
  `If-Match`; `412 VERSION_CONFLICT` giữ draft và yêu cầu reload/compare thay vì overwrite.
- Feature projections và enforcement request summaries/items mang opaque `etag` trong representation để
  toggle/decision có thể gửi `If-Match` mà không suy diễn ETag từ `version`.
- Mutation thành công invalidates/refetch đúng domain store; không optimistic-enable enforcement.
- Mọi mutation `POST`/`PUT`/`DELETE` nhận `Idempotency-Key` để retry an toàn sau timeout.
- Frontend nạp actor và permission list từ `/api/v1/device-management/session-context` để ẩn/hiện action
  và chặn self-approval sớm; backend vẫn là authority và phải trả 403 khi không đủ quyền.

### Enforcement approval

- Non-enforcement feature toggle được cập nhật trực tiếp và atomic với một history event.
- Enforcement enable tạo `pending` request bắt buộc reason; effective feature vẫn disabled.
- Approver phải có quyền và khác requester. Approve atomically enables feature, closes request và
  appends decision/history; reject closes request without enabling. Mỗi device-feature chỉ có tối đa
  một pending enable request.

### Forms and geospatial editing

- Object/device forms giữ draft local; JSON editor là shadcn Textarea với parse/format/error position,
  sử dụng `JsonValue` thay vì `any`.
- Map editor dynamic import `ssr: false`. Point picker và polygon editor dùng Leaflet events/project
  components, không thêm UI/map drawing library.
- Polygon editor có bảng tọa độ tương đương cho bàn phím, undo/reset, giữ draft khi lỗi, validate
  coordinate range, closed ring, 3..500 distinct vertices, positive area và no self-intersection trước submit;
  backend là authority và lặp lại validation.
- PTZ constraints đến từ device-type catalog. Device type hỗ trợ PTZ/LPR bắt buộc cung cấp min/max/step
  cho pan, tilt, zoom; không hard-code giới hạn chung cho mọi camera.

### Mock and backend readiness

- MSW browser/node handlers dùng cùng response examples và status codes trong OpenAPI, có deterministic
  fixtures 2.000/10.000 device, conflict, duplicate, audit failure và approval transitions.
- Provider contract suite là release gate cho response shape, pagination, ETag conflicts, atomic audit,
  approval separation, soft-delete retention và polygon validation. Mock pass chỉ cho phép phát triển
  song song, không được coi là backend integration complete.

## Complexity Tracking

Không có constitution violation hoặc exception được đề xuất.
