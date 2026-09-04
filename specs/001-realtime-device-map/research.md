# Research: Bản đồ thiết bị realtime

## 1. Next.js và Leaflet client boundary

**Decision**: Giữ App Router page/layout ở Server Component khi có thể. Một Client Component nhỏ tải
`device-map` bằng `dynamic(..., { ssr: false })`; mọi import Leaflet/react-leaflet nằm dưới boundary.

**Rationale**: Leaflet phụ thuộc browser APIs. Next.js chỉ cho phép `ssr: false` trong Client
Component; cô lập boundary giảm client bundle và tránh hydration/build error. `MapContainer` sở hữu
map instance nên các cập nhật sau khởi tạo đi qua hooks/map instance.

**Alternatives considered**:

- Client-render toàn route: đơn giản nhưng tăng bundle và mất lợi ích Server Components.
- Kiểm tra `window` rải rác trong effects: lifecycle phức tạp và dễ import Leaflet vào server graph.

**Sources**: [Next.js lazy loading](https://nextjs.org/docs/app/guides/lazy-loading),
[Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components),
[React Leaflet Map API](https://react-leaflet.js.org/docs/api-map/).

## 2. Viewport event và bbox canonical

**Decision**: Dùng `moveend` và `map.getBounds()`, normalize bounds theo thứ tự
`west,south,east,north`. Chỉ publish khi bounds đã thay đổi có ý nghĩa.

**Rationale**: `moveend` bao phủ pan và zoom hoàn tất, tránh request churn của event `move`. Bbox trở
thành query identity chung giữa UI store, poller và response validation.

**Alternatives considered**:

- Poll liên tục theo `move`: loại vì tạo quá nhiều request.
- Nghe đồng thời `moveend` và `zoomend`: loại mặc định vì dễ tạo hai poll cho một thao tác.

**Sources**: [Leaflet map events](https://leafletjs.com/reference.html#map-moveend),
[Leaflet getBounds](https://leafletjs.com/reference.html#map-getbounds).

## 3. Custom marker

**Decision**: Cache `L.divIcon` variants từ enum/asset tin cậy theo device type, connectivity, alert
và selection. Leaflet điều khiển outer transform; phần tử con điều khiển rotation/status visuals.

**Rationale**: `DivIcon` hỗ trợ marker động nhưng tạo HTML/icon cho từng poll gây allocation lớn.
Tách inner rotation tránh ghi đè transform định vị của Leaflet và cache giảm chi phí cho 2.000 marker.

**Alternatives considered**:

- Image icon: nhẹ nhưng khó biểu diễn heading và trạng thái kết hợp.
- React portal/custom overlay cho từng marker: tăng lifecycle và rerender cost.

**Sources**: [Leaflet Marker](https://leafletjs.com/reference.html#marker),
[Leaflet DivIcon](https://leafletjs.com/reference.html#divicon),
[React Leaflet components](https://react-leaflet.js.org/docs/api-components/).

## 4. Motion interpolation

**Decision**: Một `requestAnimationFrame` scheduler chung cập nhật trực tiếp marker refs. Chỉ nội suy
giữa vị trí đang hiển thị và fix hợp lệ mới; không lưu frame state trong Zustand và không dead-reckon
vô hạn quá đích xác nhận.

**Rationale**: rAF đồng bộ browser repaint và cung cấp timestamp độc lập refresh rate. Một scheduler
tránh hàng nghìn timers/renders; `setLatLng()` là API Leaflet thích hợp. Static/fixed/void fix không
được phép tạo motion.

**Alternatives considered**:

- CSS transition cho outer marker: xung đột với transform mà Leaflet dùng khi pan/zoom/position.
- React/Zustand update mỗi frame: rerender diện rộng và làm bẩn server snapshot.
- Ngoại suy liên tục theo course/speed: trông mượt nhưng phát minh vị trí khi ping trễ.

**Sources**: [MDN requestAnimationFrame](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame),
[Leaflet setLatLng](https://leafletjs.com/reference.html#marker-setlatlng),
[React effects](https://react.dev/reference/react/useEffect).

## 5. Axios polling và cancellation

**Decision**: Một `setInterval` theo active query, immediate first poll, default 4 giây. Mỗi tick
abort controller cũ, tạo controller/generation mới và truyền `signal` vào shared Axios instance.
Cleanup clear interval, abort request và invalidate generation.

**Rationale**: Axios hỗ trợ chuẩn `AbortController.signal`; CancelToken đã deprecated. Effect cleanup
chạy trước setup mới và khi unmount, nhưng abort một mình không đủ ngăn promise đang settle, nên cần
generation + query-key guard.

**Alternatives considered**:

- Recursive `setTimeout`: tránh starvation tốt hơn nhưng không giữ fixed cadence đã yêu cầu.
- Bỏ tick khi request đang chạy: freshness khó dự đoán.
- TanStack Query/SWR: vi phạm constitution.

**Risks**: Nếu latency thường xuyên dài hơn interval, abort liên tục có thể làm không request nào
thành công. Đo consecutive cancellation; nếu xảy ra phải điều chỉnh timeout/cadence hoặc amend plan.

**Sources**: [Axios cancellation](https://axios-http.com/docs/cancellation),
[React useEffect](https://react.dev/reference/react/useEffect),
[MDN setInterval](https://developer.mozilla.org/docs/Web/API/Window/setInterval).

## 6. Zustand store boundaries và Map merge

**Decision**: Tách `device-state-store` và `map-ui-store`. Server store dùng typed
`Map<DeviceId, DeviceState>`, clone đúng một lần mỗi snapshot rồi commit một lần. Poll lifecycle và
animation state không nằm trong store.

**Rationale**: Zustand chỉ phát hiện Map change khi có reference mới. Blind merge giữ ghost markers;
snapshot đầy đủ phải upsert theo version và reconcile IDs không còn trong query.

**Alternatives considered**:

- `Record<string, DeviceState>`: dễ serialize nhưng trái lựa chọn Map và kém rõ lookup semantics.
- Một global store: vi phạm constitution và mở rộng rerender surface.
- Persist snapshot: dữ liệu realtime nhanh stale và Map không JSON-serializable mặc định.

**Sources**: [Zustand Map and Set](https://zustand.docs.pmnd.rs/guides/maps-and-sets-usage),
[Zustand updating state](https://zustand.docs.pmnd.rs/guides/updating-state),
[Zustand useShallow](https://zustand.docs.pmnd.rs/guides/prevent-rerenders-with-use-shallow).

## 7. Viewport snapshot contract

**Decision**: `GET /api/v1/map/device-states` yêu cầu CRS84 bbox theo longitude/latitude và trả một
snapshot đầy đủ, nguyên tử cho bbox + filters. Response có `snapshot_id`, `generated_at`,
`state_version`, ETag và query echo. Limit tối đa 5.000; vượt giới hạn trả `422
VIEWPORT_TOO_DENSE`, không truncate.

**Rationale**: Snapshot đầy đủ đơn giản, cho phép reconcile và phù hợp bảng `device_state` nhỏ ở quy
mô hiện tại. Bbox chuẩn cho phép backend dùng spatial filtering. ETag/304 giảm payload khi không đổi
mà không cần delta protocol.

**Alternatives considered**:

- Tải toàn bộ thiết bị: vi phạm constitution.
- Delta cursor: tiết kiệm payload nhưng phức tạp membership/filter/recovery cho phiên bản đầu.
- Pagination: các trang polling có thể thuộc snapshot khác nhau.
- Vector tiles: phù hợp quy mô lớn hơn nhưng phức tạp với realtime state và detail panel.

**Sources**: [OGC API Features bbox](https://docs.ogc.org/is/17-069r4/17-069r4.html),
[GeoJSON RFC 7946](https://www.rfc-editor.org/rfc/rfc7946),
[PostGIS ST_Intersects](https://postgis.net/docs/en/ST_Intersects.html),
[HTTP conditional requests](https://www.rfc-editor.org/rfc/rfc9110.html#section-13.1.2).

## 8. Canonical position and offline policy

**Decision**: Backend trả một `position` canonical dùng cả cho bbox selection và marker. Fixed lấy
`object.location`; mobile lấy last valid GPS position. GPS void có thể đổi non-position metadata
nhưng không đổi position/version. `mobility` và `is_static` là hai khái niệm riêng. Backend tính
`online` theo `generated_at - last_seen_at <= 30s` và ETag phải đổi khi offline transition xảy ra.

**Rationale**: Nếu frontend tự chọn nguồn position, bbox membership và marker có thể khác nhau.
`last_seen_at` không đồng nghĩa thời điểm fix, nên contract giữ `position_observed_at` riêng.

**Alternatives considered**:

- Frontend merge object/device_state raw: coupling schema và có thể hiển thị void fix.
- Dùng `is_static` để chọn nguồn: sai vì một xe đang dừng vẫn là mobile.
