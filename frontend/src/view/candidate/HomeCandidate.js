import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import {
  BsArrowRight,
  BsBriefcase,
  BsBuilding,
  BsCaretLeft,
  BsCaretRight,
  BsCurrencyDollar,
  BsFileEarmarkText,
  BsGeoAlt,
  BsGraphUp,
  BsPatchCheck,
  BsPinMapFill,
  BsSearch,
  BsShieldCheck,
} from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import candidateApi from "../../api/candidate";
import locationApi from "../../api/location";
import AppImage from "../../components/AppImage";
import useRevealOnScroll from "../../hooks/useRevealOnScroll";
import "./custom.css";

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
  const [locations, setLocations] = useState([]);
  const [heroSearch, setHeroSearch] = useState({
    keyword: "",
    location_id: "",
  });
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
    locationApi
      .getAll()
      .then((res) => {
        setLocations(Array.isArray(res) ? res.slice(0, 8) : []);
      })
      .catch((error) => {
        console.log(error);
        setLocations([]);
      });
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

  useRevealOnScroll([
    hotJobs.length,
    hotCompanies.length,
    nearbyCompanies.data.length,
    curPage,
    isCandidateAuth,
  ]);

  const resolvedHeroSlides =
    heroSlides.length > 0
      ? heroSlides
      : [
          {
            id: "default_slide",
            image: poster,
            target_url: "/jobs",
            is_external: false,
            target_label: "Khám phá việc làm",
          },
        ];

  const activeHeroSlide =
    resolvedHeroSlides[currentHeroSlide % resolvedHeroSlides.length];

  const handleClickHeroSlide = () => {
    if (!activeHeroSlide?.target_url) return;

    if (activeHeroSlide.is_external) {
      window.open(activeHeroSlide.target_url, "_blank", "noopener,noreferrer");
      return;
    }

    nav(activeHeroSlide.target_url);
  };

  const getCompanyJobCount = (company) =>
    company?.job_num ?? company?.jobs_count ?? company?.jobs?.length ?? 0;

  const marketStats = useMemo(
    () => [
      {
        icon: <BsBriefcase />,
        label: "Viec lam noi bat",
        value: `${hotJobs.length}+`,
        note: "Dang duoc uu tien hien thi",
      },
      {
        icon: <BsBuilding />,
        label: "Cong ty dang tuyen",
        value: `${hotCompanies.length}+`,
        note: "Co ho so cong ty ro rang",
      },
      {
        icon: <BsGraphUp />,
        label: "Cap nhat hom nay",
        value: "24h",
        note: "Theo doi co hoi moi lien tuc",
      },
    ],
    [hotCompanies.length, hotJobs.length]
  );

  const popularCategories = [
    "Kinh doanh",
    "Marketing",
    "Cong nghe thong tin",
    "Cham soc khach hang",
    "Nhan su",
    "Ke toan",
  ];

  const careerTools = [
    {
      icon: <BsFileEarmarkText />,
      title: "Ho so va CV",
      desc: "Hoan thien thong tin ca nhan, kinh nghiem va ky nang truoc khi ung tuyen.",
      to: isCandidateAuth ? "/candidate/profile" : "/sign-up",
    },
    {
      icon: <BsBriefcase />,
      title: "Viec lam da luu",
      desc: "Gom cac co hoi can theo doi de so sanh luong, dia diem va cong ty.",
      to: isCandidateAuth ? "/candidate/saved-jobs" : "/jobs",
    },
    {
      icon: <BsPatchCheck />,
      title: "Ung tuyen da gui",
      desc: "Theo doi nhung cong viec da nop ho so trong khong gian ung vien.",
      to: isCandidateAuth ? "/candidate/applied-jobs" : "/sign-up",
    },
  ];

  const safetyTips = [
    "Kiem tra ten cong ty, dia chi va thong tin lien he truoc khi nop ho so.",
    "Khong chuyen phi phong van, phi giu cho hoac phi dao tao bat thuong.",
    "Uu tien tin tuyen dung co mo ta cong viec, luong va yeu cau minh bach.",
  ];

  const handleHeroSearchChange = (event) => {
    const { name, value } = event.target;
    setHeroSearch((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleHeroSearchSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (heroSearch.keyword.trim()) {
      params.set("keyword", heroSearch.keyword.trim());
    }
    if (heroSearch.location_id) {
      params.set("location_id", heroSearch.location_id);
    }
    nav(params.toString() ? `/jobs?${params.toString()}` : "/jobs");
  };

  return (
    <div className="home-page">
      <section className="hero-panel">
        <div className="row align-items-center g-4 g-xl-5">
          <div className="col-lg-6">
            <div className="hero-copy reveal" style={{ "--reveal-delay": "0ms" }}>
              <div className="app-pill hero-pill">
                <BsPatchCheck />
                Nền tảng tuyển dụng chuyên nghiệp
              </div>
              <h1 className="hero-title">
                Tìm việc phù hợp, kết nối đúng công ty.
              </h1>
              <p className="hero-copy__desc">
                Khám phá cơ hội nổi bật, so sánh doanh nghiệp và ứng tuyển nhanh
                trong một trải nghiệm rõ ràng, sạch và dễ đọc.
              </p>
            </div>

            <div
              className="hero-actions reveal"
              style={{ "--reveal-delay": "130ms" }}
            >
              <Link to="/jobs" className="btn app-button-primary hero-main-cta">
                <BsSearch />
                Khám phá việc làm
              </Link>
              <Link to="/companies" className="btn hero-secondary-button">
                Xem công ty nổi bật
                <BsArrowRight />
              </Link>
            </div>

            <form
              className="home-hero-search reveal"
              style={{ "--reveal-delay": "180ms" }}
              onSubmit={handleHeroSearchSubmit}
            >
              <label className="home-hero-search__field">
                <BsSearch />
                <input
                  type="text"
                  name="keyword"
                  value={heroSearch.keyword}
                  onChange={handleHeroSearchChange}
                  placeholder="Vi tri, ky nang, ten cong ty..."
                />
              </label>
              <label className="home-hero-search__field home-hero-search__field--select">
                <BsGeoAlt />
                <select
                  name="location_id"
                  value={heroSearch.location_id}
                  onChange={handleHeroSearchChange}
                >
                  <option value="">Tat ca dia diem</option>
                  {locations.map((location) => (
                    <option value={location.id} key={`home_location_${location.id}`}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="home-hero-search__button">
                Tim viec
                <BsArrowRight />
              </button>
            </form>

            <div className="hero-stats">
              <div className="metric-card reveal" style={{ "--reveal-delay": "220ms" }}>
                <span className="metric-card__icon">
                  <BsBriefcase />
                </span>
                <div>
                  <div className="metric-card__label">Việc làm nổi bật</div>
                  <div className="metric-card__value">{hotJobs.length}+</div>
                </div>
              </div>
              <div className="metric-card reveal" style={{ "--reveal-delay": "300ms" }}>
                <span className="metric-card__icon">
                  <BsBuilding />
                </span>
                <div>
                  <div className="metric-card__label">Công ty đang tuyển</div>
                  <div className="metric-card__value">{hotCompanies.length}+</div>
                </div>
              </div>
              <div className="metric-card reveal" style={{ "--reveal-delay": "380ms" }}>
                <span className="metric-card__icon">
                  <BsPatchCheck />
                </span>
                <div>
                  <div className="metric-card__label">Danh sách trang</div>
                  <div className="metric-card__value">0{curPage}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <button
              type="button"
              className="hero-panel__media reveal reveal-scale"
              style={{ "--reveal-delay": "420ms" }}
              onClick={handleClickHeroSlide}
              disabled={!activeHeroSlide?.target_url}
            >
              <AppImage src={activeHeroSlide?.image} alt="hero_slide" priority />
              <div className="hero-floating-card">
                <span className="hero-floating-card__icon">
                  <BsBriefcase />
                </span>
                <div>
                  <strong>
                    {activeHeroSlide?.target_label || "Việc làm mới mỗi ngày"}
                  </strong>
                  <span>Lọc nhanh theo lương, địa điểm và công ty.</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>

      <section className="market-snapshot reveal">
        <div className="market-snapshot__head">
          <div>
            <span className="app-soft-badge">Thi truong viec lam hom nay</span>
            <h2>Thong tin nhanh de ung vien ra quyet dinh tot hon</h2>
          </div>
          <Link to="/jobs" className="market-snapshot__link">
            Xem tat ca viec lam
            <BsArrowRight />
          </Link>
        </div>
        <div className="market-snapshot__grid">
          {marketStats.map((item) => (
            <div className="market-stat-card" key={item.label}>
              <span>{item.icon}</span>
              <strong>{item.value}</strong>
              <label>{item.label}</label>
              <p>{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="feature-strip">
        {[
          ["Tìm kiếm nhanh", "Duyệt job nổi bật với thông tin cần thiết ngay trên card."],
          ["Công ty rõ ràng", "Logo, tên công ty và số lượng việc làm được trình bày gọn."],
          ["Ứng tuyển dễ hơn", "CTA nhất quán giúp người dùng đi tới trang chi tiết nhanh."],
        ].map(([title, desc], index) => (
          <div
            className="feature-card reveal"
            key={title}
            style={{ "--reveal-delay": `${index * 100}ms` }}
          >
            <span className="feature-card__icon">
              {index === 0 ? <BsSearch /> : index === 1 ? <BsBuilding /> : <BsPatchCheck />}
            </span>
            <div>
              <strong>{title}</strong>
              <p>{desc}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="section-card section-card--categories reveal">
        <div className="section-card__head">
          <div>
            <h2 className="app-section-title mb-1">Nhom nganh duoc quan tam</h2>
            <div className="app-section-subtitle">
              Goi y loi vao nhanh theo cach nguoi tim viec thuong bat dau hanh trinh.
            </div>
          </div>
          <Link to="/jobs" className="app-soft-badge text-decoration-none">
            Loc chi tiet
            <BsArrowRight />
          </Link>
        </div>
        <div className="category-pill-grid">
          {popularCategories.map((category) => (
            <Link
              to={`/jobs?keyword=${encodeURIComponent(category)}`}
              className="category-pill-card"
              key={category}
            >
              <BsSearch />
              <span>{category}</span>
              <BsArrowRight />
            </Link>
          ))}
        </div>
      </section>

      <section className="section-card section-card--jobs reveal">
        <div className="section-card__head">
          <div>
            <h2 className="app-section-title mb-1">Việc làm nổi bật</h2>
            <div className="app-section-subtitle">
              Các cơ hội đang được nhà tuyển dụng ưu tiên hiển thị.
            </div>
          </div>
          <Link to="/jobs" className="app-soft-badge text-decoration-none">
            Xem tất cả
            <BsArrowRight />
          </Link>
        </div>

        <div className="row g-3">
          {hotJobs.map((job, index) => (
            <div key={"job" + job.id} className="col-xl-6">
              <div
                className="job-feature-card reveal"
                style={{ "--reveal-delay": `${index * 90}ms` }}
              >
                <Link
                  to={`/companies/${job.employer.id}`}
                  className="logo-frame job-logo text-decoration-none"
                  aria-label={job.employer.name}
                >
                  <AppImage
                    src={job.employer.logo}
                    fallbackVariant="logo"
                    alt={"hotjob" + job.id}
                  />
                </Link>
                <div className="job-card__content">
                  <div className="job-card__topline">
                    <Link to={`/jobs/${job.id}`} className="job-feature-card__title">
                      {job.jname}
                    </Link>
                    <span className="job-priority">Hot</span>
                  </div>
                  <Link
                    to={`/companies/${job.employer.id}`}
                    className="job-feature-card__company"
                  >
                    {job.employer.name}
                  </Link>
                  <div className="job-card__meta">
                    <span>
                      <BsCurrencyDollar />
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
                      {job.locations.map((item, locationIndex) => (
                        <span key={"job_location_" + job.id + "-" + item.id}>
                          {item.name}
                          {locationIndex !== job.locations.length - 1 && ", "}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
                <Link to={`/jobs/${job.id}`} className="job-card__action">
                  Chi tiết
                  <BsArrowRight />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="home-pagination">
          {page.links.map((item) => (
            <button
              key={"page" + item.label}
              type="button"
              className={
                curPage.toString() === item.label
                  ? "home-page-nav is-active"
                  : "home-page-nav"
              }
              onClick={() => item.url && getHotJobs(item.url)}
              disabled={!item.url}
            >
              {item.label === "&laquo; Previous" && <BsCaretLeft />}
              {item.label === "Next &raquo;" && <BsCaretRight />}
              {item.label !== "&laquo; Previous" &&
              item.label !== "Next &raquo;"
                ? item.label
                : null}
            </button>
          ))}
        </div>
      </section>

      <section className="candidate-growth-grid reveal">
        <div className="candidate-tools-panel">
          <div className="section-card__head">
            <div>
              <h2 className="app-section-title mb-1">Cong cu cho ung vien</h2>
              <div className="app-section-subtitle">
                Khong chi tim job, ung vien can ho so tot va luong theo doi ro rang.
              </div>
            </div>
          </div>
          <div className="candidate-tool-list">
            {careerTools.map((tool) => (
              <Link to={tool.to} className="candidate-tool-card" key={tool.title}>
                <span>{tool.icon}</span>
                <div>
                  <strong>{tool.title}</strong>
                  <p>{tool.desc}</p>
                </div>
                <BsArrowRight />
              </Link>
            ))}
          </div>
        </div>

        <div className="safety-panel">
          <span className="safety-panel__icon">
            <BsShieldCheck />
          </span>
          <h2>Ung tuyen an toan</h2>
          <p>
            Mot website tuyen dung chuyen nghiep nen chu dong nhac ung vien kiem tra
            rui ro truoc khi nop ho so.
          </p>
          <div className="safety-tip-list">
            {safetyTips.map((tip) => (
              <div key={tip}>
                <BsPatchCheck />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isCandidateAuth && nearbyCompanies.has_location && (
        <section className="section-card section-card--nearby reveal">
          <div className="section-card__head">
            <div>
              <h2 className="app-section-title mb-1">
                Công ty gần bạn ({nearbyCompanies.distance_limit_km} km)
              </h2>
              <div className="app-section-subtitle">
                {nearbyCompanies.candidate_address
                  ? `Gợi ý theo vị trí đã ghim: ${nearbyCompanies.candidate_address}`
                  : "Hệ thống đang ưu tiên các công ty đang tuyển gần khu vực của bạn."}
              </div>
            </div>
            <span className="app-soft-badge">
              <BsPinMapFill />
              Theo khoảng cách thực tế
            </span>
          </div>

          {isLoadingNearbyCompanies ? (
            <div className="text-secondary">
              Đang tìm các công ty phù hợp gần bạn...
            </div>
          ) : nearbyCompanies.data.length > 0 ? (
            <div className="row g-3">
              {nearbyCompanies.data.map((company, index) => (
                <div className="col-sm-6 col-xl-3" key={"nearby_company" + company.id}>
                  <Link
                    to={`/companies/${company.id}`}
                    className="company-feature-card reveal text-decoration-none"
                    style={{ "--reveal-delay": `${index * 90}ms` }}
                  >
                    <div className="logo-frame company-logo">
                      <AppImage
                        src={company.logo}
                        fallbackVariant="logo"
                        alt={"nearby_company_" + company.id}
                      />
                    </div>
                    <div className="company-card__name">{company.name}</div>
                    <div className="company-card__meta">
                      <BsPinMapFill />
                      <span>{company.distance_km} km</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-secondary">
              Hiện chưa có công ty đang tuyển trong bán kính{" "}
              {nearbyCompanies.distance_limit_km} km quanh nơi ở của bạn.
            </div>
          )}
        </section>
      )}

      <section className="section-card section-card--companies mb-4 reveal">
        <div className="section-card__head">
          <div>
            <h2 className="app-section-title mb-1">Top công ty nổi bật</h2>
            <div className="app-section-subtitle">
              Chọn doanh nghiệp phù hợp và xem nhanh các vị trí đang tuyển.
            </div>
          </div>
          <Link to="/companies" className="app-soft-badge text-decoration-none">
            Xem danh mục
            <BsArrowRight />
          </Link>
        </div>

        <div className="row g-3">
          {hotCompanies.map((company, index) => (
            <div className="col-sm-6 col-xl-3" key={"company" + company.id}>
              <Link
                to={`/companies/${company.id}`}
                className="company-feature-card reveal text-decoration-none"
                style={{ "--reveal-delay": `${index * 90}ms` }}
              >
                <div className="logo-frame company-logo">
                  <AppImage
                    src={company.logo}
                    fallbackVariant="logo"
                    alt={"hot_company" + company.id}
                  />
                </div>
                <div className="company-card__name">{company.name}</div>
                <div className="company-card__meta">
                  <BsBriefcase />
                  <span>{getCompanyJobCount(company)} việc làm</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomeCandidate;
