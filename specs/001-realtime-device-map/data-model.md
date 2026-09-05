# Data Model: Bản đồ thiết bị realtime

## Overview

Frontend nhận một snapshot đã hợp nhất registry và live state. Model phân biệt dữ liệu server có
thẩm quyền, UI state và presentation-only motion state. Không model nào được persisted ở client.

## Domain types

### DeviceId

- Kiểu opaque string; không rỗng.
- Dùng làm key duy nhất trong `devicesById` và Leaflet marker registry.

### GeoPoint

| Field | Type | Validation |
|---|---|---|
| `type` | literal `Point` | Bắt buộc |
| `coordinates[0]` | longitude number | `-180 <= lng <= 180` |
| `coordinates[1]` | latitude number | `-90 <= lat <= 90` |

GeoJSON dùng longitude trước latitude. Adapter sang Leaflet phải đổi thành `[lat, lng]` tại một
boundary duy nhất.

### ViewportBounds

| Field | Type | Validation |
|---|---|---|
| `west` | number | `-180..180` |
| `south` | number | `-90..90` |
| `east` | number | `-180..180`, lớn hơn `west` trong deployment hiện tại |
| `north` | number | `-90..90`, lớn hơn `south` |

Bounds được normalize/round đủ để tránh query key thay đổi vì nhiễu số thực không nhìn thấy.

### DeviceTypeSummary

| Field | Type | Rules |
|---|---|---|
| `code` | string | Bắt buộc; known: `lpr_camera`, `bus_gps`, `env_multi`, `signal_ctrl` |
| `name` | string | Bắt buộc |
| `iconId` | string or null | Chỉ ánh xạ qua icon registry tin cậy |
| `uiPanel` | string or null | Metadata; không dùng để import component tùy ý |

Unknown `code` dùng fallback icon; không làm hỏng snapshot.

### DeviceState

| Field | Type | Rules |
|---|---|---|
| `deviceId` | `DeviceId` | Primary identity |
| `code` | string | Không rỗng, searchable |
| `name` | string | Không rỗng |
| `deviceType` | `DeviceTypeSummary` | Bắt buộc |
| `mobility` | `fixed \| mobile` | Chọn nguồn position, không đồng nghĩa `isStatic` |
| `position` | `GeoPoint` | Canonical valid display position |
| `positionSource` | `object_location \| device_state_valid_gps` | Khớp mobility |
| `positionObservedAt` | ISO date-time | Thời điểm fix/registry position |
| `positionVersion` | non-negative integer | Tăng khi canonical position đổi |
| `stateVersion` | non-negative integer | So sánh toàn bộ item khi merge |
| `lastSeenAt` | ISO date-time | Dùng với snapshot time để xác định online |
| `online` | boolean | Backend tính bằng ngưỡng chung 30 giây |
| `speedKph` | number or null | `>= 0`; chỉ có ý nghĩa với mobile |
| `courseDeg` | number or null | `0 <= value < 360` |
| `isStatic` | boolean | Tạm dừng animation; không đổi mobility |
| `latestGpsStatus` | string or null | `V` không được thay position |
| `alertLevel` | string | Enum backend phải công bố; unknown dùng fallback |
| `activePresetId` | string or null | Optional relation |
| `presetSource` | string or null | Metadata nguồn preset |

Validation invariants:

- `fixed` phải có `positionSource=object_location` và không animate.
- `mobile` phải có `positionSource=device_state_valid_gps`; mobile chưa có valid fix không xuất hiện.
- `latestGpsStatus=V` không được đi kèm position/version mới do chính fix đó tạo ra.
- Item chỉ thay item cùng ID trong store khi `stateVersion` lớn hơn; bằng version và khác nội dung là
  contract error cần telemetry.

### DeviceMapFilters

| Field | Type | Rules |
|---|---|---|
| `deviceTypes` | `Set<string>` | Tối đa 50; empty nghĩa tất cả |
| `status` | `all \| online \| offline` | Mặc định `all` |
| `query` | string | Trimmed, tối đa 100 ký tự |

### DeviceMapSnapshot

