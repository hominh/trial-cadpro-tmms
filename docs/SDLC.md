# Software Development Life Cycle

## 1. Mô hình phát triển

Dự án dùng trunk-based development. `main` luôn ở trạng thái có thể phát hành; mọi thay đổi đi qua
branch ngắn hạn và pull request.

| Loại thay đổi | Tên branch | Yêu cầu |
|---|---|---|
| Feature | `feat/###-short-name` | Spec Kit đầy đủ |
| Bug fix | `fix/###-short-name` | Issue, acceptance criteria và regression coverage |
| Tài liệu | `docs/short-name` | Review nội dung |
| Bảo trì | `chore/short-name` | Không thay đổi hành vi ngoài phạm vi mô tả |
| Khẩn cấp | `hotfix/short-name` | PR rút gọn, review bắt buộc, bổ sung hậu kiểm |

Không có branch phát triển dài hạn. Branch phải được cập nhật từ `main` trước khi merge và được xóa
sau khi merge.

## 2. Vòng đời feature

1. **Intake**: tạo issue, mô tả giá trị, phạm vi, rủi ro và tiêu chí chấp nhận.
2. **Specify**: tạo `specs/###-feature/spec.md`; yêu cầu tập trung vào hành vi và kết quả đo được.
3. **Clarify**: xử lý các quyết định ảnh hưởng phạm vi, dữ liệu, quyền và hành vi lỗi.
4. **Plan**: tạo `plan.md` và artifacts thiết kế; vượt qua Constitution Check.
5. **Tasks**: tạo `tasks.md` có thứ tự phụ thuộc, đường dẫn cụ thể và khả năng kiểm thử độc lập.
6. **Implement**: thực hiện theo tasks; cập nhật artifacts trước nếu thiết kế thay đổi đáng kể.
7. **Verify**: chạy validation, lint, typecheck, test và production build.
8. **Review**: pull request cần CI xanh, CODEOWNER approval và mọi trao đổi đã được xử lý.
9. **Release**: squash merge vào `main`; phát hành bằng tag SemVer khi đạt release scope.
10. **Operate**: theo dõi lỗi/hồi quy; hotfix vẫn phải qua PR và có hậu kiểm.

## 3. Definition of Ready

Một feature sẵn sàng triển khai khi:

- `spec.md`, `plan.md`, `tasks.md` tồn tại và thống nhất;
- acceptance scenarios và success criteria đo được;
- API, shadcn/ui primitives và ownership trong `src/features/<feature>/` đã rõ;
- local/UI state và polling/server state đã được phân loại thành store riêng;
- realtime/geo có viewport contract, polling cadence, AbortController lifecycle và mục tiêu 2.000+
  thiết bị;
- phụ thuộc, bảo mật và migration risk đã được ghi nhận.

## 4. Definition of Done

- Tất cả acceptance scenarios trong scope đạt yêu cầu.
- Không có direct `fetch`, Axios instance riêng, TanStack Query hoặc UI library ngoài shadcn/ui.
- TypeScript strict typecheck, lint, test liên quan và production build đều thành công.
- Polling hủy request cũ và dừng khi dispose; stale response không ghi đè dữ liệu mới.
- Spec/plan/tasks và tài liệu vận hành phản ánh đúng implementation.
- Pull request được approve và không còn discussion chưa xử lý.

## 5. Pull request và commit

Commit dùng Conventional Commits: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`, `build`,
`perf`, `revert`. Pull request nên được squash; tiêu đề squash phải theo cùng định dạng.

Kích thước PR ưu tiên nhỏ và có một mục tiêu. Thay đổi kiến trúc, dependency hoặc ngoại lệ
constitution phải được nêu rõ trong PR.

## 6. Chất lượng và bảo mật

CI chạy trên pull request và push vào `main`. Không merge khi required checks thất bại. Secret không
được commit; security finding không được thảo luận trong public issue—xem `SECURITY.md`.

Dependency update do Dependabot tạo theo lịch hàng tuần và vẫn phải qua cùng quality gates.

## 7. Phiên bản và phát hành

Release dùng SemVer:

- MAJOR: thay đổi không tương thích;
- MINOR: feature tương thích ngược;
- PATCH: bug/security fix tương thích ngược.

Tag có dạng `vX.Y.Z`. Release notes phải nhóm breaking changes, features, fixes, security và known
issues. Rollback dùng revert commit hoặc triển khai lại tag ổn định gần nhất; không force-push
`main`.

## 8. GitHub repository settings

Sau commit đầu tiên, cấu hình ruleset cho `main`:

- yêu cầu pull request và tối thiểu một approval;
- yêu cầu CODEOWNER review;
- dismiss stale approvals khi có commit mới;
- yêu cầu discussion được resolve;
- yêu cầu check `SDLC / validate` thành công;
- chặn force push và deletion;
- bật secret scanning, push protection và Dependabot alerts nếu gói GitHub hỗ trợ.
