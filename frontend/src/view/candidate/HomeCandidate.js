import axios from "axios";
import { useEffect, useState } from "react";
import {
  BsArrowUpRight,
  BsBriefcase,
  BsBuildings,
  BsCaretLeft,
  BsCaretRight,
  BsCheck2Circle,
  BsCurrencyDollar,
  BsGeoAlt,
  BsPinMapFill,
  BsPlayCircleFill,
  BsStars,
} from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import candidateApi from "../../api/candidate";
import AppImage from "../../components/AppImage";
import "./custom.css";

const TEXT = {
  heroEyebrow: "Nền tảng việc làm rõ ràng hơn",
  heroTitleLine1: "Tìm việc phù hợp hơn.",
  heroTitleLine2: "Xem doanh nghiệp rõ ràng hơn.",
  heroDesc:
    "Bố cục mới ưu tiên thông tin thật sự quan trọng như vị trí, doanh nghiệp, mức lương và địa điểm để bạn quét nhanh, đọc dễ và ra quyết định gọn hơn.",
  exploreJobs: "Khám phá việc làm",
  exploreCompanies: "Xem công ty nổi bật",
  heroTag1: "Việc làm mới mỗi ngày",
  heroTag2: "Doanh nghiệp uy tín",
  heroTag3: "Theo dõi cơ hội rõ ràng",
  heroFeature1Title: "Tìm việc gọn hơn",
  heroFeature1Desc: "Danh sách job ưu tiên thông tin quan trọng, không còn rối mắt.",
  heroFeature2Title: "Lọc nhanh hơn",
  heroFeature2Desc: "Duyệt theo công ty, khu vực và mức lương trong bố cục dễ quét.",
  heroFeature3Title: "Tin tuyển dụng sáng hơn",
  heroFeature3Desc: "Màu sắc, typography và card được đồng bộ để đọc thoải mái hơn.",
  hotJobs: "Việc làm hot",
  hotCompanies: "Công ty hot",
  currentPage: "Trang hiện tại",
  heroSlideOpen: "Mở nội dung này",
  heroPanelTitle: "Doanh nghiệp được quan tâm hôm nay",
  heroPanelDesc:
    "Slide nổi bật giúp bạn xem nhanh nhà tuyển dụng và vị trí đang có sức hút cao.",
  featuredJobs: "Việc làm nổi bật",
  featuredJobsSub:
    "Các cơ hội được nhà tuyển dụng ưu tiên hiển thị và cập nhật liên tục.",
  viewAll: "Xem tất cả",
  salaryDeal: "Theo thỏa thuận",
  salaryUnit: "triệu VND",
  nearbyTitlePrefix: "Doanh nghiệp gần nơi ở của bạn (",
  nearbyTitleSuffix: "km)",
  nearbySubPrefix: "Gợi ý theo vị trí đã ghim: ",
  nearbySubFallback:
    "Hệ thống đang ưu tiên những doanh nghiệp đang tuyển gần khu vực của bạn.",
  nearbyBadge: "Theo khoảng cách thực tế",
  nearbyLoading: "Đang tìm các công ty phù hợp gần bạn...",
  jobsCount: "việc làm",
  nearbyEmptyPrefix: "Hiện chưa có công ty đang tuyển trong bán kính ",
  nearbyEmptySuffix: "km quanh nơi ở của bạn.",
  topCompanies: "Doanh nghiệp nổi bật",
  topCompaniesSub:
    "Tập trung vào những công ty đang có nhu cầu tuyển dụng rõ ràng và profile tốt.",
  companyCatalog: "Xem danh mục",
  featuredBadge: "Ưu tiên hiển thị",
  topCompanyBadge: "Doanh nghiệp nổi bật",
  nearbyBadgeAlt: "Gần khu vực của bạn",
};

const initialNearbyCompanies = {
  has_location: false,
  distance_limit_km: 10,
  candidate_address: "",
  data: [],
};

