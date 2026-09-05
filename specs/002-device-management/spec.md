# Feature Specification: Quản lý thiết bị và hiệu chỉnh camera

**Feature Branch**: `002-device-management` (logical; Git branch chưa được tạo vì không có hook)

**Created**: 2026-09-04

**Status**: Ready for planning

**Input**: User description: "Quản lý object và device, cấu hình feature có audit history, và hiệu chỉnh preset camera PTZ kèm enforcement zone."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Quản lý danh mục vị trí và thiết bị (Priority: P1)

Quản trị viên hoặc kỹ thuật viên tìm kiếm thiết bị, xem tình trạng quản lý và tạo hoặc chỉnh sửa một
thiết bị gắn với vị trí đã có. Khi vị trí lắp đặt chưa tồn tại, người dùng có thể tạo vị trí và chọn
tọa độ trước khi hoàn tất thiết bị.

**Why this priority**: Danh mục object và device chính xác là nền tảng để cấu hình capability, preset
và mọi nghiệp vụ vận hành tiếp theo.

**Independent Test**: Từ danh mục trống, tạo một object có vị trí, tạo device gắn vào object đó, chỉnh
sửa thông tin, tìm lại bằng mã/tên và xác nhận các bộ lọc trả đúng kết quả.

**Acceptance Scenarios**:

1. **Given** danh mục có nhiều object type, device type và trạng thái, **When** người dùng mở trang
   quản lý và áp dụng bộ lọc, **Then** chỉ các device thỏa đồng thời object, object type, device type,
   status và từ khóa code/name được hiển thị.
2. **Given** một object có sẵn, **When** người dùng nhập code, name, serial, device type, object và
   config hợp lệ rồi lưu, **Then** device mới được tạo và xuất hiện trong danh mục.
3. **Given** chưa có object phù hợp, **When** người dùng tạo object với code, name, object type, status
   và chọn một điểm hợp lệ trên bản đồ, **Then** object có thể được chọn cho device đang tạo.
4. **Given** config nhập vào không phải một tài liệu JSON hợp lệ, **When** người dùng lưu device,
   **Then** thao tác bị chặn và vị trí lỗi được giải thích mà không làm mất nội dung đang nhập.
5. **Given** device được soft delete, **When** tải lại danh mục mặc định, **Then** device không còn
   xuất hiện nhưng dữ liệu và lịch sử liên quan vẫn được giữ để truy vấn có thẩm quyền.

---

### User Story 2 - Quản lý feature và lịch sử audit (Priority: P2)

Người dùng có thẩm quyền xem capability mà loại phần cứng hỗ trợ, bật hoặc tắt từng feature cho
device và kiểm tra toàn bộ lịch sử thay đổi theo thứ tự mới nhất trước.

**Why this priority**: Việc kiểm soát chính xác feature quyết định thiết bị được phép tham gia những
luồng nghiệp vụ nào, đặc biệt với feature enforcement có tác động pháp lý hoặc vận hành cao.

**Independent Test**: Chọn một device có feature thường và feature enforcement, thay đổi trạng thái
cả hai rồi xác nhận trạng thái hiện tại và từng bản ghi lịch sử bất biến phản ánh đúng người, thời
điểm, giá trị trước/sau và ngữ cảnh phê duyệt.

**Acceptance Scenarios**:

1. **Given** device type hỗ trợ một tập feature, **When** mở chi tiết device, **Then** người dùng thấy
   đầy đủ capability và trạng thái bật/tắt hiện tại của từng feature.
2. **Given** một feature thường, **When** người dùng bật hoặc tắt và lưu, **Then** trạng thái hiện tại
   thay đổi và đúng một bản ghi lịch sử mới được thêm.
3. **Given** feature có `is_enforcement=true`, **When** người dùng có quyền gửi yêu cầu bật kèm lý do,
   **Then** feature chuyển sang trạng thái chờ duyệt và chưa tham gia xử phạt cho đến khi quản trị viên
   phê duyệt.
4. **Given** một yêu cầu enforcement đang chờ duyệt, **When** quản trị viên phê duyệt, **Then** feature
   mới có hiệu lực và cả yêu cầu lẫn quyết định được ghi vào lịch sử append-only.
5. **Given** một yêu cầu enforcement đang chờ duyệt, **When** quản trị viên từ chối, **Then** feature
   giữ trạng thái không hiệu lực, người yêu cầu thấy kết quả và quyết định được ghi vào lịch sử.
