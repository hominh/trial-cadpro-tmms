# Contributing

## Quy trình

1. Chọn hoặc tạo issue có acceptance criteria.
2. Tạo branch theo [SDLC](docs/SDLC.md).
3. Với feature, hoàn tất `specify -> plan -> tasks` trước khi sửa source.
4. Thực hiện từng task nhỏ, dùng Conventional Commits.
5. Chạy kiểm tra cục bộ và mở pull request bằng template có sẵn.

## Kiểm tra bắt buộc

```powershell
powershell -ExecutionPolicy Bypass -File scripts/validate-sdlc.ps1
npm run lint
npm run typecheck
npm test --if-present
npm run build
```

Các lệnh npm áp dụng sau khi ứng dụng đã được khởi tạo. Không bypass lỗi CI bằng cách tắt strict
mode, bỏ lint rule hoặc thêm type escape không có phạm vi.

## Review

Reviewer kiểm tra hành vi, constitution, ranh giới feature, API layer, state ownership, khả năng hủy
polling và ảnh hưởng ở quy mô 2.000+ thiết bị. Tác giả chịu trách nhiệm cập nhật PR sau review và
resolve từng discussion.
