import axios from "axios";
import { useEffect, useState } from "react";
import {
  BsCaretLeft,
  BsCaretRight,
  BsCurrencyDollar,
  BsGeoAlt,
} from "react-icons/bs";
import { Link } from "react-router-dom";
import AppImage from "../../components/AppImage";
import "./custom.css";

function Home() {
  const poster = process.env.PUBLIC_URL + "/image/poster5.png";
  const apiUrl = process.env.REACT_APP_API_URL;
  const [hotJobs, setHotJobs] = useState([]);
  const [hotCompanies, setHotCompanies] = useState([]);
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

  const getHotCompanies = async () => {
    await axios
      .get(`${apiUrl}/api/companies/getHotList`)
      .then((res) => {
        setHotCompanies(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getHotJobs(`${apiUrl}/api/jobs/getHotList`);
    getHotCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  return (
    <div className="page-section">
      <section className="hero-panel">
        <div className="row align-items-center g-4">
          <div className="col-lg-6">
            <div className="app-pill mb-3 bg-white text-dark">
              Tuyển dụng hiện đại cho doanh nghiệp và ứng viên
            </div>
            <h1 className="display-5 fw-800 mb-3">
              Tìm việc nhanh hơn.
              <br />
              Chọn doanh nghiệp tốt hơn.
            </h1>
            <p className="mb-4 text-white-50 ts-smd">
              Giao diện mới tập trung vào trải nghiệm duyệt job, xem công ty
              và quản lý ứng tuyển theo cách rõ ràng hơn.
            </p>
            <div className="d-flex flex-wrap gap-3">
              <Link to="/jobs" className="btn app-button-primary px-4 py-3">
                Khám phá việc làm
              </Link>
              <Link to="/companies" className="btn btn-outline-light px-4 py-3">
                Xem công ty nổi bật
              </Link>
            </div>
            <div className="row row-cols-2 row-cols-md-3 g-3 mt-4">
              <div className="col">
                <div className="metric-card">
                  <div className="metric-card__label">Việc làm hot</div>
                  <div className="metric-card__value">{hotJobs.length}+</div>
                </div>
              </div>
              <div className="col">
                <div className="metric-card">
                  <div className="metric-card__label">Công ty hot</div>
                  <div className="metric-card__value">{hotCompanies.length}+</div>
                </div>
              </div>
              <div className="col">
                <div className="metric-card">
                  <div className="metric-card__label">Trang hiện tại</div>
                  <div className="metric-card__value">0{curPage}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="hero-panel__media" style={{ minHeight: "380px" }}>
              <AppImage src={poster} alt="poster" />
            </div>
          </div>
        </div>
      </section>

      <section className="section-card mt-4">
        <div className="section-card__head">
          <div>
            <h2 className="app-section-title mb-1">Việc làm nổi bật</h2>
            <div className="app-section-subtitle">
              Các cơ hội được nhà tuyển dụng ưu tiên hiển thị.
            </div>
          </div>
          <Link to="/jobs" className="app-soft-badge text-decoration-none">
            Xem tất cả
          </Link>
        </div>
        <div className="row g-4">
          {hotJobs.map((job) => (
            <div key={"job" + job.id} className="col-xl-6">
              <div className="job-feature-card">
                <div className="d-flex gap-3">
                  <Link
                    to={`/companies/${job.employer.id}`}
                    className="text-decoration-none"
                  >
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
                          {job.min_salary} - {job.max_salary} triệu VND
                        </span>
                      ) : (
                        "Theo thỏa thuận"
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
                color: curPage.toString() === item.label ? "white" : "var(--app-primary)",
              }}
              onClick={() => getHotJobs(item.url)}
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

      <section className="section-card mt-4 mb-4">
        <div className="section-card__head">
          <div>
            <h2 className="app-section-title mb-1">Top công ty nổi bật</h2>
            <div className="app-section-subtitle">
              Chọn một doanh nghiệp có vị thế và nhu cầu tuyển dụng rất cao.
            </div>
          </div>
          <Link to="/companies" className="app-soft-badge text-decoration-none">
            Xem danh mục
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
                    <span className="app-soft-badge">{company.job_num} việc làm</span>
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

export default Home;
