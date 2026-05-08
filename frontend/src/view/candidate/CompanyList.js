import "./custom.css";
import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import employerApi from "../../api/employer";
import { AppContext } from "../../App";
import {
  BsArrowRight,
  BsBriefcase,
  BsBuilding,
  BsFunnel,
  BsGeoAlt,
  BsGlobe2,
  BsGrid,
  BsPeople,
  BsSearch,
} from "react-icons/bs";
import CPagination from "../../components/CPagination";
import Spinner from "react-bootstrap/Spinner";
import AppImage from "../../components/AppImage";

function CompanyList() {
  const nav = useNavigate();
  const { setCurrentPage } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [comKey, setComKey] = useState("");
  const [totalPage, setTotalPage] = useState(1);
  const [curPage, setCurPage] = useState(1);
  const [totalCompanies, setTotalCompanies] = useState(0);

  const getCompanyJobCount = (company) =>
    company?.job_num ?? company?.jobs_count ?? company?.jobs?.length ?? 0;

  const totalVisibleJobs = useMemo(
    () =>
      companies.reduce(
        (total, company) => total + Number(getCompanyJobCount(company) || 0),
        0
      ),
    [companies]
  );

  const getCompanies = async (page = 1) => {
    const res = await employerApi.getList({ page, keyword: comKey });
    setCompanies(res.data);
    setTotalPage(res.last_page);
    setTotalCompanies(res.total || res.data.length);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await getCompanies();
      setIsLoading(false);
      setCurPage(1);
    } catch (e) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage("companies");
    getCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="company-directory-page">
      <section className="company-directory-hero">
        <div className="company-directory-hero__content">
          <div className="company-directory-eyebrow">
            <BsBuilding />
            Danh bạ doanh nghiệp
          </div>
          <h1>Khám phá doanh nghiệp phù hợp</h1>
          <p>
            Tìm hiểu công ty, quy mô, địa điểm và các cơ hội đang tuyển trong
            một giao diện rõ ràng, hiện đại và dễ quét thông tin.
          </p>
          <div className="company-directory-stats">
            <div>
              <strong>{totalCompanies}</strong>
              <span>Công ty</span>
            </div>
            <div>
              <strong>{totalVisibleJobs}+</strong>
              <span>Việc làm trang này</span>
            </div>
            <div>
              <strong>Đa ngành</strong>
              <span>Lĩnh vực</span>
            </div>
          </div>
        </div>

        <div className="company-directory-hero__visual" aria-hidden="true">
          <div className="company-visual-card company-visual-card--main">
            <span>
              <BsBriefcase />
            </span>
            <div>
              <strong>Cơ hội mới</strong>
              <small>Ưu tiên công ty đang tuyển</small>
            </div>
          </div>
          <div className="company-visual-card company-visual-card--float">
            <span>
              <BsGrid />
            </span>
            <div>
              <strong>Directory</strong>
              <small>So sánh nhanh</small>
            </div>
          </div>
        </div>
      </section>

      <section className="company-search-panel">
        <form className="company-search-form" onSubmit={handleSubmit}>
          <div className="company-search-input">
            <BsSearch />
            <input
              type="text"
              name="com_key"
              placeholder="Tìm theo tên công ty..."
              value={comKey}
              onChange={(e) => setComKey(e.target.value)}
            />
          </div>
          <button type="submit" className="company-search-button">
            {isLoading && <Spinner size="sm" />}
            Tìm kiếm
          </button>
        </form>

        <div className="company-filter-chips" aria-label="Bộ lọc gợi ý">
          {["Quy mô", "Thành phố", "Lĩnh vực", "Đang tuyển dụng"].map((label) => (
            <button type="button" key={label}>
              <BsFunnel />
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="company-results-shell">
        <div className="company-results-head">
          <div>
            <h2>Danh sách công ty</h2>
            <p>
              {companies.length} kết quả trong trang {curPage}
            </p>
          </div>
          <span className="company-results-badge">
            <BsBuilding />
            {totalCompanies} công ty
          </span>
        </div>

        {companies.length > 0 ? (
          <div className="company-directory-grid">
            {companies.map((company) => {
              const jobCount = getCompanyJobCount(company);

              return (
                <article
                  className="company-directory-card"
                  key={`company_${company.id}`}
                  onClick={() => nav(`/companies/${company.id}`)}
                >
                  <div className="company-directory-card__top">
                    <div className="company-directory-logo">
                      <AppImage
                        src={company.logo}
                        fallbackVariant="logo"
                        alt={company.name}
                      />
                    </div>
                    <span className="company-job-badge">
                      <BsBriefcase />
                      {jobCount} việc làm
                    </span>
                  </div>

                  <h3>{company.name}</h3>

                  <div className="company-tag-row">
                    <span>
                      <BsPeople />
                      {company.min_employees ? (
                        <>
                          {company.min_employees}
                          {company.max_employees !== 0
                            ? ` - ${company.max_employees}`
                            : "+ "}{" "}
                          nhân viên
                        </>
                      ) : (
                        "Chưa cập nhật"
                      )}
                    </span>
                    <span>
                      <BsGrid />
                      Đa lĩnh vực
                    </span>
                  </div>

                  <div className="company-directory-meta">
                    <div>
                      <BsGeoAlt />
                      <span>{company.address || "Chưa cập nhật địa chỉ"}</span>
                    </div>
                    {company.website && (
                      <div>
                        <BsGlobe2 />
                        <a
                          href={company.website}
                          onClick={(e) => e.stopPropagation()}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {company.website}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="company-directory-actions">
                    <Link
                      to={`/companies/${company.id}`}
                      className="company-card-button company-card-button--primary"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Xem công ty
                      <BsArrowRight />
                    </Link>
                    <Link
                      to={`/companies/${company.id}`}
                      className="company-card-button company-card-button--ghost"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Xem việc làm
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="company-empty-state">
            <BsSearch />
            <h3>Không có kết quả phù hợp</h3>
            <p>Thử tìm bằng tên công ty ngắn hơn hoặc bỏ bớt bộ lọc.</p>
          </div>
        )}
      </section>

      <CPagination
        className="company-directory-pagination justify-content-center mt-4"
        totalPage={totalPage}
        curPage={curPage}
        setCurPage={setCurPage}
        getList={getCompanies}
      />
    </div>
  );
}

export default CompanyList;
