import { useContext, useEffect, useMemo, useState } from "react";
import {
  BsArrowRight,
  BsBookmark,
  BsBriefcase,
  BsBuilding,
  BsCalendar3,
  BsCashCoin,
  BsClock,
  BsGeoAlt,
  BsSearch,
  BsSliders,
  BsStars,
} from "react-icons/bs";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import jobApi from "../../api/job";
import industryApi from "../../api/industry";
import locationApi from "../../api/location";
import jtypeApi from "../../api/jtype";
import jlevelApi from "../../api/jlevel";
import { AppContext } from "../../App";
import dayjs from "dayjs";
import Spinner from "react-bootstrap/Spinner";
import CPagination from "../../components/CPagination";
import CMulSelect from "../../components/CMulSelect";
import Form from "react-bootstrap/Form";
import AppImage from "../../components/AppImage";
import useRevealOnScroll from "../../hooks/useRevealOnScroll";
import "./custom.css";

function JobList() {
  const nav = useNavigate();
  const { setCurrentPage } = useContext(AppContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [jobs, setJobs] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [locations, setLocations] = useState([]);
  const [jtypes, setJtypes] = useState([]);
  const [jlevels, setJlevels] = useState([]);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [totalPage, setTotalPage] = useState(1);
  const [curPage, setCurPage] = useState(1);
  const [filterConditions, setFilterConditions] = useState({});
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  const getJobs = async (page = 1, conditions) => {
    const res = await jobApi.getList({
      page,
      ...(conditions || filterConditions),
    });
    setJobs(res.data);
    setTotalPage(res.last_page);
  };
  const getAllIndustries = async () => setIndustries((await industryApi.getAll()).inf);
  const getAllLocations = async () => setLocations(await locationApi.getAll());
  const getAllJtypes = async () => setJtypes((await jtypeApi.getAll()).inf);
  const getAllJlevels = async () => setJlevels((await jlevelApi.getAll()).inf);

  const handleFilter = async (data) => {
    try {
      const conditions = {
        ...data,
        industry_id: selectedIndustries,
        location_id: selectedLocations,
      };
      setIsSearchLoading(true);
      setFilterConditions(conditions);
      await getJobs(1, conditions);
      setCurPage(1);
      setIsSearchLoading(false);
    } catch (e) {
      setIsSearchLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage("jobs");
    getJobs();
    getAllIndustries();
    getAllLocations();
    getAllJtypes();
    getAllJlevels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useRevealOnScroll([jobs.length, curPage]);

  const visibleCompanyCount = useMemo(
    () => new Set(jobs.map((job) => job.employer?.id).filter(Boolean)).size,
    [jobs]
  );

  const averageSalary = useMemo(() => {
    const salaries = jobs
      .map((job) => Number(job.min_salary || job.max_salary || 0))
      .filter((salary) => salary > 0);

    if (!salaries.length) return "Thỏa thuận";

    return `${Math.round(
      salaries.reduce((total, salary) => total + salary, 0) / salaries.length
    )} triệu`;
  }, [jobs]);

  const getTypeName = (id) => jtypes.find((item) => Number(item.id) === Number(id))?.name;
  const getLevelName = (id) =>
    jlevels.find((item) => Number(item.id) === Number(id))?.name;

  const getDeadlineText = (expireAt) => {
    const daysLeft = dayjs(expireAt).diff(new Date(), "day");
    if (Number.isNaN(daysLeft)) return "Đang tuyển";
    if (daysLeft <= 0) return "Sắp hết hạn";
    return `Còn ${Math.min(daysLeft, 30)}${daysLeft > 30 ? "+" : ""} ngày`;
  };

  return (
    <div className="jobs-page">
      <section className="jobs-hero">
        <div className="jobs-hero__copy">
          <div className="jobs-eyebrow">
            <BsStars />
            Cơ hội tuyển dụng chất lượng
          </div>
          <h1>Tìm công việc phù hợp với bạn</h1>
          <p>Khám phá hàng trăm cơ hội tuyển dụng chất lượng từ các công ty uy tín.</p>
          <div className="jobs-hero__stats">
            <div>
              <strong>{jobs.length}</strong>
              <span>Việc làm trang này</span>
            </div>
            <div>
              <strong>{visibleCompanyCount}</strong>
              <span>Công ty</span>
            </div>
            <div>
              <strong>{averageSalary}</strong>
              <span>Lương trung bình</span>
            </div>
          </div>
        </div>
        <div className="jobs-hero__visual" aria-hidden="true">
          <div className="jobs-visual-card">
            <span>
              <BsBriefcase />
            </span>
            <div>
              <strong>Việc làm mới</strong>
              <small>Lọc nhanh theo nhu cầu</small>
            </div>
          </div>
          <div className="jobs-visual-card jobs-visual-card--secondary">
            <span>
              <BsCashCoin />
            </span>
            <div>
              <strong>Minh bạch lương</strong>
              <small>So sánh cơ hội dễ hơn</small>
            </div>
          </div>
        </div>
      </section>

      <Form
        noValidate
        className="jobs-search-panel"
        onSubmit={handleSubmit(handleFilter)}
      >
        <div className="jobs-search-main">
          <Form.Group className="jobs-search-field jobs-search-field--keyword">
            <BsSearch />
            <Form.Control
              type="text"
              aria-label="job_keyword"
              placeholder="Tên vị trí, kỹ năng, công ty..."
              {...register("keyword", { minLength: 3 })}
              isInvalid={errors.keyword}
            />
            <Form.Control.Feedback type="invalid" tooltip>
              Vui lòng nhập tối thiểu 3 ký tự
            </Form.Control.Feedback>
          </Form.Group>

          <div className="jobs-search-field jobs-search-field--select">
            {industries.length > 0 && (
              <CMulSelect
                defaultText="Ngành nghề"
                items={industries}
                textAtt="name"
                valueAtt="id"
                setOutput={setSelectedIndustries}
              />
            )}
          </div>

          <div className="jobs-search-field jobs-search-field--select">
            {locations.length > 0 && (
              <CMulSelect
                defaultText="Địa điểm"
                items={locations}
                textAtt="name"
                valueAtt="id"
                setOutput={setSelectedLocations}
              />
            )}
          </div>

          <button type="submit" className="jobs-search-button">
            {isSearchLoading ? <Spinner size="sm" /> : <BsSearch />}
            Tìm kiếm
          </button>
        </div>

        <div className="jobs-filter-row">
          <label>
            <BsCashCoin />
            <select {...register("salary")}>
              <option value="">Mức lương</option>
              <option value="5">Trên 5 triệu</option>
              <option value="10">Trên 10 triệu</option>
              <option value="15">Trên 15 triệu</option>
              <option value="20">Trên 20 triệu</option>
              <option value="25">Trên 25 triệu</option>
              <option value="30">Trên 30 triệu</option>
              <option value="40">Trên 40 triệu</option>
              <option value="50">Trên 50 triệu</option>
            </select>
          </label>
          <label>
            <BsBriefcase />
            <select {...register("jtype_id")}>
              <option value="">Hình thức</option>
              {jtypes.map((item) => (
                <option value={item.id} key={"jtype" + item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <BsSliders />
            <select {...register("jlevel_id")}>
              <option value="">Kinh nghiệm / cấp bậc</option>
              {jlevels.map((item) => (
                <option value={item.id} key={"jlevel" + item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <BsCalendar3 />
            <select {...register("posting_period")}>
              <option value="">Thời gian đăng</option>
              <option value="3">4 ngày trước</option>
              <option value="7">1 tuần trước</option>
              <option value="14">2 tuần trước</option>
              <option value="30">1 tháng trước</option>
            </select>
          </label>
          {["Remote", "Hybrid", "On-site"].map((label) => (
            <button type="button" className="jobs-filter-chip" key={label}>
              {label}
            </button>
          ))}
        </div>
      </Form>

      <section className="jobs-results-shell">
        <div className="jobs-results-head">
          <div>
            <h2>Danh sách việc làm</h2>
            <p>Gợi ý vị trí phù hợp dựa trên bộ lọc hiện tại.</p>
          </div>
          <span>
            <BsBriefcase />
            {jobs.length} job / trang
          </span>
        </div>

        {jobs.length > 0 ? (
          <div className="jobs-grid">
            {jobs.map((job, index) => (
              <article
                className="job-premium-card reveal"
                style={{ "--reveal-delay": `${index * 70}ms` }}
                key={`job_${job.id}`}
                onClick={() => nav(`/jobs/${job.id}`)}
              >
                <div className="job-premium-card__top">
                  <Link
                    to={`/companies/${job.employer?.id}`}
                    className="job-premium-logo"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <AppImage
                      src={job.employer?.logo}
                      fallbackVariant="logo"
                      alt={job.jname}
                    />
                  </Link>
                  <div className="job-premium-badges">
                    {job.is_hot === 1 && <span>HOT</span>}
                    <span>NEW</span>
                  </div>
                </div>

                <h3>{job.jname}</h3>
                <Link
                  to={`/companies/${job.employer?.id}`}
                  className="job-premium-company"
                  onClick={(event) => event.stopPropagation()}
                >
                  <BsBuilding />
                  {job.employer?.name}
                </Link>

                <div className="job-premium-meta">
                  <span>
                    <BsCashCoin />
                    {job.min_salary ? (
                      <>
                        {job.min_salary} - {job.max_salary} triệu VND
                      </>
                    ) : (
                      "Theo thỏa thuận"
                    )}
                  </span>
                  <span>
                    <BsGeoAlt />
                    {job.locations?.[0]?.name || "Linh hoạt"}
                    {job.locations?.length > 1 && " +"}
                  </span>
                  <span>
                    <BsSliders />
                    {getLevelName(job.jlevel_id) || `${job.yoe || 0}+ năm`}
                  </span>
                  <span>
                    <BsBriefcase />
                    {getTypeName(job.jtype_id) || "Toàn thời gian"}
                  </span>
                </div>

                <div className="job-premium-bottom">
                  <span className="job-deadline-pill">
                    <BsClock />
                    {getDeadlineText(job.expire_at)}
                  </span>
                  <div className="job-premium-actions">
                    <button
                      type="button"
                      className="job-save-button"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <BsBookmark />
                    </button>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="job-apply-button"
                      onClick={(event) => event.stopPropagation()}
                    >
                      Ứng tuyển
                      <BsArrowRight />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="jobs-empty-state">
            <BsSearch />
            <h3>Không có kết quả phù hợp</h3>
            <p>Thử thay đổi từ khóa, ngành nghề hoặc địa điểm để mở rộng tìm kiếm.</p>
          </div>
        )}
      </section>

      <CPagination
        className="jobs-pagination justify-content-center mt-4"
        totalPage={totalPage}
        curPage={curPage}
        setCurPage={setCurPage}
        getList={getJobs}
      />
    </div>
  );
}

export default JobList;
