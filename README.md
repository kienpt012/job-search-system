# Recruitment System

Hệ thống tuyển dụng web gồm 3 khu vực chính:

- Ứng viên
- Nhà tuyển dụng
- Quản trị hệ thống

Project được tách thành:

- `frontend`: React
- `backend`: Laravel API
- `docs`: tài liệu cập nhật DB / hướng dẫn các module đã bổ sung

## 1. Tính năng chính

### Ứng viên

- Xem danh sách công ty, danh sách việc làm, việc làm nổi bật, công ty nổi bật
- Xem chi tiết công ty và chi tiết việc làm
- Lưu việc làm, ứng tuyển việc làm
- Quản lý hồ sơ online
- Upload CV có sẵn hoặc nộp bằng hồ sơ online được render ra PDF
- Quản lý thông tin cá nhân, học vấn, kinh nghiệm, kỹ năng, dự án, chứng chỉ, giải thưởng, hoạt động
- Ghim vị trí nơi ở bằng bản đồ, link Google Maps hoặc GPS hiện tại
- Gợi ý công ty gần nơi ở trong bán kính mặc định `< 10km`
- Candidate dashboard tổng quan

### Nhà tuyển dụng

- Dashboard thống kê ứng viên / việc làm
- Quản lý việc làm đã đăng
- Xem danh sách ứng viên ứng tuyển
- Chỉnh thông tin công ty
- Upload logo và ảnh nền công ty
- Ghim vị trí công ty trên bản đồ

### Quản trị hệ thống

- Dashboard thống kê toàn hệ thống
- Quản lý công ty
- Quản lý người dùng
- Khóa / mở khóa tài khoản
- Đổi mật khẩu tài khoản
- Xóa cứng tài khoản và dọn dữ liệu liên quan
- Quản lý việc làm toàn hệ thống
- Quản lý giao diện hero slider trang chủ
  - thêm slide
  - chọn đích đến: trang công ty / trang việc làm / custom link
  - kéo thả sắp xếp thứ tự slide
  - bật / tắt hiển thị từng slide

## 2. Công nghệ sử dụng

### Frontend

- React 18
- React Router DOM 6
- Redux Toolkit
- Axios
- Bootstrap 5
- React Icons
- React Toastify
- html2canvas / html-to-image / jsPDF

### Backend

- Laravel 10
- PHP 8.1+
- JWT Auth: `php-open-source-saver/jwt-auth`
- Pusher PHP Server
- Predis

### Dữ liệu / tích hợp

- MySQL
- OpenStreetMap + Leaflet
- Google Maps link sharing / search URL

## 3. Kiến trúc thư mục

```text
recruitment_web/
├─ backend/    # Laravel API + migrations + controllers
├─ frontend/   # React app
├─ docs/       # Tài liệu cập nhật DB và module
└─ README.md
```

## 4. Yêu cầu môi trường

- PHP `>= 8.1`
- Composer
- Node.js `>= 18` khuyến nghị
- npm
- MySQL / MariaDB

## 5. Cài đặt project

### 5.1. Backend

```powershell
cd backend
composer install
copy .env.example .env
php artisan key:generate
php artisan jwt:secret
```

Sau đó chỉnh `.env`:

- `APP_URL=http://127.0.0.1:8000`
- cấu hình `DB_*`

### 5.2. Frontend

```powershell
cd frontend
npm install
```

Tạo file `.env` trong `frontend` nếu chưa có:

```env
REACT_APP_API_URL=http://127.0.0.1:8000
```

## 6. Khởi tạo database

Có 2 cách:

### Cách A: dùng Laravel migration

```powershell
cd backend
php artisan migrate
```

### Cách B: import DB mẫu / SQL cũ rồi cập nhật thêm

Nếu bạn đang dùng database import từ bản cũ hoặc từ `recruitment.sql`, cần đảm bảo đã có các thay đổi mới:

- `employers.map_lat`
- `employers.map_lng`
- `candidates.map_lat`
- `candidates.map_lng`
- bảng `hero_slides`
- `hero_slides.sort_order`

Tài liệu chi tiết:

- [docs/company-location-map-update.md](docs/company-location-map-update.md)
- [docs/candidate-location-nearby-update.md](docs/candidate-location-nearby-update.md)
- [docs/system-admin-update.md](docs/system-admin-update.md)

### SQL thủ công cho các phần mới

#### Thêm map cho công ty