6. **Given** lịch sử feature đã tồn tại, **When** xem lịch sử, **Then** các thay đổi hiển thị theo
   `valid_from` giảm dần và không có thao tác sửa hoặc xóa bản ghi.
7. **Given** device đã soft delete, **When** người dùng có quyền audit truy vấn lịch sử, **Then** lịch
   sử feature của device vẫn đầy đủ và không bị mất liên kết.

---

### User Story 3 - Hiệu chỉnh preset camera PTZ (Priority: P3)

Kỹ thuật viên quản lý preset cho camera LPR/PTZ, nhập góc quay và mức zoom, mô tả làn/chiều tiếp cận,
vẽ vùng phạt trên bản đồ và hoàn tất hiệu chỉnh khi mọi dữ liệu bắt buộc hợp lệ.

**Why this priority**: Preset và vùng phạt chính xác giúp hệ thống gắn sự kiện camera với đúng vùng
nghiệp vụ, nhưng chỉ có giá trị sau khi danh mục thiết bị và capability được quản lý tin cậy.

**Independent Test**: Trên một camera đủ capability, tạo preset với pan/tilt/zoom và polygon hợp lệ,
xác nhận trạng thái calibrated cùng người/thời điểm; sau đó sửa, soft delete và kiểm tra quy tắc trùng
preset number.

**Acceptance Scenarios**:

1. **Given** device type hỗ trợ `ptz` hoặc `lpr`, **When** mở khu vực preset, **Then** danh sách hiển
   thị preset number, name và trạng thái calibrated của camera đó.
2. **Given** dữ liệu pan, tilt, zoom, lane label, approach và polygon hợp lệ, **When** người dùng lưu
   preset, **Then** enforcement zone được giữ đúng hình học và preset được đánh dấu calibrated kèm
   người và thời điểm hiệu chỉnh.
3. **Given** thiếu một trong pan, tilt, zoom hoặc polygon hợp lệ, **When** người dùng lưu, **Then** có
   thể lưu bản nháp nhưng preset vẫn là chưa calibrated và giao diện nêu rõ dữ liệu còn thiếu.
4. **Given** preset number đã tồn tại trên cùng device, **When** tạo preset khác với số đó, **Then**
   thao tác bị từ chối bằng thông báo dễ hiểu; cùng số trên device khác vẫn được phép.
5. **Given** polygon tự cắt, có dưới ba hoặc trên 500 đỉnh phân biệt, hoặc nằm ngoài phạm vi tọa độ hợp
   lệ, **When** người dùng lưu, **Then** enforcement zone bị từ chối và bản vẽ vẫn được giữ để sửa.
6. **Given** preset được soft delete, **When** xem danh sách mặc định, **Then** preset không còn xuất
   hiện nhưng dữ liệu hiệu chỉnh vẫn được lưu giữ cho audit.

### Edge Cases

- Code object hoặc device trùng với bản ghi đang active phải bị từ chối; code của bản ghi đã soft
  delete không được tự động tái sử dụng nếu chưa có chính sách khôi phục rõ ràng.
- Không cho soft delete object còn device active; người dùng phải chuyển hoặc soft delete các device
  liên quan trước.
- Device type thay đổi sang loại không hỗ trợ feature đang bật hoặc preset hiện có phải bị chặn cho
  đến khi người dùng xử lý các phụ thuộc.
- Capability có trong device type nhưng chưa có trạng thái device feature phải hiển thị là chưa bật,
  không bị bỏ khỏi danh sách.
- Hai người sửa cùng một object, device, feature hoặc preset phải nhận biết xung đột; thay đổi cũ
  không được âm thầm ghi đè thay đổi mới hơn.
- Lỗi khi ghi lịch sử audit phải làm toàn bộ thay đổi feature thất bại; không được có trạng thái mới
  mà thiếu lịch sử tương ứng.
- Polygon chạm hoặc cắt đường đổi ngày, bao phủ diện tích bằng không hay chứa tọa độ không hữu hạn
  phải bị từ chối.
- Mất kết nối khi đang vẽ polygon hoặc nhập JSON phải giữ dữ liệu chưa lưu để người dùng thử lại.
- Thiết bị không có `ptz` hoặc `lpr` capability không được hiển thị hành động quản lý preset.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Hệ thống MUST cung cấp danh sách device có phân trang và cho phép kết hợp bộ lọc theo
  object, object type, device type, status cùng tìm kiếm một phần code/name không phân biệt hoa thường.
