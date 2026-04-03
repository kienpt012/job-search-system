# Hướng Dẫn Cập Nhật SQL Và Chạy Module Quản Trị Hệ Thống

## 1. Trạng thái code

Module quản trị hệ thống mới dùng `users.role = 0`.

Chức năng đã có:

- Đăng nhập quản trị riêng tại `/admin/login`
- Xem dashboard thống kê người dùng, công ty, job, lượt ứng tuyển
- Thêm công ty mới kèm tài khoản nhà tuyển dụng
- Chỉnh công ty, đổi email, đổi mật khẩu employer, cập nhật logo và ảnh nền
- Khóa hoặc mở khóa tài khoản
- Xóa cứng tài khoản người dùng
- Xóa công ty và xóa dữ liệu liên quan ở các bảng khác

## 2. Cập nhật SQL cho tài khoản admin

Trong `recruitment.sql` gốc hiện đã có sẵn một user admin:

- `id = 6`
- `email = ngoc@gmail.com`
- `role = 0`

Bạn nên cập nhật lại tài khoản này thành thông tin dễ nhớ hơn bằng SQL sau:

```sql
UPDATE users
SET
  email = 'admin@local.test',
  password = '$2y$10$rBGzS8VO8K.ufTiQqeX5nepWS3bawUOBttDupoRmAvLwU6oP0qEki',
  role = 0,
  is_active = 1,
  updated_at = NOW()
WHERE id = 6;
```

Thông tin đăng nhập sau khi update:

- Email: `admin@local.test`
- Password: `Admin@123`

Nếu database của bạn không còn dòng `id = 6`, có thể thêm admin mới bằng câu lệnh này:

```sql
INSERT INTO users (email, email_verified_at, password, remember_token, role, is_active, created_at, updated_at)
VALUES (
  'admin@local.test',
  NULL,
  '$2y$10$rBGzS8VO8K.ufTiQqeX5nepWS3bawUOBttDupoRmAvLwU6oP0qEki',
  NULL,
  0,
  1,
  NOW(),
  NOW()
);
```

## 3. Nếu bạn import lại `recruitment.sql`

Có 2 cách:

1. Import `recruitment.sql` như bình thường, rồi chạy câu `UPDATE users ... WHERE id = 6` ở trên.
2. Hoặc sửa trực tiếp block `INSERT INTO users` trong `recruitment.sql` để dòng `id = 6` mang email và password mới trước khi import.

## 4. Chạy dự án

### Backend

```powershell
cd backend
php artisan serve
```

Backend mặc định:

- `http://127.0.0.1:8000`

### Frontend

```powershell
cd frontend
npm install
npm start
```

Frontend mặc định:

- `http://localhost:3000`

## 5. Đường dẫn đăng nhập admin

Mở:

- `http://localhost:3000/admin/login`

## 6. Lưu ý khi xóa dữ liệu

Khi admin xóa user hoặc xóa công ty, code sẽ dọn dữ liệu liên quan ở các bảng như:

- `employers`
- `jobs`
- `job_applying`
- `candidate_messages`
- `saved_jobs`
- `educations`
- `experiences`
- `projects`
- `skills`
- `certificates`
- `prizes`
- `activities`
- `others`
- `resumes`

Đồng thời các file local liên quan như CV, logo công ty, ảnh nền công ty cũng sẽ bị xóa nếu chúng đang nằm trong thư mục dự án.
