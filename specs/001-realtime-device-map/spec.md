# Feature Specification: Bản đồ thiết bị realtime

**Feature Branch**: `001-realtime-device-map`

**Created**: 2026-09-04

**Status**: Ready for planning

**Input**: User description: "Hiển thị thiết bị cố định và di động trên bản đồ realtime, cập nhật
mượt vị trí hợp lệ, thể hiện trạng thái, hỗ trợ tìm kiếm/lọc và chỉ tải dữ liệu trong viewport."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Quan sát trạng thái toàn mạng lưới (Priority: P1)

Người vận hành mở bản đồ và thấy các thiết bị trong vùng đang xem tại đúng vị trí, với biểu tượng
phân biệt loại thiết bị và trạng thái online/offline dễ nhận biết.

**Why this priority**: Đây là giá trị vận hành cốt lõi; nếu vị trí hoặc trạng thái không đáng tin cậy,
các thao tác chi tiết và theo dõi chuyển động không còn ý nghĩa.

**Independent Test**: Chuẩn bị một viewport có camera, xe bus, cảm biến và tủ điều khiển ở cả trạng
thái online/offline; mở bản đồ và đối chiếu số lượng, vị trí, loại và trạng thái hiển thị.

**Acceptance Scenarios**:

1. **Given** các thiết bị có tọa độ hợp lệ trong viewport, **When** người vận hành mở bản đồ,
   **Then** mỗi thiết bị xuất hiện tại đúng vị trí với biểu tượng tương ứng loại camera, bus, cảm
   biến hoặc tủ điều khiển.
2. **Given** một thiết bị cố định, **When** telemetry mới đến hoặc có sai lệch tọa độ nhỏ,
   **Then** marker vẫn ở vị trí đã đăng ký và không rung.
3. **Given** một thiết bị đã vượt chính sách offline, **When** bản đồ làm mới trạng thái,
   **Then** marker chuyển sang biểu diễn offline trong một chu kỳ làm mới.
4. **Given** người vận hành pan hoặc zoom, **When** viewport ổn định sau thao tác,
   **Then** bản đồ chỉ yêu cầu và hiển thị tập thiết bị thuộc viewport hiện tại.

---

### User Story 2 - Theo dõi thiết bị di động mượt và chính xác (Priority: P2)

Người vận hành theo dõi xe bus hoặc phương tiện đội xe với vị trí, hướng và tốc độ hiện tại. Marker
di chuyển liên tục giữa các bản tin định vị cách nhau khoảng năm giây nhưng không đi theo bản tin có
fix không hợp lệ.

**Why this priority**: Chuyển động mượt giúp người vận hành hiểu hướng đi và tình trạng thực tế mà
không nhầm độ trễ cập nhật thành việc phương tiện dừng hoặc nhảy vị trí.

**Independent Test**: Phát một chuỗi vị trí hợp lệ có hướng và tốc độ, xen một fix void; xác nhận
marker chuyển động mượt qua các điểm hợp lệ và bỏ qua hoàn toàn điểm void.

**Acceptance Scenarios**:

1. **Given** một xe đang di chuyển, **When** nhận được vị trí hợp lệ mới,
   **Then** marker chuyển động mượt về vị trí mới theo hướng và tốc độ hiện tại thay vì nhảy cóc.
2. **Given** một điểm định vị có trạng thái void, **When** dữ liệu đó được nhận,
   **Then** marker không di chuyển và vị trí hợp lệ gần nhất được giữ nguyên.
3. **Given** dữ liệu mới đến chậm hoặc sai thứ tự, **When** bản đồ xử lý cập nhật,
   **Then** dữ liệu cũ không ghi đè vị trí mới hơn và marker không chuyển động ngược bất thường.

---

### User Story 3 - Tìm và kiểm tra chi tiết thiết bị (Priority: P3)

Người vận hành lọc hoặc tìm thiết bị, sau đó mở panel chi tiết để xem định danh, loại, trạng thái,
thời điểm ghi nhận gần nhất, cảnh báo, preset và thông tin chuyển động khi phù hợp.

