import { useEffect, useState } from "react";
import {
  BsAward,
  BsBriefcase,
  BsEnvelope,
  BsGeoAlt,
  BsInfoCircle,
  BsMortarboard,
  BsPersonBadge,
  BsSearch,
  BsStars,
} from "react-icons/bs";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import AppImage from "../../../components/AppImage";
import employerApi from "../../../api/employer";
import jskillApi from "../../../api/jskill";
import "./candidateSearch.css";

const initialFilters = {
  keyword: "",
  gender: "",
  address: "",
  school: "",
  major: "",
  experience: "",
  project: "",
  certificate: "",
  prize: "",
  job_id: "",
  skill_ids: [],
  has_location: false,
};

const getFullName = (candidate) =>
  [candidate.lastname, candidate.firstname].filter(Boolean).join(" ") || "Ứng viên";

const getGenderText = (gender) => {
  if (String(gender) === "1") return "Nam";
  if (String(gender) === "0") return "Nữ";
  return "Chưa cập nhật";
};

function CandidateSummary({ candidate }) {
  const topEducation = candidate.educations?.[0];
  const topExperience = candidate.experiences?.[0];
  const topSkills = candidate.skills?.slice(0, 5) || [];

  return (
    <>
      <div className="talent-card__avatar">
        <AppImage src={candidate.avatar} fallbackVariant="avatar" alt={getFullName(candidate)} />
      </div>
      <div className="talent-card__body">
        <div className="talent-card__name">{getFullName(candidate)}</div>
        <div className="talent-card__meta">
          <BsPersonBadge />
          <span>{getGenderText(candidate.gender)}</span>
        </div>
        {candidate.address && (
          <div className="talent-card__meta">
            <BsGeoAlt />
            <span>{candidate.address}</span>
          </div>
        )}
        {topEducation && (
          <div className="talent-card__meta">
            <BsMortarboard />
            <span>
              {topEducation.major || "Ngành học"} tại {topEducation.school || "trường học"}
            </span>
          </div>
        )}
        {topExperience && (
          <div className="talent-card__meta">
            <BsBriefcase />
            <span>
              {topExperience.name || "Kinh nghiệm"} tại {topExperience.company || "công ty"}
            </span>
          </div>
        )}
        {candidate.objective && <p className="talent-card__objective">{candidate.objective}</p>}
        <div className="talent-card__skills">
          {topSkills.length > 0 ? (
            topSkills.map((skill) => (
              <span key={`${candidate.id}_${skill}`} className="talent-skill">
                {skill}
              </span>
            ))
          ) : (
            <span className="talent-skill">Chưa cập nhật kỹ năng</span>
          )}
        </div>
      </div>
    </>
  );
}

function CandidateCard({ candidate, selectedJobId, onContact }) {
  return (
    <article className="talent-card">
      <CandidateSummary candidate={candidate} />
      <div className="talent-card__aside">
        <a href={`mailto:${candidate.email}`} className="talent-contact-link">
          <BsEnvelope />
          <span>{candidate.email}</span>
        </a>
        <button
          type="button"
          className="talent-contact-btn"
          onClick={() => onContact(candidate, selectedJobId)}
          disabled={!selectedJobId}
          title={!selectedJobId ? "Chọn một job liên hệ trong bộ lọc" : "Liên hệ ứng viên"}
        >
          Liên hệ
        </button>
      </div>
    </article>
  );
}

function RecommendationCard({ recommendation, onContact, onViewDetail }) {
  const { candidate, job } = recommendation;

  return (
    <article className="talent-card talent-card--recommendation">
      <CandidateSummary candidate={candidate} />
      <div className="talent-card__aside">
        <div className="talent-match">
          <strong>{recommendation.match_percent}%</strong>
          <span>phù hợp</span>
        </div>
        <div className="talent-job-pill">
          <BsBriefcase />
          <span>{job.jname}</span>
        </div>
        <button
          type="button"
          className="talent-secondary-btn"
          onClick={() => onViewDetail(recommendation)}
        >
          <BsInfoCircle />
          Vì sao phù hợp
        </button>
        <button
          type="button"
          className="talent-contact-btn"
          onClick={() => onContact(candidate, job.id)}
        >
          Liên hệ
        </button>
      </div>
    </article>
  );
}

