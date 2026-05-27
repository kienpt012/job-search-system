# Recruitment System

Hệ thống tuyển dụng web gồm 3 khu vực chính:

- Ứng viên
- Nhà tuyển dụng
- Quản trị hệ thống

Project được tách thành:

- `frontend`: React
- `backend`: Laravel API
  
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


```powershell
cd backend
php artisan migrate
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

Tài khoản admin mẫu trong tài liệu:

- Email: `admin@local.test`
- Password: `Admin@123`
---