**Why this priority**: Sau khi phát hiện thiết bị trên bản đồ, người vận hành cần đủ ngữ cảnh để
đánh giá tình trạng và quyết định bước xử lý tiếp theo.

**Independent Test**: Tìm một thiết bị theo mã, lọc theo loại và trạng thái, mở marker kết quả rồi
đối chiếu toàn bộ trường chi tiết với dữ liệu nguồn.

**Acceptance Scenarios**:

1. **Given** nhiều loại và trạng thái thiết bị trong viewport, **When** áp dụng bộ lọc,
   **Then** chỉ marker thỏa tất cả điều kiện đang chọn còn hiển thị.
2. **Given** người vận hành nhập mã thiết bị, **When** có kết quả khớp,
   **Then** thiết bị được xác định trên bản đồ và có thể mở chi tiết.
3. **Given** người vận hành click hoặc tap một marker, **When** panel chi tiết mở,
   **Then** panel hiển thị tên, mã, loại, `last_seen_at`, mức cảnh báo, preset đang active và tốc độ
   nếu đó là thiết bị di động.

### Edge Cases

- Thiết bị không có tọa độ hợp lệ không được đặt marker giả; giao diện phải cho biết thiết bị bị
  loại khỏi bản đồ do thiếu vị trí.
- Nhiều thiết bị có cùng hoặc rất gần tọa độ phải vẫn có cách nhận biết và chọn từng thiết bị.
- Khi viewport thay đổi liên tục, kết quả của yêu cầu cũ không được thay thế dữ liệu viewport mới.
- Khi làm mới thất bại tạm thời, bản đồ giữ dữ liệu hợp lệ gần nhất và biểu thị dữ liệu có thể đã cũ.
- Thiết bị di động có tốc độ bằng không phải dừng tại vị trí hợp lệ cuối cùng, không suy diễn chuyển
  động chỉ từ hướng.
- Thiết bị được đổi giữa trạng thái static và mobile phải áp dụng nguồn vị trí mới ở lần làm mới kế
  tiếp mà không để lại marker trùng.
- Giá trị hướng hoặc tốc độ thiếu/bất hợp lệ không được tạo chuyển động bất thường; marker tiến tới
  vị trí hợp lệ mới bằng hành vi suy giảm an toàn.
- Bộ lọc không có kết quả phải hiển thị trạng thái rỗng rõ ràng và không tự mở rộng ra ngoài viewport.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Hệ thống MUST hiển thị mọi thiết bị đủ điều kiện trong viewport hiện tại với vị trí,
  trạng thái kết nối, thời điểm ghi nhận gần nhất, mức cảnh báo và preset active nếu có. Khi viewport
  khớp hơn 5.000 thiết bị, server MUST trả `422 VIEWPORT_TOO_DENSE` thay vì danh sách; client MUST yêu
  cầu người dùng zoom in hoặc áp dụng bộ lọc trước khi tải lại và MUST NOT âm thầm truncate dữ liệu.
- **FR-002**: Thiết bị cố định MUST sử dụng vị trí đăng ký của object và MUST NOT thay đổi marker theo
  tọa độ telemetry.
- **FR-003**: Thiết bị di động MUST sử dụng vị trí trạng thái gần nhất được tạo từ một fix GPS hợp lệ.
- **FR-004**: Marker di động MUST chuyển động liên tục giữa hai vị trí hợp lệ dựa trên hướng và tốc
  độ hiện tại, với thời lượng phù hợp khoảng cách giữa các lần cập nhật.
- **FR-005**: Marker có `is_static = true` MUST NOT animate hoặc bị dịch chuyển bởi GPS jitter.
- **FR-006**: Dữ liệu trong viewport MUST được làm mới theo chu kỳ cấu hình được, với mặc định bốn
  giây và giá trị cho phép trong khoảng ba đến năm giây.
- **FR-007**: Mỗi lần tải dữ liệu bản đồ MUST bị giới hạn bởi bounding box của viewport hiện tại;
  giao diện MUST NOT tải toàn bộ bảng thiết bị để phục vụ bản đồ tương tác.
