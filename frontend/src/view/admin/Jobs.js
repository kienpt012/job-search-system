import "./admin.css";
import { useEffect, useMemo, useState } from "react";
import {
  BsArrowRepeat,
  BsBriefcaseFill,
  BsCheckCircleFill,
  BsSearch,
  BsStarFill,
  BsToggleOff,
  BsToggleOn,
} from "react-icons/bs";
import { toast } from "react-toastify";
import AppImage from "../../components/AppImage";
import adminApi from "../../api/admin";

export default function AdminJobs() {
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({
    company_id: "",
    keyword: "",
  });
  const [loading, setLoading] = useState(false);
  const [updatingJobId, setUpdatingJobId] = useState(null);

  const loadCompanies = async () => {
    const res = await adminApi.getDashboard();
    setCompanies(res.companies || []);
  };

  const loadJobs = async (nextFilters = filters) => {
    setLoading(true);
    try {
      const res = await adminApi.getJobs(nextFilters);
      setJobs(res || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể tải danh sách việc làm.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredCompany = useMemo(
    () => companies.find((company) => String(company.id) === String(filters.company_id)),
    [companies, filters.company_id]
  );

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    const nextFilters = { ...filters, [name]: value };
    setFilters(nextFilters);
  };

  const applyFilters = async () => {
    await loadJobs(filters);
  };

  const resetFilters = async () => {
    const nextFilters = { company_id: "", keyword: "" };
    setFilters(nextFilters);
    await loadJobs(nextFilters);
  };

  const handleToggleJobField = async (job, field) => {
    const nextValue = job[field] ? 0 : 1;
    setUpdatingJobId(job.id);

    try {
      await adminApi.updateJob(job.id, { [field]: nextValue });
      toast.success(
        field === "is_active"
          ? nextValue
            ? "Đã bật hiển thị việc làm."
            : "Đã ẩn việc làm."
          : nextValue
          ? "Đã bật việc làm nổi bật."
          : "Đã tắt việc làm nổi bật."
      );
      await loadJobs(filters);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể cập nhật việc làm.");
    } finally {
      setUpdatingJobId(null);
    }
  };

  return (
    <div className="system-admin-dashboard">
      <section className="system-admin-hero">
        <div>
          <div className="system-admin-kicker">Job governance</div>
          <h1>Quản lý việc làm toàn hệ thống</h1>
          <p>
            Chọn công ty để xem danh sách job, kiểm soát trạng thái hiển thị và bật hoặc tắt
            nhãn việc làm nổi bật trực tiếp từ admin.
          </p>
        </div>
        <div className="system-admin-hero__meta">
          <div className="system-admin-chip">
            <BsBriefcaseFill />
            <span>{jobs.length} việc làm theo bộ lọc hiện tại</span>
          </div>
          <div className="system-admin-chip">
            <BsCheckCircleFill />
            <span>{filteredCompany ? filteredCompany.name : "Tất cả công ty"}</span>
          </div>
        </div>
      </section>

      <section className="system-panel">
        <div className="system-panel__head">
          <div>
            <h2>Bộ lọc việc làm</h2>
            <p>Lọc theo công ty và từ khóa tiêu đề việc làm.</p>
          </div>
        </div>

        <div className="system-jobs-filter">
          <label>
            <span>Công ty</span>
            <select
              name="company_id"
              value={filters.company_id}
              onChange={handleFilterChange}
            >
              <option value="">Tất cả công ty</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Từ khóa</span>
            <div className="system-search-field">
              <BsSearch />
              <input
                name="keyword"
                value={filters.keyword}
                onChange={handleFilterChange}
                placeholder="Nhập tên việc làm hoặc công ty"
              />
            </div>
          </label>

          <div className="system-jobs-filter__actions">
            <button type="button" className="admin-primary-btn" onClick={applyFilters}>
              <BsSearch />
              <span>Lọc</span>
            </button>
            <button type="button" className="admin-secondary-btn" onClick={resetFilters}>
              <BsArrowRepeat />
              <span>Đặt lại</span>
            </button>
          </div>
        </div>
      </section>

      <section className="system-panel">
        <div className="system-panel__head">
          <div>
            <h2>Danh sách việc làm</h2>
            <p>
              Admin có thể bật hoặc tắt hiển thị công khai, đồng thời điều khiển trạng thái
              việc làm nổi bật.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="system-empty-state">Đang tải dữ liệu việc làm...</div>
        ) : jobs.length === 0 ? (
          <div className="system-empty-state">Không có việc làm nào khớp bộ lọc.</div>
        ) : (
          <div className="system-job-grid">
            {jobs.map((job) => (
              <article key={job.id} className="system-job-card">
                <div className="system-job-card__top">
                  <div className="system-job-card__company">
                    <div className="system-job-card__logo">
                      <AppImage src={job.employer_logo} fallbackVariant="logo" alt={job.employer_name} />
                    </div>
                    <div>
                      <div className="system-job-card__title">{job.jname}</div>
                      <div className="system-job-card__meta">{job.employer_name}</div>
                      <div className="system-job-card__meta">
                        Đăng ngày {job.post_date || "-"} • Hết hạn {job.deadline || "-"}
                      </div>
                    </div>
                  </div>
                  <div className="system-job-card__badges">
                    <span className={`system-badge ${job.is_active ? "is-active" : "is-locked"}`}>
                      {job.is_active ? "Đang hiển thị" : "Đang ẩn"}
                    </span>
                    <span className={`system-badge ${job.is_hot ? "system-badge--hot" : "system-badge--muted"}`}>
                      {job.is_hot ? "Nổi bật" : "Thường"}
                    </span>
                    <span
                      className={`system-badge ${
                        job.employer_is_active ? "is-active" : "is-locked"
                      }`}
                    >
                      {job.employer_is_active ? "Công ty hoạt động" : "Công ty khóa"}
                    </span>
                  </div>
                </div>

                <div className="system-job-card__bottom">
                  <button
                    type="button"
                    className="admin-secondary-btn"
                    onClick={() => handleToggleJobField(job, "is_active")}
                    disabled={updatingJobId === job.id}
                  >
                    {job.is_active ? <BsToggleOn /> : <BsToggleOff />}
                    <span>{job.is_active ? "Tắt hiển thị" : "Bật hiển thị"}</span>
                  </button>

                  <button
                    type="button"
                    className="admin-primary-btn"
                    onClick={() => handleToggleJobField(job, "is_hot")}
                    disabled={updatingJobId === job.id}
                  >
                    <BsStarFill />
                    <span>{job.is_hot ? "Tắt nổi bật" : "Bật nổi bật"}</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
