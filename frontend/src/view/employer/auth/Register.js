import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  BsArrowLeft,
  BsArrowRight,
  BsBriefcaseFill,
  BsBuildings,
  BsCheckCircleFill,
  BsCloudUpload,
  BsEnvelope,
  BsFileEarmarkCheck,
  BsGlobe2,
  BsGeoAlt,
  BsPeople,
  BsPersonBadge,
  BsShieldCheck,
  BsTelephone,
} from "react-icons/bs";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import authApi from "../../../api/auth";
import "./register.css";

export default function EmployerRegister() {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    watch,
  } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const documents = watch("documents");

  const selectedDocuments = useMemo(() => Array.from(documents || []), [documents]);

  const requiredMark = <span className="employer-register__required"> *</span>;
  const fieldError = (message) => <div className="employer-register__field-error">{message}</div>;

  const onSubmit = async (data) => {
    const formData = new FormData();
    const uploadedDocuments = Array.from(data.documents || []);

    if (uploadedDocuments.length === 0) {
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

    uploadedDocuments.forEach((file) => {
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
    <main className="employer-register-page">
      <section className="employer-register-shell" aria-label="Đăng ký nhà tuyển dụng">
        <aside className="employer-register-panel">
          <Link to="/" className="employer-register-brand">
            <span>
              <BsBriefcaseFill />
            </span>
            <div>
              <strong>Recruitment Studio</strong>
              <small>Employer onboarding</small>
            </div>
          </Link>

          <div className="employer-register-panel__copy">
            <span className="employer-register-kicker">
              <BsShieldCheck />
              Xác minh doanh nghiệp
            </span>
            <h1>Tạo hồ sơ nhà tuyển dụng chuyên nghiệp ngay từ bước đầu.</h1>
            <p>
              Gửi thông tin công ty và giấy tờ xác minh. Sau khi admin duyệt, hệ thống sẽ cấp quyền cho tài
              khoản tổng công ty để quản lý chi nhánh, HR và tin tuyển dụng.
            </p>
          </div>

          <div className="employer-register-steps" aria-label="Quy trình xét duyệt">
            <div>
              <span>01</span>
              <strong>Gửi hồ sơ</strong>
              <p>Điền thông tin pháp lý, liên hệ và đính kèm giấy tờ xác minh.</p>
            </div>
            <div>
              <span>02</span>
              <strong>Admin duyệt</strong>
              <p>Đội vận hành kiểm tra hồ sơ trước khi kích hoạt tài khoản.</p>
            </div>
            <div>
              <span>03</span>
              <strong>Bắt đầu tuyển dụng</strong>
              <p>Quản lý công ty, chi nhánh, HR, tin tuyển dụng và ứng viên.</p>
            </div>
          </div>
        </aside>

        <section className="employer-register-card">
          <div className="employer-register-card__head">
            <div>
              <span className="employer-register-card__eyebrow">
                <BsCheckCircleFill />
                Hồ sơ đăng ký
              </span>
              <h2>Đăng ký nhà tuyển dụng</h2>
              <p>Thông tin càng đầy đủ thì quá trình duyệt tài khoản càng nhanh.</p>
            </div>
            <Link to="/employer/login" className="employer-register-login-link">
              <BsArrowLeft />
              Đã có tài khoản
            </Link>
          </div>

          <form className="employer-register-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="employer-register-section">
              <div className="employer-register-section__title">
                <BsBuildings />
                <div>
                  <h3>Thông tin công ty</h3>
                  <p>Dùng để tạo hồ sơ tổng công ty và phục vụ xét duyệt.</p>
                </div>
              </div>

              <div className="employer-register-grid">
                <label className="employer-register-field" htmlFor="company_name">
                  <span>Tên công ty{requiredMark}</span>
                  <div className="employer-register-input">
                    <BsBuildings />
                    <input
                      id="company_name"
                      autoComplete="organization"
                      placeholder="Công ty cổ phần ABC"
                      {...register("company_name", { required: true })}
                    />
                  </div>
                  {errors.company_name && fieldError("Vui lòng nhập tên công ty.")}
                </label>

                <label className="employer-register-field" htmlFor="email">
                  <span>Email nhận tài khoản{requiredMark}</span>
                  <div className="employer-register-input">
                    <BsEnvelope />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="hr@congty.vn"
                      {...register("email", { required: true })}
                    />
                  </div>
                  {errors.email && fieldError("Vui lòng nhập email.")}
                </label>

                <label className="employer-register-field employer-register-field--wide" htmlFor="address">
                  <span>Địa chỉ trụ sở{requiredMark}</span>
                  <div className="employer-register-input">
                    <BsGeoAlt />
                    <input
                      id="address"
                      autoComplete="street-address"
                      placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                      {...register("address", { required: true })}
                    />
                  </div>
                  {errors.address && fieldError("Vui lòng nhập địa chỉ.")}
                </label>

                <label className="employer-register-field employer-register-field--wide" htmlFor="description">
                  <span>Mô tả công ty</span>
                  <textarea
                    id="description"
                    rows="4"
                    placeholder="Mô tả ngắn về lĩnh vực hoạt động, quy mô và nhu cầu tuyển dụng..."
                    {...register("description")}
                  />
                </label>
              </div>
            </div>

            <div className="employer-register-section">
              <div className="employer-register-section__title">
                <BsPersonBadge />
                <div>
                  <h3>Liên hệ & quy mô</h3>
                  <p>Thông tin giúp admin liên hệ khi cần xác minh thêm.</p>
                </div>
              </div>

              <div className="employer-register-grid">
                <label className="employer-register-field" htmlFor="contact_name">
                  <span>Người liên hệ</span>
                  <div className="employer-register-input">
                    <BsPersonBadge />
                    <input
                      id="contact_name"
                      autoComplete="name"
                      placeholder="Nguyễn Văn A"
                      {...register("contact_name")}
                    />
                  </div>
                </label>

                <label className="employer-register-field" htmlFor="phone">
                  <span>Số điện thoại</span>
                  <div className="employer-register-input">
                    <BsTelephone />
                    <input id="phone" autoComplete="tel" placeholder="0900 000 000" {...register("phone")} />
                  </div>
                </label>

                <label className="employer-register-field" htmlFor="website">
                  <span>Website</span>
                  <div className="employer-register-input">
                    <BsGlobe2 />
                    <input id="website" type="url" placeholder="https://congty.vn" {...register("website")} />
                  </div>
                </label>

                <div className="employer-register-range">
                  <label className="employer-register-field" htmlFor="min_employees">
                    <span>Nhân sự từ</span>
                    <div className="employer-register-input">
                      <BsPeople />
                      <input id="min_employees" type="number" min="0" placeholder="50" {...register("min_employees")} />
                    </div>
                  </label>

                  <label className="employer-register-field" htmlFor="max_employees">
                    <span>Đến</span>
                    <div className="employer-register-input">
                      <input id="max_employees" type="number" min="0" placeholder="200" {...register("max_employees")} />
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="employer-register-section employer-register-section--upload">
              <div className="employer-register-section__title">
                <BsFileEarmarkCheck />
                <div>
                  <h3>Giấy tờ xác minh</h3>
                  <p>Hỗ trợ PDF, JPG, PNG, WEBP. Có thể tải nhiều file cùng lúc.</p>
                </div>
              </div>

              <label className="employer-register-upload" htmlFor="documents">
                <input
                  id="documents"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  {...register("documents", { required: true })}
                />
                <span className="employer-register-upload__icon">
                  <BsCloudUpload />
                </span>
                <strong>
                  {selectedDocuments.length > 0
                    ? `Đã chọn ${selectedDocuments.length} file`
                    : "Tải lên giấy phép kinh doanh hoặc giấy tờ xác minh"}
                </strong>
                <small>Kéo thả hoặc bấm để chọn file. Tối đa 5 file, mỗi file 10MB.</small>
              </label>

              {selectedDocuments.length > 0 && (
                <div className="employer-register-files" aria-label="File đã chọn">
                  {selectedDocuments.slice(0, 5).map((file) => (
                    <span key={`${file.name}-${file.size}`}>{file.name}</span>
                  ))}
                </div>
              )}
              {errors.documents && fieldError("Vui lòng tải lên giấy tờ xác minh.")}
            </div>

            <button type="submit" className="employer-register-submit" disabled={isSubmitting}>
              <span>{isSubmitting ? "Đang gửi hồ sơ..." : "Gửi hồ sơ đăng ký"}</span>
              {isSubmitting ? <span className="employer-register-spinner" /> : <BsArrowRight />}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