- **FR-008**: Thiết bị MUST được coi là offline khi thời gian hiện tại vượt `last_seen_at` quá 30
  giây và online khi chưa vượt ngưỡng này. Cùng một ngưỡng MUST áp dụng cho mọi loại thiết bị trong
  phạm vi feature.
- **FR-009**: Click hoặc tap marker MUST mở panel chi tiết gồm tên, mã thiết bị, loại,
  `last_seen_at`, `alert_level`, preset active và tốc độ hiện tại nếu thiết bị di động.
- **FR-010**: Marker MUST phân biệt được các nhóm `lpr_camera`, `bus_gps`, `env_multi`,
  `signal_ctrl` và MUST có fallback rõ ràng cho loại chưa được ánh xạ.
- **FR-011**: Người vận hành MUST có thể lọc thiết bị theo loại và trạng thái online/offline, đồng
  thời tìm theo `device.code` hoặc `device.name` bằng phép khớp một phần không phân biệt hoa thường.
- **FR-012**: Dữ liệu định vị có `gps_status = 'V'` hoặc trạng thái tương đương MUST NOT thay đổi vị
  trí đang hiển thị.
- **FR-013**: Khi viewport hoặc chu kỳ làm mới tạo yêu cầu thay thế, hệ thống MUST hủy công việc cũ
  và MUST NOT áp dụng phản hồi cũ đến sau phản hồi mới.
- **FR-014**: Hệ thống MUST duy trì khả năng quan sát và tương tác ở quy mô tối thiểu 2.000 thiết bị
  toàn hệ thống bằng cách chỉ xử lý tập dữ liệu liên quan viewport.
- **FR-015**: Khi nguồn dữ liệu tạm thời không khả dụng, hệ thống MUST giữ lần hiển thị hợp lệ gần
  nhất, thông báo trạng thái stale và tự phục hồi ở lần làm mới thành công tiếp theo.
- **FR-016**: Trạng thái, biểu tượng và panel chi tiết MUST sử dụng được bằng chuột, bàn phím và thao
  tác chạm; thông tin online/offline MUST NOT chỉ dựa vào màu sắc.

### Scope Boundaries

**In scope**:

- Bản đồ hiện tại của thiết bị cố định và di động.
- Làm mới trạng thái gần thời gian thực, chuyển động mượt và xử lý fix GPS không hợp lệ.
- Viewport-bound loading, tìm kiếm, lọc và panel chi tiết.

**Out of scope**:

- Playback lịch sử hành trình hoặc truy vấn dữ liệu vị trí lịch sử.
- Chỉnh sửa object/device, cấu hình preset hoặc xử lý cảnh báo từ panel bản đồ.
- Điều phối lệnh xuống thiết bị và tối ưu tuyến xe.

### Constitution Constraints _(mandatory)_

- **Owning Feature**: Feature `realtime-device-map` chịu trách nhiệm trải nghiệm bản đồ; mã nguồn
  tương lai thuộc `src/features/realtime-device-map/`.
- **API Interactions**: Cần một nguồn truy vấn trạng thái thiết bị theo bounding box, bộ lọc và thời
  điểm snapshot. Backend chưa có capability này và phải thống nhất contract trong giai đoạn plan.
- **UI Composition**: Cần vùng bản đồ, marker/icon, trạng thái tải/lỗi/rỗng, bộ lọc, tìm kiếm, tooltip
  và panel chi tiết; các primitive cụ thể được xác định trong plan theo design system dự án.
- **State Classification**: Trạng thái viewport/filter/selection là UI state; snapshot thiết bị,
  polling, freshness và cancellation là server-polling state riêng; trạng thái animation cục bộ
  không được trộn vào store server.
- **Realtime/Geo Scale**: Thiết kế MUST hỗ trợ ít nhất 2.000 thiết bị toàn hệ thống, chỉ tải theo
  viewport, hủy yêu cầu cũ, bỏ phản hồi stale và dừng polling khi màn hình không còn active.

### Key Entities