- **FR-002**: Mỗi dòng danh sách MUST hiển thị tối thiểu object, device type, status và last seen của
  device; danh sách mặc định MUST loại các bản ghi đã soft delete.
- **FR-003**: Người dùng có quyền MUST có thể tạo và sửa object với code, name, object type, một vị trí
  điểm hợp lệ, status và thuộc tính mở rộng.
- **FR-004**: Người dùng MUST có thể chọn một điểm trên bản đồ và xem lại tọa độ chính xác trước khi
  lưu object.
- **FR-005**: Người dùng có quyền MUST có thể tạo và sửa device với code, name, serial, device type,
  object liên kết, status và config.
- **FR-006**: `object.attrs` và `device.config` MUST được nhập dưới dạng JSON object trong MVP; hệ thống
  MUST kiểm tra cú pháp, bảo toàn kiểu dữ liệu và không cho lưu nội dung không hợp lệ.
- **FR-007**: Code của object và code của device MUST duy nhất trên toàn bộ dữ liệu, kể cả bản ghi đã
  soft delete; code không được tái sử dụng trong MVP và lỗi trùng MUST xác định rõ trường gây lỗi.
- **FR-008**: Chi tiết device MUST liệt kê mọi feature mà device type hỗ trợ cùng trạng thái hiện tại,
  config và dấu hiệu enforcement của từng feature.
- **FR-009**: Hệ thống MUST NOT cho phép bật feature không thuộc capability của device type.
- **FR-010**: Mỗi lần bật, tắt hoặc đổi config của device feature MUST cập nhật trạng thái hiện tại và
  đồng thời thêm đúng một bản ghi history; nếu một phần thất bại thì không phần nào được ghi nhận.
- **FR-011**: Device feature history MUST là append-only, không cung cấp thao tác sửa/xóa, và MUST lưu
  device, feature, giá trị trước/sau, thời điểm hiệu lực, người thực hiện, lý do nếu có và thông tin
  approval khi áp dụng.
- **FR-012**: Người dùng có quyền audit MUST xem được lịch sử feature theo `valid_from` giảm dần, kể
  cả với device đã soft delete.
- **FR-013**: Yêu cầu bật feature enforcement MUST bắt buộc lý do và chuyển sang trạng thái chờ duyệt;
  trạng thái hiệu lực MUST giữ là tắt cho đến khi một quản trị viên có quyền approval và khác người
  gửi yêu cầu thực hiện quyết định approve.
- **FR-014**: Quyết định approve MUST làm feature có hiệu lực; quyết định reject MUST giữ feature
  không hiệu lực. Yêu cầu, người yêu cầu, lý do, người quyết định, thời điểm và kết quả MUST được ghi
  thành các sự kiện append-only và hiển thị cho người có quyền audit.
- **FR-015**: Chỉ device có capability `ptz` hoặc `lpr` mới được quản lý preset.
- **FR-016**: Người dùng có quyền MUST có thể tạo, sửa và soft delete preset gồm preset number, name,
  pan, tilt, zoom, lane label, approach và enforcement zone.
- **FR-017**: Preset number MUST duy nhất trong phạm vi một device giữa các preset chưa soft delete;
  xung đột MUST được báo mà không làm mất dữ liệu đang nhập.
- **FR-018**: Enforcement zone MUST là polygon hợp lệ trong hệ tọa độ địa lý chuẩn, có từ ba đến 500
  đỉnh phân biệt, diện tích lớn hơn không và không tự cắt; polygon vượt giới hạn MUST bị từ chối mà
  không làm mất bản vẽ.
- **FR-019**: Preset chỉ MUST được đánh dấu calibrated khi đồng thời có pan, tilt, zoom và enforcement
  zone hợp lệ; trạng thái này MUST ghi người và thời điểm hiệu chỉnh.
- **FR-020**: Nếu dữ liệu bắt buộc cho calibration bị xóa hoặc trở nên không hợp lệ sau chỉnh sửa,
  preset MUST trở lại trạng thái chưa calibrated và không được giữ metadata calibration cũ như thể
  còn hiệu lực.
- **FR-021**: Object, device và preset MUST dùng soft delete; các quan hệ và lịch sử liên quan MUST
  được giữ nguyên, trong khi danh sách mặc định không hiển thị bản ghi đã xóa.
