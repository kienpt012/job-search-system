import axios from "axios";
import { useEffect, useState } from "react";
import {
  BsCaretLeft,
  BsCaretRight,
  BsCurrencyDollar,
  BsGeoAlt,
  BsPlayCircleFill,
  BsPinMapFill,
} from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import candidateApi from "../../api/candidate";
import AppImage from "../../components/AppImage";
import "./custom.css";

const TEXT = {
  heroPill:
    "Tuy\u1ec3n d\u1ee5ng hi\u1ec7n \u0111\u1ea1i cho doanh nghi\u1ec7p v\u00e0 \u1ee9ng vi\u00ean",
  heroTitle1: "T\u00ecm vi\u1ec7c nhanh h\u01a1n.",
  heroTitle2: "Ch\u1ecdn doanh nghi\u1ec7p t\u1ed1t h\u01a1n.",
  heroDesc:
    "Giao di\u1ec7n m\u1edbi t\u1eadp trung v\u00e0o tr\u1ea3i nghi\u1ec7m duy\u1ec7t job, xem c\u00f4ng ty v\u00e0 qu\u1ea3n l\u00fd \u1ee9ng tuy\u1ec3n theo c\u00e1ch r\u00f5 r\u00e0ng h\u01a1n.",
  exploreJobs: "Kh\u00e1m ph\u00e1 vi\u1ec7c l\u00e0m",
  exploreCompanies: "Xem c\u00f4ng ty n\u1ed5i b\u1eadt",
  hotJobs: "Vi\u1ec7c l\u00e0m hot",
  hotCompanies: "C\u00f4ng ty hot",
  currentPage: "Trang hi\u1ec7n t\u1ea1i",
  featuredJobs: "Vi\u1ec7c l\u00e0m n\u1ed5i b\u1eadt",
  featuredJobsSub:
    "C\u00e1c c\u01a1 h\u1ed9i \u0111\u01b0\u1ee3c nh\u00e0 tuy\u1ec3n d\u1ee5ng \u01b0u ti\u00ean hi\u1ec3n th\u1ecb.",
  viewAll: "Xem t\u1ea5t c\u1ea3",
  salaryDeal: "Theo th\u1ecfa thu\u1eadn",
  salaryUnit: "tri\u1ec7u VND",
  nearbyTitlePrefix:
    "\u0110\u00e2y l\u00e0 nh\u1eefng c\u00f4ng ty g\u1ea7n n\u01a1i \u1edf c\u1ee7a b\u1ea1n (<",
  nearbyTitleSuffix: "km)",
  nearbySubPrefix: "G\u1ee3i \u00fd theo v\u1ecb tr\u00ed \u0111\u00e3 ghim: ",
  nearbySubFallback:
    "H\u1ec7 th\u1ed1ng \u0111ang \u01b0u ti\u00ean nh\u1eefng doanh nghi\u1ec7p \u0111ang tuy\u1ec3n g\u1ea7n b\u1ea1n.",
  nearbyBadge: "Theo kho\u1ea3ng c\u00e1ch th\u1ef1c t\u1ebf",
  nearbyLoading:
    "\u0110ang t\u00ecm c\u00e1c c\u00f4ng ty ph\u00f9 h\u1ee3p g\u1ea7n b\u1ea1n...",
  jobsCount: "vi\u1ec7c l\u00e0m",
  nearbyEmptyPrefix:
    "Hi\u1ec7n ch\u01b0a c\u00f3 c\u00f4ng ty \u0111ang tuy\u1ec3n trong b\u00e1n k\u00ednh ",
  nearbyEmptySuffix: "km quanh n\u01a1i \u1edf c\u1ee7a b\u1ea1n.",
  topCompanies: "Top c\u00f4ng ty n\u1ed5i b\u1eadt",
  topCompaniesSub:
    "Ch\u1ecdn m\u1ed9t doanh nghi\u1ec7p c\u00f3 v\u1ecb th\u1ebf v\u00e0 nhu c\u1ea7u tuy\u1ec3n d\u1ee5ng r\u1ea5t cao.",
  companyCatalog: "Xem danh m\u1ee5c",
  heroSlideOpen: "M\u1edf n\u1ed9i dung n\u00e0y",
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
        <div className="row align-items-center g-4">
          <div className="col-lg-6">
            <div className="app-pill mb-3 bg-white text-dark">{TEXT.heroPill}</div>
            <h1 className="display-5 fw-800 mb-3">
              {TEXT.heroTitle1}
              <br />
              {TEXT.heroTitle2}
            </h1>
            <p className="mb-4 text-white-50 ts-smd">{TEXT.heroDesc}</p>
            <div className="d-flex flex-wrap gap-3">
              <Link to="/jobs" className="btn app-button-primary px-4 py-3">
                {TEXT.exploreJobs}
              </Link>
              <Link to="/companies" className="btn btn-outline-light px-4 py-3">
                {TEXT.exploreCompanies}
              </Link>
            </div>
            <div className="row row-cols-2 row-cols-md-3 g-3 mt-4">
              <div className="col">
                <div className="metric-card">
                  <div className="metric-card__label">{TEXT.hotJobs}</div>
                  <div className="metric-card__value">{hotJobs.length}+</div>
                </div>
              </div>
              <div className="col">
                <div className="metric-card">
                  <div className="metric-card__label">{TEXT.hotCompanies}</div>
                  <div className="metric-card__value">{hotCompanies.length}+</div>
                </div>
              </div>
              <div className="col">
                <div className="metric-card">
                  <div className="metric-card__label">{TEXT.currentPage}</div>
                  <div className="metric-card__value">0{curPage}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="hero-panel__media" style={{ minHeight: "380px" }}>
              <button
                type="button"
                className="hero-slider"
                onClick={handleClickHeroSlide}
                disabled={!activeHeroSlide?.target_url}
              >
                <AppImage src={activeHeroSlide?.image} alt="hero_slide" />
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
            </div>
          </div>
        </div>
      </section>

      <section className="section-card mt-4">
        <div className="section-card__head">
          <div>
            <h2 className="app-section-title mb-1">{TEXT.featuredJobs}</h2>
            <div className="app-section-subtitle">{TEXT.featuredJobsSub}</div>
          </div>
          <Link to="/jobs" className="app-soft-badge text-decoration-none">
            {TEXT.viewAll}
          </Link>
        </div>
        <div className="row g-4">
          {hotJobs.map((job) => (
            <div key={"job" + job.id} className="col-xl-6">
              <div className="job-feature-card">
                <div className="d-flex gap-3">
                  <Link to={`/companies/${job.employer.id}`} className="text-decoration-none">
                    <div className="logo-frame">
                      <AppImage
                        className="align-self-center"
                        src={job.employer.logo}
                        fallbackVariant="logo"
                        alt={"hotjob" + job.id}
                      />
                    </div>
                  </Link>
                  <div className="flex-fill">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="nav-link fw-bold text-dark mb-2"
                      style={{ fontSize: "1.28rem" }}
                    >
                      {job.jname}
                    </Link>
                    <div className="text-secondary mb-2">{job.employer.name}</div>
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
                      <span>
                        {job.locations.map((item, index) => (
                          <span key={"job_location_" + job.id + "-" + item.id}>
                            {item.name}
                            {index !== job.locations.length - 1 && ", "}
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
              className="btn btn-sm border me-2 rounded-pill px-3 py-2"
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
        <section className="section-card mt-4">
          <div className="section-card__head">
            <div>
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
              {nearbyCompanies.data.map((company) => (
                <div className="col-md-6 col-xl-3" key={"nearby_company" + company.id}>
                  <div className="company-feature-card">
                    <Link
                      to={`/companies/${company.id}`}
                      className="text-decoration-none text-dark"
                    >
                      <div className="logo-frame mx-auto mb-3">
                        <AppImage
                          className="align-self-center"
                          src={company.logo}
                          fallbackVariant="logo"
                          alt={"nearby_company_" + company.id}
                        />
                      </div>
                      <div className="text-center fw-bold mb-2">{company.name}</div>
                      <div className="text-center text-secondary small mb-3">
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

      <section className="section-card mt-4 mb-4">
        <div className="section-card__head">
          <div>
            <h2 className="app-section-title mb-1">{TEXT.topCompanies}</h2>
            <div className="app-section-subtitle">{TEXT.topCompaniesSub}</div>
          </div>
          <Link to="/companies" className="app-soft-badge text-decoration-none">
            {TEXT.companyCatalog}
          </Link>
        </div>
        <div className="row g-4">
          {hotCompanies.map((company) => (
            <div className="col-md-6 col-xl-3" key={"company" + company.id}>
              <div className="company-feature-card">
                <Link
                  to={`/companies/${company.id}`}
                  className="text-decoration-none text-dark"
                >
                  <div className="logo-frame mx-auto mb-3">
                    <AppImage
                      className="align-self-center"
                      src={company.logo}
                      fallbackVariant="logo"
                      alt={"hot_company" + company.id}
                    />
                  </div>
                  <div className="text-center fw-bold mb-2">{company.name}</div>
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