```sql
ALTER TABLE employers
  ADD COLUMN map_lat DECIMAL(10,7) NULL AFTER address,
  ADD COLUMN map_lng DECIMAL(10,7) NULL AFTER map_lat;
```

#### Thêm map cho candidate

```sql
ALTER TABLE candidates
  ADD COLUMN map_lat DECIMAL(10,7) NULL AFTER address,
  ADD COLUMN map_lng DECIMAL(10,7) NULL AFTER map_lat;
```

#### Tạo bảng hero slider

```sql
CREATE TABLE hero_slides (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  image VARCHAR(255) NOT NULL,
  target_type VARCHAR(20) NOT NULL,
  target_company_id BIGINT UNSIGNED NULL,
  target_job_id BIGINT UNSIGNED NULL,
  custom_url VARCHAR(1000) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);
```

#### Gán thứ tự ban đầu cho slide

```sql
SET @rownum := 0;
UPDATE hero_slides
SET sort_order = (@rownum := @rownum + 1)
ORDER BY id;
```

## 7. Chạy project local

### Chạy backend

```powershell
cd backend
php artisan serve
```

Backend mặc định:

- `http://127.0.0.1:8000`

### Chạy frontend

```powershell
cd frontend
npm start
```

Frontend mặc định:

- `http://localhost:3000`

## 8. Tài khoản và đường dẫn chính

### Candidate

- Đăng nhập / đăng ký ở giao diện người dùng
- Dashboard candidate:
  - `http://localhost:3000/candidate`

### Employer

- Đăng nhập:
  - `http://localhost:3000/employer/login`
- Dashboard:
  - `http://localhost:3000/employer`

### Admin

- Đăng nhập:
  - `http://localhost:3000/admin/login`
- Dashboard:
  - `http://localhost:3000/admin`

Nếu bạn đang dùng DB mẫu có admin role `0`, xem thêm:

- [docs/system-admin-update.md](docs/system-admin-update.md)

Tài khoản admin mẫu trong tài liệu:

- Email: `admin@local.test`
- Password: `Admin@123`

## 9. Lưu trữ file local trong project

Hệ thống hiện lưu nhiều tài nguyên trực tiếp trong thư mục dự án:

- CV nộp việc: `backend/storage/cv_images`
- Logo công ty: `backend/storage/company_logos`
- Ảnh nền công ty: `backend/storage/company_covers`
- Ảnh hero slider: `backend/storage/hero_slides`
- Avatar candidate: `backend/public/storage/avatar_images`

Các route public để đọc file được khai báo trong:

- [backend/routes/web.php](backend/routes/web.php)

## 10. Ghi chú nghiệp vụ quan trọng

- Công ty bị khóa sẽ bị ẩn khỏi phía người dùng
- Job của công ty bị khóa cũng sẽ bị ẩn
- Ứng tuyển bằng hồ sơ online sẽ được render thành PDF trước khi nộp
- Ứng tuyển bằng upload hiện được kiểm soát để lưu file trong project
- Vị trí công ty và vị trí ứng viên lưu bằng `lat/lng`, không lưu iframe nhúng map trong database
- Hero slider trang chủ hỗ trợ click điều hướng và sắp xếp thứ tự hiển thị

## 11. Build / kiểm tra

### Frontend

```powershell
cd frontend
npm run build
```

### Backend kiểm tra cú pháp nhanh

```powershell
cd backend
php -l app/Http/Controllers/HeroSlideController.php
php -l app/Http/Controllers/CandidateController.php
php -l app/Http/Controllers/EmployerController.php
php -l app/Http/Controllers/AdminController.php
```

## 12. Tài liệu bổ sung

- [docs/system-admin-update.md](docs/system-admin-update.md)
- [docs/company-location-map-update.md](docs/company-location-map-update.md)
- [docs/candidate-location-nearby-update.md](docs/candidate-location-nearby-update.md)

## 13. Định hướng mở rộng

- Chỉnh sửa slide đã tạo thay vì chỉ thêm / xóa
- Phân trang và filter nâng cao trong admin
- Tìm kiếm theo khoảng cách cho candidate
- Theo dõi hiệu quả click / conversion của hero slider
- Notification realtime hoàn chỉnh hơn cho employer / admin

---

Nếu bạn dùng repo này để demo hoặc làm đồ án, nên giữ phần `docs/` đồng bộ với mỗi lần thay đổi DB để việc import từ SQL cũ không bị thiếu cột hoặc thiếu bảng.
