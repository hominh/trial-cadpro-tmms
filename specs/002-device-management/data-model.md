# Data Model: Quản lý thiết bị và hiệu chỉnh camera

## Conventions

- IDs là opaque string; client không suy diễn định dạng.
- Timestamp là ISO 8601 UTC.
- Mutable aggregate có `version` tăng đơn điệu. ETag là opaque concurrency token do server cấp; client
  không tự tạo hoặc suy diễn từ `version`.
- Mọi mutation `POST`/`PUT`/`DELETE` nhận `Idempotency-Key`; create dùng idempotency và uniqueness thay
  vì ETag, còn update/soft delete dùng thêm `If-Match`.
- Soft-deletable entity có `deleted_at`; query mặc định loại bản ghi có giá trị này.
- JSON mở dùng recursive `JsonValue`, không dùng `any`.
- Geometry dùng GeoJSON CRS84: `[longitude, latitude]`.

## ObjectType

| Field | Type | Rules |
|---|---|---|
| id | string | Required, immutable |
| code | string | Required, normalized, unique |
| name | string | Required |

Relationship: một ObjectType có nhiều Object. Read-only trong scope này.

## SessionContext

| Field | Type | Rules |
|---|---|---|
| actor | ActorSummary | Người dùng đã xác thực trong tenant hiện tại |
| permissions | string[] | Tập permission ổn định, không trùng lặp |

Frontend dùng SessionContext cho affordance và self-approval guard; backend vẫn là authority cho mọi
kiểm tra quyền. Projection này không được trộn vào catalog, feature hay UI store.

## ObjectRecord

| Field | Type | Rules |
|---|---|---|
| id | string | Required, immutable |
| code | string | 1–100 chars; unique kể cả record soft-deleted trong MVP |
| name | string | 1–255 chars |
| object_type | ObjectType summary | Required |
| location | GeoJSON Point | Longitude -180..180, latitude -90..90 |
| status | string | Thuộc catalog status được backend công bố |
| attrs | JsonObject | Default `{}` |
| version | integer | >=1, optimistic concurrency |
| created_at / updated_at | datetime | Server assigned |
| deleted_at | datetime or null | Null khi active |

Relationships: một ObjectRecord thuộc một ObjectType và có nhiều Device. Soft delete bị chặn khi còn
Device active.

## DeviceType

| Field | Type | Rules |
|---|---|---|
| id | string | Required |
| code / name | string | Required |
| icon_id / ui_panel | string or null | Presentation metadata |
| capabilities | DeviceTypeFeature[] | Authoritative supported features |
| ptz_constraints | PtzConstraints or null | Required when capability contains `ptz` or `lpr` |

`PtzConstraints` contains `{min,max,step}` for pan, tilt and zoom; `min < max`, `step > 0`.

## DeviceRecord

| Field | Type | Rules |
|---|---|---|
| id | string | Required, immutable |
| code | string | 1–100 chars; unique kể cả soft-deleted records in MVP |
| name | string | 1–255 chars |
| serial | string or null | Max 255 chars |
| device_type | DeviceType summary | Required |
| object | Object summary | Required and active |
| config | JsonObject | Valid JSON object; default `{}` |
| status | string | Catalog-backed value |
| last_seen_at | datetime or null | Read-only telemetry projection |
| version | integer | >=1 |
| created_at / updated_at | datetime | Server assigned |
| deleted_at | datetime or null | Null when active |

Relationships: Device belongs to one ObjectRecord and one DeviceType; has DeviceFeature,
DeviceFeatureHistory, EnforcementRequest and DevicePreset children. Changing type is blocked while
enabled features or active presets are unsupported by the target type.

## Feature

| Field | Type | Rules |
|---|---|---|
| id | string | Required |
| code / name | string | Required |
| emits_stream_type_id | string or null | Read-only capability metadata |
| is_enforcement | boolean | Controls approval path |
| map_layer | string or null | Optional presentation metadata |

Read-only in scope.

## DeviceTypeFeature

Join/capability entity between DeviceType and Feature. Presence means hardware supports the feature;
absence means the feature cannot be enabled. May include default config and constraint metadata.

## DeviceFeature

| Field | Type | Rules |
|---|---|---|
| device_id / feature | reference | Composite identity |
| is_enabled | boolean | Effective state only; pending is never represented as enabled |
| config | JsonObject | Feature-specific configuration |
| pending_request | EnforcementRequest summary or null | Only enforcement enable path |
| version | integer | >=1 |
| etag | string | Required opaque token for the next `If-Match` mutation |
| updated_at / updated_by | datetime / actor | Last effective mutation |

