import "./admin.css";
import { useEffect, useState } from "react";
import { BsCheckCircleFill, BsFileEarmarkTextFill, BsXCircleFill } from "react-icons/bs";
import { toast } from "react-toastify";
import adminApi from "../../api/admin";

const statusText = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
};

export default function EmployerApprovals() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      setRegistrations(await adminApi.getEmployerRegistrations());
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể tải danh sách đăng ký.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  const approve = async (registration) => {
    setProcessingId(registration.id);
    try {
      await adminApi.approveEmployerRegistration(registration.id);
      toast.success("Đã duyệt và gửi email tài khoản cho nhà tuyển dụng.");
      await loadRegistrations();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể duyệt hồ sơ.");
    } finally {
      setProcessingId(null);
    }
  };

  const reject = async (registration) => {
    setProcessingId(registration.id);
    try {
      await adminApi.rejectEmployerRegistration(registration.id);
      toast.success("Đã từ chối hồ sơ đăng ký.");
      await loadRegistrations();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể từ chối hồ sơ.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="system-admin-dashboard">
      <section className="system-admin-hero">
        <div>
          <div className="system-admin-kicker">Employer approval</div>
          <h1>Duyệt nhà tuyển dụng</h1>
          <p>
            Kiểm tra thông tin công ty, giấy tờ xác minh và cấp tài khoản nhà tuyển dụng sau khi hồ sơ hợp lệ.
          </p>
        </div>
        <div className="system-admin-hero__meta">
          <div className="system-admin-chip">
            <BsFileEarmarkTextFill />
            <span>{registrations.filter((item) => item.status === "pending").length} hồ sơ chờ duyệt</span>
          </div>
        </div>
      </section>

      <section className="system-panel">
        <div className="system-panel__head">
          <div>
            <h2>Hồ sơ đăng ký</h2>
            <p>Duyệt hồ sơ sẽ tự động tạo tài khoản, mật khẩu mặc định và gửi email cho nhà tuyển dụng.</p>
          </div>
        </div>

        {loading ? (
          <div className="system-empty-state">Đang tải hồ sơ...</div>
        ) : registrations.length === 0 ? (
          <div className="system-empty-state">Chưa có hồ sơ đăng ký nhà tuyển dụng.</div>
        ) : (
          <div className="system-registration-list">
            {registrations.map((registration) => (
              <article key={registration.id} className="system-registration-card">
                <div className="system-registration-card__main">
                  <div>
                    <h3>{registration.company_name}</h3>
                    <p>{registration.email}</p>
                    <p>{registration.address}</p>
                  </div>
                  <span className={`system-badge system-badge--${registration.status}`}>
                    {statusText[registration.status] || registration.status}
                  </span>
                </div>

                <div className="system-registration-card__grid">
                  <div>
                    <strong>Người liên hệ</strong>
                    <span>{registration.contact_name || "-"}</span>
                  </div>
                  <div>
                    <strong>Điện thoại</strong>
                    <span>{registration.phone || "-"}</span>
                  </div>
                  <div>
                    <strong>Website</strong>
                    <span>{registration.website || "-"}</span>
                  </div>
                  <div>
                    <strong>Quy mô</strong>
                    <span>
                      {registration.min_employees || "-"} - {registration.max_employees || "-"}
                    </span>
                  </div>
                </div>

                {registration.description && (
                  <p className="system-registration-card__description">{registration.description}</p>
                )}

                <div className="system-registration-card__documents">
                  {(registration.documents || []).map((document, index) => (
                    <a key={`${registration.id}-${index}`} href={document.url} target="_blank" rel="noreferrer">
                      <BsFileEarmarkTextFill />
                      <span>{document.name || `Tài liệu ${index + 1}`}</span>
                    </a>
                  ))}
                </div>

                {registration.status === "pending" && (
                  <div className="system-registration-card__actions">
                    <button
                      type="button"
                      className="admin-primary-btn"
                      disabled={processingId === registration.id}
                      onClick={() => approve(registration)}
                    >
                      <BsCheckCircleFill />
                      <span>Duyệt và gửi email</span>
                    </button>
                    <button
                      type="button"
                      className="admin-secondary-btn"
                      disabled={processingId === registration.id}
                      onClick={() => reject(registration)}
                    >
                      <BsXCircleFill />
                      <span>Từ chối</span>
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