- **Device State**: Snapshot vận hành gần nhất của thiết bị, gồm định danh, thời điểm ghi nhận, vị
  trí hợp lệ gần nhất, tốc độ, hướng, trạng thái kết nối, mức cảnh báo và preset active.
- **Object**: Đối tượng được đặt trên bản đồ; cung cấp tên, mã, loại object, trạng thái và vị trí đăng
  ký có thẩm quyền cho thiết bị cố định.
- **Device**: Phần cứng gắn với object; cung cấp mã, tên, loại, cấu hình và trạng thái quản lý.
- **Device Type**: Phân loại thiết bị và metadata trình bày như mã loại, tên, icon và kiểu panel.
- **Viewport**: Biên không gian đang nhìn thấy cùng mức zoom; xác định tập thiết bị được phép tải.
- **Map Selection**: Thiết bị đang được chọn và ngữ cảnh mở panel, độc lập với snapshot polling.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Với viewport đại diện, 95% lần mở hoặc thay đổi viewport hiển thị tập marker có thể
  tương tác trong không quá hai giây trên kết nối vận hành bình thường.
- **SC-002**: Trong kiểm thử với ít nhất 2.000 thiết bị toàn hệ thống, thao tác pan, zoom, lọc và chọn
  marker vẫn phản hồi trong một giây ở ít nhất 95% thao tác.
- **SC-003**: 100% thiết bị cố định trong bộ kiểm thử giữ nguyên vị trí qua các lần làm mới dù
  telemetry chứa GPS jitter.
- **SC-004**: 100% fix GPS void trong bộ kiểm thử không làm thay đổi marker; phản hồi cũ không bao
  giờ ghi đè một vị trí mới hơn.
- **SC-005**: Ít nhất 95% cập nhật hợp lệ của thiết bị di động bắt đầu được thể hiện trong một chu kỳ
  làm mới. Với mỗi cặp fix hợp lệ liên tiếp của marker mobile, non-static, vị trí MUST được nội suy
  tuyến tính (`linear`) trong đúng khoảng thời gian trôi qua giữa hai fix. Marker chỉ được snap tức
  thời tới đích khi tốc độ suy ra từ khoảng cách giữa hai điểm lớn hơn 120 km/h hoặc khoảng thời gian
  giữa hai fix hợp lệ lớn hơn tám giây (hai lần chu kỳ poll mặc định).
- **SC-006**: Thay đổi online/offline được phản ánh trong một chu kỳ làm mới sau khi chính sách
  offline được thỏa mãn.
- **SC-007**: Trong Playwright E2E trên bộ dữ liệu mẫu 5.000 thiết bị, p95 thời gian từ khi nhập ký tự
  tìm kiếm đầu tiên đến khi panel chi tiết của thiết bị được chọn hiển thị đầy đủ MUST không quá mười
  giây.
- **SC-008**: Mọi yêu cầu dữ liệu phát sinh từ bản đồ đều có giới hạn không gian; không có yêu cầu
  tải toàn bộ thiết bị trong kiểm thử nghiệm thu.

## Assumptions

- Playback lịch sử thuộc một feature riêng sử dụng dữ liệu vị trí lịch sử và không nằm trong scope
  bản đồ realtime đầu tiên.
- Người vận hành đã đăng nhập và có quyền xem các thiết bị thuộc phạm vi tổ chức của mình; feature
  không thay đổi cơ chế xác thực hoặc phân quyền.
- Backend cung cấp thời gian thống nhất đủ tin cậy để so sánh freshness giữa các thiết bị.
- Chỉ thiết bị ở trạng thái quản lý cho phép hiển thị và có tọa độ hợp lệ mới xuất hiện trên bản đồ.
- Chu kỳ bốn giây là mặc định trong giới hạn ba đến năm giây và có thể được điều chỉnh theo môi
  trường vận hành.
- Chính sách offline dùng một ngưỡng chung 30 giây cho mọi loại thiết bị; thay đổi ngưỡng này là một
  thay đổi yêu cầu và phải được xác nhận lại với backend.
- Backend sẽ cung cấp capability truy vấn trạng thái thiết bị theo viewport trước khi feature có thể
  hoàn tất tích hợp end-to-end.