Invariant: feature must belong to DeviceType capability. At most one open enforcement enable request
per `(device_id, feature_id)`. `pending_request` summary includes its own opaque `etag`, so a decision
never reuses or derives the parent DeviceFeature token.

## EnforcementRequest

| Field | Type | Rules |
|---|---|---|
| id | string | Required |
| device_id / feature_id | reference | Enforcement feature only |
| requested_config | JsonObject | Desired config at request time |
| reason | string | Required, 1–1000 chars |
| status | pending, approved, rejected | State machine |
| requested_at / requested_by | datetime / actor | Immutable |
| decided_at / decided_by | datetime/actor or null | Both set only after decision |
| decision_note | string or null | Optional, max 1000 chars |
| version | integer | Concurrency token |
| etag | string | Required opaque token for the next decision `If-Match` |

Transitions:

```text
pending -> approved
pending -> rejected
```

- Approver must differ from requester.
- `approved` atomically sets DeviceFeature `is_enabled=true`, stores requested config and appends
  history events.
- `rejected` leaves effective state disabled.
- Terminal states cannot transition again.

## DeviceFeatureHistory

| Field | Type | Rules |
|---|---|---|
| id | string | Required, immutable |
| device_id / feature_id | reference | Retained across soft delete |
| event_type | enabled, disabled, config_changed, approval_requested, approved, rejected | Required |
| before / after | snapshot or null | Immutable state snapshots |
| reason | string or null | Required for enforcement request |
| approval_request_id | string or null | Links approval events |
| valid_from | datetime | Server assigned; descending default order |
| actor | ActorSummary | Required |

No update/delete operation exists. A direct feature mutation and its history row commit in one
transaction; approval commits request, effective state and history in one transaction.

## DevicePreset

| Field | Type | Rules |
|---|---|---|
| id / device_id | string | Required |
| preset_no | integer | 1..9999; unique among non-deleted presets per device |
| name | string | 1–255 chars |
| pan / tilt / zoom | number or null | Finite and within DeviceType PTZ constraints |
| enforcement_zone | GeoJSON Polygon or null | One valid outer ring, CRS84, max 500 vertices |
| lane_label / approach | string or null | Max 255 chars |
| is_calibrated | boolean | Server-derived, never client authoritative |
| calibrated_at / calibrated_by | datetime/actor or null | Both set only when calibrated |
| version | integer | >=1 |
| created_at / updated_at | datetime | Server assigned |
| deleted_at | datetime or null | Soft delete |

Calibration transition:

```text
draft --all required values valid--> calibrated
calibrated --required value removed/invalid--> draft
draft|calibrated --soft delete--> deleted
```

Server derives calibration on every create/update. Draft has `is_calibrated=false` and null calibration
metadata. Entering calibrated stamps current actor/time. Remaining calibrated after a valid edit may
refresh calibration metadata because geometry/PTZ values were re-certified.

## GeoJSON validation

### Point

- `type = Point`; exactly two finite coordinates.
- Longitude -180..180 and latitude -90..90.

### Enforcement Polygon

- `type = Polygon`; exactly one outer linear ring in MVP.
- First and last positions equal.
- At least three distinct vertices plus closing position; maximum 500 distinct vertices.
- No self-intersection, zero area, longitude wrapping or antimeridian crossing.
- Client validation is advisory; server repeats validation and returns field-level violations.

## Query projections

- Device list is a bounded projection with Device, Object and DeviceType summaries plus `last_seen_at`.
- Cursor encodes stable ordering `(updated_at DESC, id DESC)` and is opaque to clients.
- Default page size 50; maximum 100. Deleted records excluded unless an audit-authorized endpoint
  explicitly requests them.
- Feature history uses independent cursor pagination, default 50 and maximum 100.

## Error model

All business errors use problem details with stable `code` and optional `field_errors`:

- `DUPLICATE_CODE`
- `DUPLICATE_PRESET_NO`
- `VERSION_CONFLICT`
- `OBJECT_HAS_ACTIVE_DEVICES`
- `UNSUPPORTED_FEATURE`
- `ENFORCEMENT_APPROVAL_REQUIRED`
- `PENDING_APPROVAL_EXISTS`
- `SELF_APPROVAL_FORBIDDEN`
- `INVALID_JSON_CONFIG`
- `INVALID_GEOMETRY`
- `PTZ_OUT_OF_RANGE`
- `AUDIT_WRITE_FAILED`
