import { useContext, useEffect, useState } from "react";
import { BsSearch } from "react-icons/bs";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import jobApi from "../../api/job";
import industryApi from "../../api/industry";
import locationApi from "../../api/location";
import jtypeApi from "../../api/jtype";
import jlevelApi from "../../api/jlevel";
import { AppContext } from "../../App";
import { MdOutlineAttachMoney, MdLocationOn } from "react-icons/md";
import dayjs from "dayjs";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Spinner from "react-bootstrap/Spinner";
import CPagination from "../../components/CPagination";
import CMulSelect from "../../components/CMulSelect";
import Form from "react-bootstrap/Form";
import AppImage from "../../components/AppImage";
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

  return (
    <div className="page-section mb-4">
      <Form noValidate className="section-card" onSubmit={handleSubmit(handleFilter)}>
        <div className="section-card__head">
          <div>
            <h1 className="app-section-title mb-1">Tìm việc làm nhanh hơn</h1>
            <div className="app-section-subtitle">
              Lọc theo ngành nghề, khu vực, mức lương và thời gian đăng.
            </div>
          </div>
          <div className="app-soft-badge">{jobs.length} job / trang</div>
        </div>

        <div className="row g-3">
          <div className="col-lg-4">
            <Form.Group className="position-relative">
              <Form.Control
                type="text"
                aria-label="job_keyword"
                placeholder="Tìm việc làm"
                {...register("keyword", { minLength: 3 })}
                isInvalid={errors.keyword}
              />
              <Form.Control.Feedback type="invalid" tooltip>
                Vui lòng nhập tối thiểu 3 ký tự
              </Form.Control.Feedback>
            </Form.Group>
          </div>
          <div className="col-lg-4">
            {industries.length > 0 && (
              <CMulSelect
                defaultText="Tất cả ngành nghề"
                items={industries}
                textAtt="name"
                valueAtt="id"
                setOutput={setSelectedIndustries}
              />
            )}
          </div>
          <div className="col-lg-4">
            {locations.length > 0 && (
              <CMulSelect
                defaultText="Tất cả tỉnh thành"
                items={locations}
                textAtt="name"
                valueAtt="id"
                setOutput={setSelectedLocations}
              />
            )}
          </div>
          <div className="col-lg-3">
            <select className="form-select" {...register("salary")}>
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
          </div>
          <div className="col-lg-3">
            <select className="form-select" {...register("jtype_id")}>
              <option value="">Hình thức việc làm</option>
              {jtypes.map((item) => (
                <option value={item.id} key={"jtype" + item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-lg-3">
            <select className="form-select" {...register("jlevel_id")}>
              <option value="">Cấp bậc</option>
              {jlevels.map((item) => (
                <option value={item.id} key={"jlevel" + item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-lg-3">
            <select className="form-select" {...register("posting_period")}>
              <option value="">Đăng trong vòng</option>
              <option value="3">4 ngày trước</option>
              <option value="7">1 tuần trước</option>
              <option value="14">2 tuần trước</option>
              <option value="30">1 tháng trước</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn app-button-primary mt-4 px-4">
          {isSearchLoading ? <Spinner size="sm" /> : <BsSearch className="fs-5" />}
          <span> Tìm kiếm</span>
        </button>
      </Form>

      <div className="section-card mt-4">
        <div className="section-card__head">
          <div>
            <h2 className="app-section-title mb-1">Danh sách việc làm</h2>
            <div className="app-section-subtitle">
              Gợi ý vị trí phù hợp dựa trên bộ lọc hiện tại.
            </div>
          </div>
        </div>
        <div className="row g-4">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <div
                className="col-lg-6"
                key={`job_${job.id}`}
                onClick={() => nav(`/jobs/${job.id}`)}
              >
                <div className="job-feature-card pointer h-100">
                  <div className="d-flex gap-3">
                    <div className="logo-frame" style={{ width: "100px", height: "100px" }}>
                      <AppImage
                        src={job.employer.logo}
                        fallbackVariant="logo"
                        width="100%"
                        alt={job.jname}
                      />
                    </div>
                    <div className="flex-fill">
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip className="ts-xs">{job.jname}</Tooltip>}
                      >
                        <div className="fw-bold text-dark text-decoration-none hover-text-main">
                          {job.jname}
                        </div>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip className="ts-xs">{job.employer.name}</Tooltip>}
                      >
                        <div className="ts-smd text-secondary text-truncate">
                          {job.employer.name}
                        </div>
                      </OverlayTrigger>
                      <div className="ts-sm mt-2">
                        <div className="d-flex flex-wrap gap-3">
                          <div className="d-flex align-items-center">
                            <MdOutlineAttachMoney className="fs-5 text-main" />
                            {job.min_salary ? (
                              <span>
                                {job.min_salary} - {job.max_salary} triệu VND
                              </span>
                            ) : (
                              <span>Theo thỏa thuận</span>
                            )}
                          </div>
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip className="ts-xs">
                                {job.locations?.map((item, index) => (
                                  <div key={`location_${index}`}>
                                    {item.name}
                                    {index !== job.locations?.length - 1 && ", "}
                                  </div>
                                ))}
                              </Tooltip>
                            }
                          >
                            <div className="d-flex align-items-center">
                              <MdLocationOn className="fs-5 text-main" />
                              {job.locations && job.locations[0].name}
                              {job.locations?.length > 1 && "..."}
                            </div>
                          </OverlayTrigger>
                        </div>
                        <div className="mt-3">
                          <span className="app-soft-badge">
                            Còn{" "}
                            {dayjs().diff(job.expire_at, "day") <= 30
                              ? dayjs(job.expire_at).diff(new Date(), "day")
                              : "30+"}{" "}
                            ngày
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <h4 className="my-4" style={{ marginLeft: "12px" }}>
              Không có kết quả nào phù hợp!
            </h4>
          )}
        </div>
      </div>

      <CPagination
        className="justify-content-center mt-4"
        totalPage={totalPage}
        curPage={curPage}
        setCurPage={setCurPage}
        getList={getJobs}
      />
    </div>
  );
}

export default JobList;
