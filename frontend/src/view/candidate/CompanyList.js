import "./custom.css";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import employerApi from "../../api/employer";
import { AppContext } from "../../App";
import { IoMdPeople } from "react-icons/io";
import { MdLocationOn } from "react-icons/md";
import { IoIosLink } from "react-icons/io";
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

  const getCompanies = async (page = 1) => {
    const res = await employerApi.getList({ page, keyword: comKey });
    setCompanies(res.data);
    setTotalPage(res.last_page);
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
    <div className="page-section mb-4">
      <div className="section-card">
        <div className="section-card__head">
          <div>
            <h1 className="app-section-title mb-1">Danh sách công ty</h1>
            <div className="app-section-subtitle">
              Khám phá doanh nghiệp theo quy mô, địa điểm và nhu cầu
              tuyển dụng.
            </div>
          </div>
          <div className="app-soft-badge">{companies.length} kết quả trang này</div>
        </div>

        <form className="d-flex flex-column flex-md-row gap-3 mb-4" onSubmit={handleSubmit}>
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: "420px" }}
            name="com_key"
            placeholder="Tìm theo tên công ty..."
            onChange={(e) => setComKey(e.target.value)}
          />
          <button type="submit" className="btn app-button-primary px-4">
            {isLoading && <Spinner size="sm" className="me-1" />}
            Tìm kiếm
          </button>
        </form>

        <div className="row g-4">
          {companies.length > 0 ? (
            companies.map((company) => (
              <div className="col-sm-12 col-xl-6" key={`company_${company.id}`}>
                <div
                  className="company-grid-card pointer"
                  onClick={() => nav(`/companies/${company.id}`)}
                >
                  <div className="d-flex gap-3">
                    <div className="logo-frame flex-shrink-0">
                      <AppImage
                        src={company.logo}
                        fallbackVariant="logo"
                        style={{ maxWidth: "110px", maxHeight: "110px" }}
                        alt={company.name}
                      />
                    </div>
                    <div className="company-grid-card__info flex-fill">
                      <div className="fw-bold fs-5 mb-2">{company.name}</div>
                      <div className="card-text text-start ts-smd">
                        <div className="d-flex align-items-center gap-1 mb-2">
                          <IoMdPeople className="fs-5 text-main" />
                          {company.min_employees ? (
                            <span>
                              {company.min_employees}
                              {company.max_employees !== 0
                                ? " - " + company.max_employees
                                : "+ "}{" "}
                              nhân viên
                            </span>
                          ) : (
                            "Chưa cập nhật"
                          )}
                        </div>
                        <div className="text-multiline mb-2">
                          <MdLocationOn className="fs-5 text-main me-1" />
                          {company.address}
                        </div>
                        {company.website && (
                          <span className="text-ellipsis d-inline-flex align-items-center">
                            <IoIosLink className="ts-lg text-main me-1" />
                            <a
                              href={company.website}
                              className="hover-link text-secondary text-decoration-none"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {company.website}
                            </a>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <h4 className="ms-3 text-start">Không có kết quả nào phù hợp!</h4>
          )}
        </div>
      </div>
      <CPagination
        className="justify-content-center mt-4"
        totalPage={totalPage}
        curPage={curPage}
        setCurPage={setCurPage}
        getList={getCompanies}
      />
    </div>
  );
}

export default CompanyList;
