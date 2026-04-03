# Cập nhật chức năng vị trí công ty trên bản đồ

## Mô hình dữ liệu mới

Thay vì nhập tay địa chỉ dài trong form công ty, hệ thống giờ lưu:

- `employers.address`: địa chỉ hiển thị lấy từ vị trí ghim trên bản đồ
- `employers.map_lat`: vĩ độ
- `employers.map_lng`: kinh độ

Frontend sẽ tự dựng nút xem bản đồ và link mở bản đồ lớn từ `map_lat` + `map_lng`, không lưu mã nhúng iframe vào database.

## Nếu bạn đang chạy Laravel migration

Chạy trong thư mục `backend`:

```bash
php artisan migrate
```

Migration đã có sẵn:

- [2026_04_02_210000_add_map_fields_to_employers_table.php](/f:/projectvu/recruitment_web-xw1rpa/recruitment_web/backend/database/migrations/2026_04_02_210000_add_map_fields_to_employers_table.php)

## Nếu bạn cập nhật DB thủ công từ `recruitment.sql`

Chạy SQL này trên database hiện tại:

```sql
ALTER TABLE employers
  ADD COLUMN map_lat DECIMAL(10,7) NULL AFTER address,
  ADD COLUMN map_lng DECIMAL(10,7) NULL AFTER map_lat;
```

## Sau khi cập nhật DB

1. Khởi động lại backend nếu đang chạy.
2. Reload frontend.
3. Vào dashboard nhà tuyển dụng hoặc admin, chọn công ty và ghim vị trí trên bản đồ.
4. Lưu công ty.
5. Vào trang chi tiết job hoặc trang công ty để bấm `Xem vị trí công ty`.

## Ghi chú

- Dữ liệu cũ vẫn dùng được. Nếu công ty chưa có `map_lat` và `map_lng`, nút xem bản đồ sẽ không hiện.
- Địa chỉ hiển thị được lấy tự động từ bản đồ và cắt an toàn theo giới hạn cột hiện tại.
