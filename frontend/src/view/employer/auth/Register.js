import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import authApi from "../../../api/auth";

export default function EmployerRegister() {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    const formData = new FormData();
    const documents = Array.from(data.documents || []);

    if (documents.length === 0) {
      toast.error("Vui lòng tải lên giấy tờ xác minh.");
      return;
    }

    [
      "email",
      "company_name",
      "address",
      "contact_name",
      "phone",
      "website",
      "min_employees",
      "max_employees",
      "description",
    ].forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    documents.forEach((file) => {
      formData.append("documents[]", file);
    });

    setIsSubmitting(true);
    try {
      await authApi.registerEmployer(formData);
      toast.success("Đã gửi hồ sơ đăng ký. Admin sẽ duyệt và gửi tài khoản qua email.");
      reset();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể gửi hồ sơ đăng ký.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto" style={{ marginTop: "70px", width: "min(760px, calc(100vw - 32px))" }}>
      <form className="border px-4 py-4 rounded shadow bg-white" onSubmit={handleSubmit(onSubmit)}>
        <h4 className="mb-1 text-center">Đăng ký nhà tuyển dụng</h4>
        <p className="text-center text-secondary mb-4">
          Gửi thông tin công ty và giấy tờ xác minh. Tài khoản sẽ được cấp sau khi admin duyệt.
        </p>

        <div className="row g-3">
          <div className="col-md-6">
            <label className="mb-1">Email nhận tài khoản *</label>
            <input className="form-control" type="email" {...register("email", { required: true })} />
            {errors.email && <div className="text-danger small mt-1">Vui lòng nhập email.</div>}
          </div>

          <div className="col-md-6">
            <label className="mb-1">Tên công ty *</label>
            <input className="form-control" {...register("company_name", { required: true })} />
            {errors.company_name && <div className="text-danger small mt-1">Vui lòng nhập tên công ty.</div>}
          </div>

          <div className="col-md-12">
            <label className="mb-1">Địa chỉ *</label>
            <input className="form-control" {...register("address", { required: true })} />
            {errors.address && <div className="text-danger small mt-1">Vui lòng nhập địa chỉ.</div>}
          </div>

          <div className="col-md-6">
            <label className="mb-1">Người liên hệ</label>
            <input className="form-control" {...register("contact_name")} />
          </div>

          <div className="col-md-6">
            <label className="mb-1">Số điện thoại</label>
            <input className="form-control" {...register("phone")} />
          </div>

          <div className="col-md-6">
            <label className="mb-1">Website</label>
            <input className="form-control" placeholder="https://..." {...register("website")} />
          </div>

          <div className="col-md-3">
            <label className="mb-1">Nhân sự từ</label>
            <input className="form-control" type="number" min="0" {...register("min_employees")} />
          </div>

          <div className="col-md-3">
            <label className="mb-1">Đến</label>
            <input className="form-control" type="number" min="0" {...register("max_employees")} />
          </div>

          <div className="col-md-12">
            <label className="mb-1">Mô tả công ty</label>
            <textarea className="form-control" rows="4" {...register("description")} />
          </div>

          <div className="col-md-12">
            <label className="mb-1">Giấy tờ chứng từ *</label>
            <input
              className="form-control"
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              {...register("documents", { required: true })}
            />
            <div className="text-secondary small mt-1">Hỗ trợ PDF/ảnh, tối đa 5 file, mỗi file 10MB.</div>
            {errors.documents && <div className="text-danger small mt-1">Vui lòng tải lên giấy tờ xác minh.</div>}
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-100 mt-4" disabled={isSubmitting}>
          {isSubmitting ? "Đang gửi..." : "Gửi hồ sơ đăng ký"}
        </button>

        <div className="text-center mt-3">
          Đã có tài khoản? <Link to="/employer/login">Đăng nhập</Link>
        </div>
      </form>
    </div>
  );
}