- **FR-022**: Hệ thống MUST chặn soft delete object còn device active và giải thích các bước cần làm
  trước khi xóa.
- **FR-023**: Các thao tác sửa, toggle và soft delete MUST phát hiện xung đột phiên bản và không âm
  thầm ghi đè thay đổi mới hơn của người khác. Mọi mutation tạo/sửa/toggle/soft-delete MUST dùng khóa
  idempotency để retry cùng một yêu cầu an toàn; thao tác tạo dùng thêm quy tắc uniqueness thay vì ETag
  để phát hiện xung đột dữ liệu.
- **FR-024**: Khi thao tác lưu thất bại, hệ thống MUST giữ dữ liệu form/bản vẽ chưa lưu, nêu lỗi tại
  đúng ngữ cảnh và cho phép thử lại an toàn.
- **FR-025**: Quyền xem, tạo, sửa, toggle enforcement, hiệu chỉnh preset, soft delete và xem audit
  MUST được kiểm tra theo actor/permission của session context hiện tại; hành động không được phép MUST
  không xuất hiện hoặc bị từ chối rõ ràng, và backend MUST luôn kiểm tra lại thay vì tin client.

### Scope Boundaries

**In scope**:

- Danh sách, tìm kiếm, lọc, tạo, sửa và soft delete object/device.
- Device config bằng JSON editor tổng quát cho MVP.
- Quản lý trạng thái feature theo capability và xem audit history append-only.
- Quản lý, hiệu chỉnh và soft delete preset camera, bao gồm vẽ enforcement zone.
- Phát hiện xung đột cập nhật và giữ dữ liệu chưa lưu khi có lỗi.

**Out of scope**:

- Thiết kế form config động riêng cho từng device type.
- Điều khiển camera PTZ trực tiếp hoặc gửi preset xuống phần cứng.
- Nhận diện vi phạm, xử lý bằng chứng hay phát hành quyết định xử phạt.
- Khôi phục bản ghi soft delete, hard delete hoặc chỉnh sửa lịch sử audit.
- Quản trị danh mục object type, device type và feature definition.

### Constitution Constraints _(mandatory)_

- **Owning Feature**: Feature `device-management` sở hữu trải nghiệm quản lý; mã nguồn tương lai thuộc
  `src/features/device-management/`.
- **API Interactions**: Cần capability danh sách/CRUD object và device, capability/status/history
  feature, cùng CRUD/calibration preset. Backend chưa có các capability này; contract và mock phát
  triển song song phải được xác định trong plan, và mọi truy cập HTTP đi qua shared Axios boundary.
- **UI Composition**: Cần table, form, dialog xác nhận, tabs, badge, sheet/drawer, JSON editor có kiểm
  tra lỗi và bản đồ chọn điểm/vẽ polygon; chỉ dùng primitive của design system dự án và component sở hữu
  bởi dự án.
- **State Classification**: Dữ liệu danh mục/chi tiết/lịch sử là server state; filter, selection,
  form draft và trạng thái bản đồ chỉnh sửa là UI/local state riêng. Không gộp các domain vào một store.
- **Realtime/Geo Scale**: Danh sách MUST dùng phân trang hoặc giới hạn truy vấn, không tải không giới
  hạn. Bản đồ chọn điểm/polygon chỉ tải ngữ cảnh không gian cần thiết; không có polling realtime trong
  scope này. Các yêu cầu thay thế nhau khi tìm kiếm/lọc MUST hủy yêu cầu cũ và bỏ phản hồi stale.

### Key Entities

- **Object Type**: Phân loại vị trí/hạ tầng có thể chứa object.
- **Object**: Vị trí lắp đặt có code, name, type, tọa độ, status, thuộc tính mở rộng và trạng thái soft delete.
- **Device Type**: Loại phần cứng, metadata hiển thị và tập capability được hỗ trợ.
- **Device**: Thiết bị vật lý gắn với một object, gồm code, name, serial, type, config, status, last seen
  và trạng thái soft delete.
- **Feature**: Khả năng nghiệp vụ có code, name, loại dữ liệu phát sinh, dấu hiệu enforcement và lớp bản đồ.
- **Device Type Feature**: Quan hệ xác định feature mà một device type có khả năng hỗ trợ.
- **Device Feature**: Trạng thái bật/tắt có hiệu lực, config hiện hành và trạng thái yêu cầu approval
  đang chờ của một feature trên một device.