function HomeCandidate() {
  const poster = process.env.PUBLIC_URL + "/image/poster5.png";
  const apiUrl = process.env.REACT_APP_API_URL;
  const nav = useNavigate();
  const isCandidateAuth = useSelector((state) => state.candAuth.isAuth);
  const [hotJobs, setHotJobs] = useState([]);
  const [hotCompanies, setHotCompanies] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [nearbyCompanies, setNearbyCompanies] = useState(initialNearbyCompanies);
  const [isLoadingNearbyCompanies, setIsLoadingNearbyCompanies] = useState(false);
  const [page, setPage] = useState({ links: [] });
  const [curPage, setCurPage] = useState(1);

  const getHotJobs = async (apiURL) => {
    await axios
      .get(apiURL)
      .then((res) => {
        setHotJobs(res.data.data);
        delete res.data.data;
        setPage(res.data);
        setCurPage(res.data.current_page);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getNearbyCompanies = async () => {
    try {
      setIsLoadingNearbyCompanies(true);
      const res = await candidateApi.getNearbyCompanies();
      setNearbyCompanies({
        has_location: Boolean(res?.has_location),
        distance_limit_km: res?.distance_limit_km || 10,
        candidate_address: res?.candidate_address || "",
        data: Array.isArray(res?.data) ? res.data : [],
      });
    } catch (error) {
      console.log(error);
      setNearbyCompanies(initialNearbyCompanies);
    } finally {
      setIsLoadingNearbyCompanies(false);
    }
  };

  useEffect(() => {
    getHotJobs(`${apiUrl}/api/jobs/getHotList`);
    axios
      .get(`${apiUrl}/api/hero-slides`)
      .then((res) => {
        setHeroSlides(Array.isArray(res.data) ? res.data : []);
        setCurrentHeroSlide(0);
      })
      .catch((error) => {
        console.log(error);
        setHeroSlides([]);
      });
    axios
      .get(`${apiUrl}/api/companies/getHotList`)
      .then((res) => {
        setHotCompanies(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [apiUrl]);

  useEffect(() => {
    if (isCandidateAuth) {
      getNearbyCompanies();
      return;
    }

    setNearbyCompanies(initialNearbyCompanies);
  }, [isCandidateAuth]);

  useEffect(() => {
    if (heroSlides.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setCurrentHeroSlide((current) => (current + 1) % heroSlides.length);
    }, 5500);

    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  const resolvedHeroSlides =
    heroSlides.length > 0
      ? heroSlides
      : [
          {
            id: "default_slide",
            image: poster,
            target_url: "/jobs",
            is_external: false,
            target_label: TEXT.exploreJobs,
          },
        ];

  const activeHeroSlide =
    resolvedHeroSlides[currentHeroSlide % resolvedHeroSlides.length];

  const handleClickHeroSlide = () => {
    if (!activeHeroSlide?.target_url) {
      return;
    }

    if (activeHeroSlide.is_external) {
      window.open(activeHeroSlide.target_url, "_blank", "noopener,noreferrer");
      return;
    }

    nav(activeHeroSlide.target_url);
  };

  return (
    <div className="page-section">
      <section className="hero-panel">
        <div className="row align-items-stretch g-4">
          <div className="col-lg-6">
            <div className="hero-copy">
              <div className="app-pill hero-pill">
                <BsStars />
                <span>{TEXT.heroEyebrow}</span>
              </div>
              <h1 className="hero-title">
                {TEXT.heroTitleLine1}
                <br />
                {TEXT.heroTitleLine2}
              </h1>
              <p className="hero-copy__desc">{TEXT.heroDesc}</p>

              <div className="hero-actions">
                <Link to="/jobs" className="btn app-button-primary px-4 py-3">
                  {TEXT.exploreJobs}
                </Link>
                <Link to="/companies" className="btn hero-secondary-button px-4 py-3">
                  {TEXT.exploreCompanies}
                </Link>
              </div>

              <div className="hero-tags">
                <span className="app-soft-badge">{TEXT.heroTag1}</span>
                <span className="app-soft-badge">{TEXT.heroTag2}</span>
                <span className="app-soft-badge">{TEXT.heroTag3}</span>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="hero-preview">
              <div className="hero-preview__head">
                <div>
                  <div className="hero-preview__title">{TEXT.heroPanelTitle}</div>
                  <div className="hero-preview__desc">{TEXT.heroPanelDesc}</div>
                </div>
                <button
                  type="button"
                  className="hero-preview__action"
                  onClick={handleClickHeroSlide}
                  disabled={!activeHeroSlide?.target_url}
                >
                  <BsArrowUpRight />
                </button>
              </div>

              <button
                type="button"
                className="hero-slider"
                onClick={handleClickHeroSlide}
                disabled={!activeHeroSlide?.target_url}
              >
                <AppImage src={activeHeroSlide?.image} alt="hero_slide" priority />
                <div className="hero-slider__overlay" />
                <div className="hero-slider__badge">
                  <BsPlayCircleFill />
                  <span>{activeHeroSlide?.target_label || TEXT.heroSlideOpen}</span>
                </div>
                <div className="hero-slider__dots">
                  {resolvedHeroSlides.map((slide, index) => (
                    <span
                      key={`hero_slide_dot_${slide.id}_${index}`}
                      className={`hero-slider__dot ${
                        index === currentHeroSlide % resolvedHeroSlides.length
                          ? "is-active"
                          : ""
                      }`}
                    />
                  ))}
                </div>
              </button>

              <div className="hero-stats">
                <div className="metric-card">
                  <div className="metric-card__icon">
                    <BsBriefcase />
                  </div>
                  <div>
                    <div className="metric-card__label">{TEXT.hotJobs}</div>
                    <div className="metric-card__value">{hotJobs.length}+</div>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-card__icon">
                    <BsBuildings />
                  </div>
                  <div>
                    <div className="metric-card__label">{TEXT.hotCompanies}</div>
                    <div className="metric-card__value">{hotCompanies.length}+</div>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-card__icon">
                    <BsStars />
                  </div>
                  <div>
                    <div className="metric-card__label">{TEXT.currentPage}</div>
                    <div className="metric-card__value">0{curPage}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="hero-feature-grid">
        <div className="hero-feature-card">
          <div className="hero-feature-card__icon">
            <BsBriefcase />
          </div>
          <div>
            <strong>{TEXT.heroFeature1Title}</strong>
            <p>{TEXT.heroFeature1Desc}</p>
          </div>
        </div>
        <div className="hero-feature-card">
          <div className="hero-feature-card__icon">
            <BsCheck2Circle />
          </div>
          <div>
            <strong>{TEXT.heroFeature2Title}</strong>
            <p>{TEXT.heroFeature2Desc}</p>
          </div>
        </div>
        <div className="hero-feature-card">
          <div className="hero-feature-card__icon">
            <BsBuildings />
          </div>
          <div>
            <strong>{TEXT.heroFeature3Title}</strong>
            <p>{TEXT.heroFeature3Desc}</p>
          </div>
        </div>
      </section>

      <section className="section-card section-card--soft mt-4">
        <div className="section-card__head">
          <div>
            <div className="app-soft-badge mb-2">{TEXT.featuredBadge}</div>
            <h2 className="app-section-title mb-1">{TEXT.featuredJobs}</h2>
            <div className="app-section-subtitle">{TEXT.featuredJobsSub}</div>
          </div>
          <Link to="/jobs" className="app-soft-badge text-decoration-none section-head-link">
            {TEXT.viewAll}
          </Link>
        </div>
        <div className="row g-4">
          {hotJobs.map((job, index) => (
            <div key={"job" + job.id} className="col-xl-6">
              <div className="job-feature-card" style={{ animationDelay: `${index * 90}ms` }}>
                <div className="job-feature-card__glow" />
                <div className="d-flex gap-3 align-items-start">
                  <Link to={`/companies/${job.employer.id}`} className="text-decoration-none">
                    <div className="logo-frame logo-frame--elevated">
                      <AppImage
                        className="align-self-center"
                        src={job.employer.logo}
                        fallbackVariant="logo"
                        alt={"hotjob" + job.id}
                      />
                    </div>
                  </Link>
                  <div className="flex-fill min-w-0">
                    <div className="job-feature-card__topline">
                      <span className="app-soft-badge">{TEXT.featuredBadge}</span>
                    </div>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="nav-link fw-bold text-dark mb-2 job-feature-card__title text-multiline-2"
                    >
                      {job.jname}
                    </Link>
                    <div className="text-secondary mb-2 job-feature-card__company text-multiline-1">
                      {job.employer.name}
                    </div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <BsCurrencyDollar className="text-main" />
                      {job.min_salary ? (
                        <span>
                          {job.min_salary} - {job.max_salary} {TEXT.salaryUnit}
                        </span>
                      ) : (
                        TEXT.salaryDeal
                      )}
                    </div>
                    <div className="d-flex align-items-center gap-2 text-secondary">
                      <BsGeoAlt className="text-main" />
                      <span className="text-multiline-1">
                        {job.locations.map((item, locationIndex) => (
                          <span key={"job_location_" + job.id + "-" + item.id}>
                            {item.name}
                            {locationIndex !== job.locations.length - 1 && ", "}
                          </span>
                        ))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="d-flex justify-content-center mt-4">
          {page.links.map((item) => (
            <button
              key={"page" + item.label}
              type="button"
              className="btn btn-sm border me-2 rounded-pill px-3 py-2 home-page-nav"
              style={{
                backgroundColor:
                  curPage.toString() === item.label ? "var(--app-primary)" : "#fff",
                color:
                  curPage.toString() === item.label ? "white" : "var(--app-primary)",
              }}
              onClick={() => item.url && getHotJobs(item.url)}
              disabled={!item.url}
            >
              {item.label === "&laquo; Previous" && <BsCaretLeft />}
              {item.label === "Next &raquo;" && <BsCaretRight />}
              {item.label !== "&laquo; Previous" && item.label !== "Next &raquo;"
                ? item.label
                : null}
            </button>
          ))}
        </div>
      </section>

      {isCandidateAuth && nearbyCompanies.has_location && (
        <section className="section-card section-card--accent mt-4">
          <div className="section-card__head">
            <div>
              <div className="app-soft-badge mb-2">{TEXT.nearbyBadgeAlt}</div>
              <h2 className="app-section-title mb-1">
                {TEXT.nearbyTitlePrefix}
                {nearbyCompanies.distance_limit_km}
                {TEXT.nearbyTitleSuffix}
              </h2>
              <div className="app-section-subtitle">
                {nearbyCompanies.candidate_address
                  ? `${TEXT.nearbySubPrefix}${nearbyCompanies.candidate_address}`
                  : TEXT.nearbySubFallback}
              </div>
            </div>
            <span className="app-soft-badge">{TEXT.nearbyBadge}</span>
          </div>
          {isLoadingNearbyCompanies ? (
            <div className="text-secondary">{TEXT.nearbyLoading}</div>
          ) : nearbyCompanies.data.length > 0 ? (
            <div className="row g-4">
              {nearbyCompanies.data.map((company, index) => (
                <div className="col-md-6 col-xl-3" key={"nearby_company" + company.id}>
                  <div
                    className="company-feature-card company-feature-card--highlight"
                    style={{ animationDelay: `${index * 90}ms` }}
                  >
                    <Link
                      to={`/companies/${company.id}`}
                      className="text-decoration-none text-dark"
                    >
                      <div className="logo-frame mx-auto mb-3 logo-frame--elevated">
                        <AppImage
                          className="align-self-center"
                          src={company.logo}
                          fallbackVariant="logo"
                          alt={"nearby_company_" + company.id}
                        />
                      </div>
                      <div className="text-center fw-bold mb-2 text-multiline-2">
                        {company.name}
                      </div>
                      <div className="text-center text-secondary small mb-3 text-multiline">
                        {company.address}
                      </div>
                      <div className="d-flex justify-content-center flex-wrap gap-2">
                        <span className="app-soft-badge">{company.distance_km} km</span>
                        <span className="app-soft-badge">
                          <BsPinMapFill className="me-1" />
                          {company.job_num} {TEXT.jobsCount}
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-secondary">
              {TEXT.nearbyEmptyPrefix}
              {nearbyCompanies.distance_limit_km}
              {TEXT.nearbyEmptySuffix}
            </div>
          )}
        </section>
      )}

      <section className="section-card section-card--soft mt-4 mb-4">
        <div className="section-card__head">
          <div>
            <div className="app-soft-badge mb-2">{TEXT.topCompanyBadge}</div>
            <h2 className="app-section-title mb-1">{TEXT.topCompanies}</h2>
            <div className="app-section-subtitle">{TEXT.topCompaniesSub}</div>
          </div>
          <Link
            to="/companies"
            className="app-soft-badge text-decoration-none section-head-link"
          >
            {TEXT.companyCatalog}
          </Link>
        </div>
        <div className="row g-4">
          {hotCompanies.map((company, index) => (
            <div className="col-md-6 col-xl-3" key={"company" + company.id}>
              <div
                className="company-feature-card company-feature-card--grid"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Link
                  to={`/companies/${company.id}`}
                  className="text-decoration-none text-dark"
                >
                  <div className="company-feature-card__ring" />
                  <div className="logo-frame mx-auto mb-3 logo-frame--elevated">
                    <AppImage
                      className="align-self-center"
                      src={company.logo}
                      fallbackVariant="logo"
                      alt={"hot_company" + company.id}
                    />
                  </div>
                  <div className="text-center fw-bold mb-2 text-multiline-2">
                    {company.name}
                  </div>
                  <div className="text-center">
                    <span className="app-soft-badge">
                      {company.job_num} {TEXT.jobsCount}
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomeCandidate;