| Field | Type | Rules |
|---|---|---|
| `snapshotId` | string | Opaque, query-specific |
| `generatedAt` | ISO date-time | Server time authority |
| `query` | normalized bbox + filters | Phải khớp active query key |
| `offlineThresholdSeconds` | literal `30` | Global policy |
| `returned` | integer | Bằng `items.length` |
| `unlocatedCount` | integer | Thiết bị khớp filter nhưng thiếu position |
| `complete` | literal `true` | Không chấp nhận partial/truncated response |
| `pollAfterMs` | integer | `3000..5000` |
| `items` | `DeviceState[]` | Tối đa 5.000, unique by ID |
| `etag` | string or null | Lưu từ response header cho conditional poll |

## Store models

### DeviceStateStore

```text
devicesById: Map<DeviceId, DeviceState>
visibleIds: Set<DeviceId>
activeQueryKey: string | null
snapshotId: string | null
generatedAt: string | null
lastSuccessAt: number | null
etag: string | null
status: idle | loading | success | stale | error | tooDense
error: DeviceMapError | null
```

Actions:

- `beginRequest(queryKey)`: chuyển loading nhưng giữ snapshot.
- `applySnapshot(queryKey, snapshot, etag)`: clone Map một lần, upsert theo version, reconcile
  `visibleIds`, commit atomically.
- `markNotModified(queryKey, receivedAt)`: refresh freshness, không clone Map.
- `markError(queryKey, error)`: giữ snapshot; chuyển stale nếu đã từng success, ngược lại error.
- `markTooDense(queryKey, matched, maxItems)`: không dùng partial data.
- `reset()`: clear khi feature dispose/auth scope đổi.

Store không chứa viewport, filters, selection, interval, AbortController, generation hoặc rAF state.

### MapUiStore

```text
selectedDeviceId: DeviceId | null
viewportBounds: ViewportBounds | null
filters: DeviceMapFilters
detailPanelOpen: boolean
```

Actions cập nhật từng domain field. Viewport/filter tạo normalized query key mới. Selection bị clear
khi device không còn trong complete active snapshot hoặc người dùng đóng panel.

### MotionTrack (ephemeral, outside Zustand)

```text
deviceId
fromLatLng
toLatLng
startedAt
durationMs
fromCourseDeg
toCourseDeg
positionVersion
```

Track chỉ tồn tại trong motion controller. Một frame không tạo React state hoặc Zustand commit.

## Relationships

```text
ViewportBounds + DeviceMapFilters
        |
        v
NormalizedQueryKey ----> PollCoordinator ----> DeviceMapSnapshot
                                              |
                                              v
                                      DeviceStateStore
                                              |
                          +-------------------+------------------+
                          v                                      v
                  Leaflet Marker Registry                 Detail Panel
                          |
                          v
                   MotionTrack Registry

MapUiStore ------------------------------------> filters / selection / viewport
```

## State transitions

### Poll lifecycle

```text
idle -> loading -> success
                  |   |
                  |   +-> loading (next tick)
                  +------> stale (later real error, snapshot retained)
loading -> error       (first load fails)
loading -> tooDense    (422; no partial snapshot)
any active -> idle     (dispose/reset)
```

Abort/cancel không phải error transition. Response chỉ được apply khi generation và query key vẫn
active.

### Marker motion

```text
fixed ----------------------------> hold canonical position
mobile + void/invalid fix --------> hold last valid position
mobile + isStatic ----------------> hold displayed position
mobile + valid newer fix + moving -> interpolate to confirmed target
interpolating + newer valid fix ---> retarget from current displayed position
inferred speed >120 km/h ----------> snap to confirmed target
valid-fix gap >8 seconds ----------> snap to confirmed target
background/reduced-motion ---------> preserve elapsed-time linear semantics
```

## Error model

- `invalidQuery`: bbox/filter rejected; do not send request repeatedly.
- `tooDense`: matched devices exceed 5.000; prompt zoom/filter.
- `rateLimited`: honor `Retry-After` before recreating interval.
- `network`/`server`: retain last snapshot and show stale state.
- `contract`: malformed/partial snapshot; reject atomically and emit diagnostics.
- `cancelled`: expected control flow; never shown to user.