- **Device Feature History**: Bản ghi audit bất biến cho từng thay đổi device feature, gồm giá trị
  trước/sau, người, thời điểm, lý do và approval liên quan.
- **Device Preset**: Cấu hình camera theo device và preset number, chứa pan/tilt/zoom, lane, approach,
  enforcement zone, trạng thái và metadata calibration, cùng trạng thái soft delete.
- **Enforcement Zone**: Polygon địa lý xác định vùng áp dụng nghiệp vụ của một preset.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Trên profile 4 vCPU/8 GB RAM, Chromium headless và network throttle Fast 3G/4G với danh
  mục cố định 10.000 device, chạy một warm-up rồi ba measured runs, mỗi run ít nhất 100 thao tác mở
  danh sách/đổi trang/lọc/tìm kiếm; trung vị của ba giá trị p95 MUST không quá hai giây.
- **SC-002**: Playwright E2E MUST chạy một warm-up và ít nhất 20 flow độc lập tạo object rồi device
  liên kết; p95 thời gian từ khi mở form object đến khi device mới xuất hiện trong danh sách MUST
  không quá ba phút và 100% flow hợp lệ MUST hoàn tất không cần can thiệp ngoài giao diện.
- **SC-003**: 100% thay đổi trạng thái/config feature trong kiểm thử tạo đúng một bản ghi audit và
  không có trạng thái nào được ghi khi audit thất bại.
- **SC-004**: 100% yêu cầu bật enforcement feature vào trạng thái chờ duyệt và không tham gia xử phạt
  trước quyết định approve; 100% yêu cầu và quyết định approve/reject có bản ghi audit tương ứng.
- **SC-005**: 100% preset được đánh dấu calibrated trong kiểm thử có đủ pan, tilt, zoom, polygon hợp
  lệ, calibrated time và calibrated user; không preset thiếu dữ liệu nào được đánh dấu calibrated.
- **SC-006**: Playwright E2E MUST chạy một warm-up và ít nhất 20 flow độc lập vẽ/sửa enforcement zone
  hợp lệ rồi hoàn tất calibration; p95 thời gian từ thao tác vẽ đầu tiên đến khi panel hiển thị đầy
  đủ metadata calibrated MUST không quá năm phút và 100% flow hợp lệ MUST hoàn tất.
- **SC-007**: 100% thử nghiệm trùng preset number trên cùng device, polygon không hợp lệ (bao gồm trên
  500 đỉnh) và JSON không hợp lệ ở `object.attrs` hoặc `device.config` bị từ chối với thông báo chỉ rõ
  nguyên nhân mà không mất dữ liệu đang nhập.
- **SC-008**: 100% object, device và preset đã soft delete biến mất khỏi danh sách mặc định trong lần
  làm mới kế tiếp, trong khi toàn bộ audit history liên quan vẫn truy vấn được.
- **SC-009**: Với danh mục ít nhất 2.000 device, không thao tác danh sách hoặc bản đồ chỉnh sửa nào tải
  toàn bộ danh mục không giới hạn; yêu cầu cũ do tìm kiếm/lọc nhanh không bao giờ ghi đè kết quả mới.

## Assumptions

- Hệ thống xác thực và phân quyền hiện có cung cấp danh tính người dùng và vai trò quản trị viên/kỹ
  thuật viên; feature này không thay đổi cơ chế đăng nhập.
- Quản trị viên có quyền CRUD và soft delete object/device; kỹ thuật viên có quyền sửa config và hiệu
  chỉnh preset trong phạm vi được cấp. Người có quyền cấu hình được gửi yêu cầu enforcement kèm lý do;
  chỉ quản trị viên có quyền approval và khác người gửi yêu cầu mới được approve/reject.
- Object đang có device active không được soft delete; đây là mặc định an toàn thay cho cascade delete.
- Bản ghi đã soft delete không được khôi phục hoặc tái sử dụng code trong MVP.
- Preset thiếu dữ liệu calibration được phép lưu như draft chưa calibrated.
- Pan, tilt và zoom dùng miền giá trị do device type/backend công bố; nếu chưa có metadata, plan phải
  thống nhất giới hạn contract trước khi implementation.
- Backend sẽ cung cấp contract cho module; mock chỉ phục vụ phát triển và không thay thế kiểm thử với
  backend thật.
- Frontend lấy actor hiện tại và permission set từ session context của module; backend vẫn là authority
  và MUST kiểm tra lại quyền cho mọi request, không tin việc ẩn/hiện action ở client.
