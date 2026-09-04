# Security Policy

## Reporting

Không tạo public issue cho lỗ hổng hoặc credential bị lộ. Hãy dùng GitHub Security Advisory riêng
của repository và cung cấp mô tả, phạm vi ảnh hưởng, cách tái hiện và remediation đề xuất.

Không đưa secret, token, dữ liệu khách hàng hoặc payload sản xuất vào repository, issue, log CI hay
ảnh chụp màn hình. Nếu credential bị commit, phải revoke/rotate ngay; xóa lịch sử Git không thay thế
việc rotate.

## Supported versions

Cho đến khi có release ổn định đầu tiên, chỉ nhánh `main` được hỗ trợ. Sau đó, chính sách hỗ trợ sẽ
được ghi trong release notes.
