# Thanh toán cho nhà tuyển dụng bằng payOS

Tính năng thanh toán của nhà tuyển dụng đang dùng payOS. Lý do chọn payOS là vì nền tảng này hỗ trợ thanh toán ngân hàng nội địa/VietQR tại Việt Nam, đăng ký nhanh và có luồng thanh toán hosted checkout đơn giản để tích hợp vào Laravel + React.

## Biến môi trường cần cấu hình

Thêm các giá trị sau vào file `backend/.env`:

```env
FRONTEND_URL=http://localhost:3000
PAYOS_CLIENT_ID=your_client_id
PAYOS_API_KEY=your_api_key
PAYOS_CHECKSUM_KEY=your_checksum_key
PAYOS_BASE_URL=https://api-merchant.payos.vn
```

Sau khi cập nhật `.env`, chạy lệnh sau trong thư mục `backend`:

```bash
php artisan config:clear
```

`PAYOS_PARTNER_CODE` là biến không bắt buộc. Chỉ cần cấu hình biến này nếu tài khoản payOS của bạn dùng tích hợp dạng đối tác.

## Cấu hình trên payOS dashboard

1. Tạo tài khoản payOS và hoàn tất xác minh.
2. Liên kết tài khoản ngân hàng nhận tiền.
3. Tạo kênh thanh toán, sau đó sao chép `Client ID`, `API Key` và `Checksum Key`.
4. Cấu hình webhook URL:

```text
https://your-backend-domain.com/api/payments/payos/webhook
```

Khi phát triển ở local, webhook của payOS sẽ không gọi được vào `localhost` nếu backend chưa được public ra internet bằng tunnel. Vì vậy trang thanh toán của nhà tuyển dụng có nút "Đồng bộ" để backend chủ động gọi payOS, kiểm tra trạng thái giao dịch và kích hoạt gói sau khi thanh toán.

## Luồng thanh toán

1. Nhà tuyển dụng vào trang `Thanh toán` trong khu employer.
2. Chọn gói dịch vụ cần mua.
3. Backend tạo payment link qua payOS và trả về `checkout_url`.
4. Frontend chuyển nhà tuyển dụng sang trang thanh toán của payOS.
5. Khi thanh toán thành công, payOS gọi webhook về backend.
6. Backend xác minh chữ ký webhook, đánh dấu giao dịch là `PAID` và kích hoạt gói.
7. Nếu webhook chưa về được trong môi trường local, nhà tuyển dụng có thể bấm "Đồng bộ" để cập nhật trạng thái thủ công.

## Quy tắc nghiệp vụ

- Nhà tuyển dụng phải có gói đang hoạt động thì mới được tạo tin tuyển dụng mới.
- Mỗi gói có giới hạn số lượt đăng tin riêng.
- Tính năng tìm kiếm ứng viên, gợi ý ứng viên và liên hệ ứng viên yêu cầu gói `growth` hoặc `pro`.
- Khi thanh toán thành công, hệ thống kích hoạt subscription mới và đánh dấu subscription cũ là hết hạn.

## Các gói hiện tại

Các gói đang được cấu hình trong `backend/config/employer_billing.php`:

- `starter`: gói đăng tuyển cơ bản, 3 tin trong 30 ngày.
- `growth`: 10 tin trong 30 ngày, có tìm kiếm và liên hệ ứng viên.
- `pro`: 30 tin trong 90 ngày, có tìm kiếm và liên hệ ứng viên.

Muốn đổi giá, số lượt đăng tin hoặc thời hạn gói thì chỉnh trực tiếp trong file cấu hình này.