function RecommendationDetailModal({ recommendation, onClose }) {
  if (!recommendation) return null;

  const { candidate, job, required_skills, matched_skills, missing_skills } = recommendation;

  return (
    <div className="talent-modal-backdrop" role="dialog" aria-modal="true">
      <div className="talent-modal">
        <div className="talent-modal__head">
          <div>
            <div className="talent-badge">Phân tích phù hợp</div>
            <h2>{getFullName(candidate)}</h2>
            <p>
              Phù hợp {recommendation.match_percent}% với vị trí {job.jname}
            </p>
          </div>
          <button type="button" className="talent-modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="talent-detail-grid">
          <div className="talent-detail-box">
            <h3>Kỹ năng job yêu cầu</h3>
            <div className="talent-card__skills">
              {required_skills.map((skill) => (
                <span key={`required_${skill}`} className="talent-skill">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className="talent-detail-box">
            <h3>Kỹ năng ứng viên trùng</h3>
            <div className="talent-card__skills">
              {matched_skills.map((skill) => (
                <span key={`matched_${skill}`} className="talent-skill is-match">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className="talent-detail-box">
            <h3>Kỹ năng còn thiếu</h3>
            <div className="talent-card__skills">
              {missing_skills.length > 0 ? (
                missing_skills.map((skill) => (
                  <span key={`missing_${skill}`} className="talent-skill is-missing">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="talent-skill is-match">Đã khớp toàn bộ kỹ năng yêu cầu</span>
              )}
            </div>
          </div>
          <div className="talent-detail-box">
            <h3>Thông tin liên hệ</h3>
            <p>{candidate.email}</p>
            <p>{candidate.phone || "Chưa cập nhật số điện thoại"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactCandidateModal({ contactTarget, jobs, onClose, onSubmit, isSending }) {
  const [form, setForm] = useState({
    title: "",
    content: "",
  });

  useEffect(() => {
    if (!contactTarget) return;

    setForm({
      title: `Mời ứng tuyển vị trí ${contactTarget.job?.jname || ""}`.trim(),
      content: [
        `Xin chào ${getFullName(contactTarget.candidate)},`,
        "",
        `Chúng tôi thấy hồ sơ của bạn phù hợp với vị trí ${contactTarget.job?.jname || "đang tuyển"} và muốn trao đổi thêm về cơ hội này.`,
        "",
        "Trân trọng,",
      ].join("\n"),
    });
  }, [contactTarget]);

  if (!contactTarget) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      title: form.title.trim(),
      content: form.content.trim(),
      job_id: contactTarget.job?.id,
      candidate_id: contactTarget.candidate.id,
    });
  };

  return (
    <div className="talent-modal-backdrop" role="dialog" aria-modal="true">
      <form className="talent-modal talent-contact-modal" onSubmit={handleSubmit}>
        <div className="talent-modal__head">
          <div>
            <div className="talent-badge">Liên hệ ứng viên</div>
            <h2>{getFullName(contactTarget.candidate)}</h2>
            <p>Email sẽ được gửi tới {contactTarget.candidate.email}</p>
          </div>
          <button type="button" className="talent-modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="talent-contact-form">
          <label>
            <span>Công việc</span>
            <select
              value={contactTarget.job?.id || ""}
              onChange={(event) => {
                const nextJob = jobs.find((job) => String(job.id) === event.target.value);
                if (nextJob) {
                  onClose({ keepOpen: true, nextJob });
                }
              }}
              disabled={isSending}
            >
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.jname}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Tiêu đề</span>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              maxLength="255"
              disabled={isSending}
            />
          </label>
          <label>
            <span>Nội dung email</span>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows="8"
              required
              disabled={isSending}
            />
          </label>
        </div>

        <div className="talent-modal__actions">
          <button type="button" className="talent-secondary-btn" onClick={onClose} disabled={isSending}>
            Hủy
          </button>
          <button type="submit" className="talent-contact-btn" disabled={isSending}>
            {isSending ? "Đang gửi..." : "Gửi email"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CandidateSearch() {
  const [filters, setFilters] = useState(initialFilters);
  const [skills, setSkills] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [contactTarget, setContactTarget] = useState(null);
  const [isSendingContact, setIsSendingContact] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const company = useSelector((state) => state.employerAuth.current.employer);
  const isAuth = useSelector((state) => state.employerAuth.isAuth);

  const loadBaseData = async () => {
    try {
      const [skillList, jobList, recommendationList] = await Promise.all([
        jskillApi.getAll(),
        company?.id ? employerApi.getJobList(company.id, "") : Promise.resolve([]),
        employerApi.getTalentRecommendations(),
      ]);
      setSkills(skillList || []);
      setJobs(jobList || []);
      setRecommendations(recommendationList || []);
    } catch (error) {
      toast.error("Không thể tải dữ liệu ứng viên.");
    }
  };

  const searchCandidates = async (nextFilters = filters) => {
    setIsLoading(true);
    try {
      const res = await employerApi.searchCandidates(nextFilters);
      setCandidates(res || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể tìm kiếm ứng viên.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuth && company?.id) {
      loadBaseData();
      searchCandidates(initialFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth, company?.id]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFilters((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSkillChange = (event) => {
    const values = Array.from(event.target.selectedOptions).map((option) => option.value);
    setFilters((current) => ({ ...current, skill_ids: values }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    searchCandidates(filters);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    searchCandidates(initialFilters);
  };

  const openContactModal = (candidate, jobId) => {
    const contactJobId = jobId || filters.job_id;
    const contactJob = jobs.find((job) => String(job.id) === String(contactJobId));

    if (!contactJobId) {
      toast.info("Hãy chọn một job liên hệ trong bộ lọc hoặc dùng nút liên hệ ở phần gợi ý.");
      return;
    }

    setContactTarget({
      candidate,
      job: contactJob || { id: contactJobId, jname: "" },
    });
  };

  const handleCloseContactModal = (options) => {
    if (options?.keepOpen && options.nextJob) {
      setContactTarget((current) => ({
        ...current,
        job: options.nextJob,
      }));
      return;
    }

    setContactTarget(null);
  };

  const handleSubmitContact = async ({ candidate_id, job_id, title, content }) => {
    if (!title || !content) {
      toast.error("Vui lòng nhập đầy đủ tiêu đề và nội dung.");
      return;
    }

    setIsSendingContact(true);
    try {
      await employerApi.contactCandidate({
        candidate_id,
        job_id,
        title,
        content,
        is_send_mail: true,
      });
      toast.success("Đã gửi liên hệ tới ứng viên.");
      setContactTarget(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể gửi liên hệ.");
    } finally {
      setIsSendingContact(false);
    }
  };

  return (
    <div className="talent-page">
      <section className="talent-hero">
        <div>
          <div className="talent-badge">Talent discovery</div>
          <h1>Tìm kiếm ứng viên</h1>
          <p>
            Duyệt toàn bộ hồ sơ ứng viên, lọc theo dữ liệu hồ sơ hiện có và xem
            các ứng viên phù hợp với những công việc doanh nghiệp đang tuyển.
          </p>
        </div>
        <div className="talent-hero__stats">
          <span>{candidates.length} ứng viên</span>
          <span>{recommendations.length} gợi ý phù hợp</span>
        </div>
      </section>

      <section className="talent-panel talent-panel--accent">
        <div className="talent-panel__head">
          <div>
            <div className="talent-badge">Ứng viên phù hợp</div>
            <h2>Đây là những ứng viên phù hợp với các công việc bạn đang tuyển</h2>
            <p>
              Hệ thống tự so khớp kỹ năng ứng viên với kỹ năng đã chọn trong từng job,
              không cần lọc thủ công.
            </p>
          </div>
          <span className="talent-soft-pill">
            <BsStars />
            {recommendations.length} gợi ý
          </span>
        </div>

        {recommendations.length > 0 ? (
          <div className="talent-recommend-grid">
            {recommendations.map((recommendation) => (
              <RecommendationCard
                key={`${recommendation.job.id}_${recommendation.candidate.id}`}
                recommendation={recommendation}
                onContact={openContactModal}
                onViewDetail={setSelectedRecommendation}
              />
            ))}
          </div>
        ) : (
          <div className="talent-empty">
            Chưa có gợi ý. Hãy thêm kỹ năng yêu cầu cho các job đang tuyển và cập nhật kỹ năng cho ứng viên.
          </div>
        )}
      </section>

      <section className="talent-panel">
        <div className="talent-panel__head">
          <div>
            <h2>Bộ lọc hồ sơ</h2>
            <p>Lọc theo thông tin cá nhân, kỹ năng, học vấn, kinh nghiệm và thành tích.</p>
          </div>
        </div>

        <form className="talent-filter-grid" onSubmit={handleSubmit}>
          <label>
            <span>Từ khóa</span>
            <input
              name="keyword"
              value={filters.keyword}
              onChange={handleChange}
              placeholder="Tên, email, kỹ năng, dự án..."
            />
          </label>
          <label>
            <span>Job liên hệ</span>
            <select name="job_id" value={filters.job_id} onChange={handleChange}>
              <option value="">Chọn khi muốn liên hệ từ danh sách lọc</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.jname}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Giới tính</span>
            <select name="gender" value={filters.gender} onChange={handleChange}>
              <option value="">Tất cả</option>
              <option value="1">Nam</option>
              <option value="0">Nữ</option>
            </select>
          </label>
          <label>
            <span>Khu vực</span>
            <input name="address" value={filters.address} onChange={handleChange} />
          </label>
          <label>
            <span>Trường học</span>
            <input name="school" value={filters.school} onChange={handleChange} />
          </label>
          <label>
            <span>Chuyên ngành</span>
            <input name="major" value={filters.major} onChange={handleChange} />
          </label>
          <label>
            <span>Kinh nghiệm</span>
            <input name="experience" value={filters.experience} onChange={handleChange} />
          </label>
          <label>
            <span>Dự án / công nghệ</span>
            <input name="project" value={filters.project} onChange={handleChange} />
          </label>
          <label>
            <span>Chứng chỉ</span>
            <input name="certificate" value={filters.certificate} onChange={handleChange} />
          </label>
          <label>
            <span>Giải thưởng</span>
            <input name="prize" value={filters.prize} onChange={handleChange} />
          </label>
          <label>
            <span>Kỹ năng</span>
            <select multiple size="5" value={filters.skill_ids} onChange={handleSkillChange}>
              {skills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name}
                </option>
              ))}
            </select>
          </label>
          <div className="talent-filter-options">
            <label className="talent-checkbox">
              <input
                type="checkbox"
                name="has_location"
                checked={filters.has_location}
                onChange={handleChange}
              />
              <span>Đã ghim vị trí bản đồ</span>
            </label>
            <div className="talent-filter-actions">
              <button type="submit" className="talent-primary-btn">
                <BsSearch />
                Tìm kiếm
              </button>
              <button type="button" className="talent-secondary-btn" onClick={handleReset}>
                Đặt lại
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="talent-panel">
        <div className="talent-panel__head">
          <div>
            <h2>Danh sách ứng viên</h2>
            <p>Hiển thị dạng hồ sơ để nhà tuyển dụng quét nhanh năng lực chính.</p>
          </div>
          <span className="talent-soft-pill">
            <BsAward />
            {isLoading ? "Đang tải..." : `${candidates.length} hồ sơ`}
          </span>
        </div>

        {isLoading ? (
          <div className="talent-empty">Đang tải danh sách ứng viên...</div>
        ) : candidates.length > 0 ? (
          <div className="talent-list">
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                selectedJobId={filters.job_id}
                onContact={openContactModal}
              />
            ))}
          </div>
        ) : (
          <div className="talent-empty">Không có ứng viên nào phù hợp bộ lọc.</div>
        )}
      </section>

      <RecommendationDetailModal
        recommendation={selectedRecommendation}
        onClose={() => setSelectedRecommendation(null)}
      />
      <ContactCandidateModal
        contactTarget={contactTarget}
        jobs={jobs}
        onClose={handleCloseContactModal}
        onSubmit={handleSubmitContact}
        isSending={isSendingContact}
      />
    </div>
  );
}
