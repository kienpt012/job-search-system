import "./custom.css";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import employerApi from "../../api/employer";
import { IoMdPeople } from "react-icons/io";
import { MdLocationOn, MdPhone } from "react-icons/md";
import { IoIosLink } from "react-icons/io";
import { BsPinMapFill, BsBoxArrowUpRight } from "react-icons/bs";
import AppImage from "../../components/AppImage";

const hasMapLocation = (company) =>
  Boolean(
    company?.map_lat !== null &&
      company?.map_lat !== undefined &&
      company?.map_lat !== "" &&
      company?.map_lng !== null &&
      company?.map_lng !== undefined &&
      company?.map_lng !== ""
  );

const buildMapEmbedUrl = (lat, lng) => {
  if (!hasMapLocation({ map_lat: lat, map_lng: lng })) {
    return "";
  }

  const safeLat = Number(lat);
  const safeLng = Number(lng);
  const delta = 0.015;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${safeLng - delta}%2C${safeLat - delta}%2C${
    safeLng + delta
  }%2C${safeLat + delta}&layer=mapnik&marker=${safeLat}%2C${safeLng}`;
};

const buildMapExternalUrl = (lat, lng) => {
  if (!hasMapLocation({ map_lat: lat, map_lng: lng })) {
    return "";
  }

  return `https://www.openstreetmap.org/?mlat=${Number(lat)}&mlon=${Number(lng)}#map=16/${Number(lat)}/${Number(
    lng
  )}`;
};

const buildGoogleMapsUrl = (lat, lng) => {
  if (!hasMapLocation({ map_lat: lat, map_lng: lng })) {
    return "";
  }

  return `https://www.google.com/maps/search/?api=1&query=${Number(lat)},${Number(lng)}`;
};

function Company() {
  const { id } = useParams();
  const [infor, setInfor] = useState({});
  const [jobs, setJobs] = useState([]);
  const [showMap, setShowMap] = useState(false);

  const getCompanyInfor = async () => {
    const res = await employerApi.getById(id);
    setInfor(res);
  };

  const getCompanyJobs = async () => {
    const res = await employerApi.getComJobs(id);
    setJobs(res);
  };

  useEffect(() => {
    getCompanyInfor();
    getCompanyJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const mapEmbedUrl = buildMapEmbedUrl(infor.map_lat, infor.map_lng);
  const mapExternalUrl = buildMapExternalUrl(infor.map_lat, infor.map_lng);
  const googleMapsUrl = buildGoogleMapsUrl(infor.map_lat, infor.map_lng);

  return (
    <div className="page-section mb-4">
      <section className="hero-panel">
        <div className="row align-items-center g-4">
          <div className="col-lg-7">
            <div className="app-pill mb-3 bg-white text-dark">Trang doanh nghiệp</div>
            <h1 className="display-6 fw-800 mb-3">{infor.name}</h1>
            <div className="d-flex flex-wrap gap-3">
              <div className="metric-card">
                <div className="metric-card__label">Quy mô</div>
                <div className="metric-card__value">
                  {infor.min_employees
                    ? `${infor.min_employees}${infor.max_employees !== 0 ? ` - ${infor.max_employees}` : "+"}`
                    : "N/A"}
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-card__label">Việc làm đang tuyển</div>
                <div className="metric-card__value">{jobs.length}</div>
              </div>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="hero-panel__media" style={{ minHeight: "280px" }}>
              <AppImage src={infor.image} fallbackVariant="cover" alt={infor.name} />
            </div>
          </div>
        </div>
      </section>

      <div className="section-card mt-4">
        <div className="d-flex flex-column flex-lg-row gap-4 align-items-start">
          <div className="logo-frame" style={{ width: "130px", height: "130px" }}>
            <AppImage
              src={infor.logo}
              fallbackVariant="logo"
              style={{ maxHeight: "110px", maxWidth: "110px" }}
              alt={infor.name}
            />
          </div>
          <div className="flex-fill">
            <div className="d-flex flex-wrap gap-2 mb-3">
              <div className="app-pill">
                <IoMdPeople className="fs-5" />
                {infor.min_employees ? (
                  <span>
                    {infor.min_employees}
                    {infor.max_employees !== 0 ? " - " + infor.max_employees : "+ "} nhân viên
                  </span>
                ) : (
                  "Chưa cập nhật"
                )}
              </div>
              <div className="app-pill">
                <MdPhone className="fs-5" />
                <span>{infor.phone || "Chưa cập nhật"}</span>
              </div>
              {infor.website && (
                <div className="app-pill">
                  <IoIosLink className="ts-lg" />
                  <a href={infor.website} className="text-main text-decoration-none" target="_blank" rel="noreferrer">
                    {infor.website}
                  </a>
                </div>
              )}
            </div>
            <div className="d-flex align-items-start gap-2 text-secondary">
              <MdLocationOn className="fs-5 text-main mt-1" />
              <span>{infor.address || "Chưa cập nhật vị trí công ty"}</span>
            </div>

            {hasMapLocation(infor) && (
              <div className="d-flex flex-wrap gap-2 mt-3">
                <button
                  type="button"
                  className="btn btn-info text-white rounded-pill px-4"
                  onClick={() => setShowMap(true)}
                >
                  <BsPinMapFill className="me-2" />
                  Xem vị trí công ty
                </button>
                <a
                  href={mapExternalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-light border rounded-pill px-4"
                >
                  <BsBoxArrowUpRight className="me-2" />
                  Mở bản đồ lớn
                </a>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-dark rounded-pill px-4"
                >
                  <BsBoxArrowUpRight className="me-2" />
                  Xem trên Google Maps
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="section-card mt-4">
        <h2 className="app-section-title mb-2">Giới thiệu công ty</h2>
        <div className="app-section-subtitle mb-3">
          Thông tin tổng quan để ứng viên hiểu rõ hơn về môi trường làm việc.
        </div>
        <div className="whitespace-preline">{infor.description ? infor.description : "Chưa cập nhật thông tin"}</div>
      </div>

      <div className="section-card mt-4">
        <div className="section-card__head">
          <div>
            <h2 className="app-section-title mb-1">Việc làm đang tuyển</h2>
            <div className="app-section-subtitle">Danh sách vị trí hiện có tại doanh nghiệp này.</div>
          </div>
          <div className="app-soft-badge">{jobs.length} tin</div>
        </div>
        <div className="row g-4">
          {jobs.map((job) => (
            <div className="col-12" key={"job" + job.id}>
              <div className="job-feature-card">
                <div className="d-flex gap-3">
                  <div className="logo-frame" style={{ width: "100px", height: "100px" }}>
                    <AppImage
                      src={infor.logo}
                      fallbackVariant="logo"
                      style={{ maxHeight: "86px", maxWidth: "86px" }}
                      alt={infor.name}
                    />
                  </div>
                  <div className="flex-fill">
                    <Link to={`/jobs/${job.id}`} className="nav-link">
                      <span className="h5 hover-text-main">{job.jname}</span>
                    </Link>
                    <span className="text-secondary">{infor.name}</span>
                    <div className="mt-2 ts-smd">
                      <div>
                        <span className="fw-500">Mức lương:</span>&nbsp;
                        {job.min_salary ? (
                          <span>
                            {job.min_salary} - {job.max_salary} triệu VND
                          </span>
                        ) : (
                          <span>Cạnh tranh</span>
                        )}
                      </div>
                      <div>
                        <span className="fw-500">Địa điểm:</span>&nbsp;{job.location}
                      </div>
                      <div className="mt-1">
                        <span className="fw-500">Ngày đăng:</span>&nbsp;
                        {job.postDate ? job.postDate : "06/04/2023"}
                        <span className="ms-4 fw-500">Hạn nộp:</span>&nbsp;
                        {job.deadline}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal show={showMap} onHide={() => setShowMap(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>Vị trí của {infor.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3 text-secondary">{infor.address}</div>
          {mapEmbedUrl ? (
            <iframe
              title={`map-${infor.id || "company"}`}
              src={mapEmbedUrl}
              width="100%"
              height="460"
              style={{ border: 0, borderRadius: "20px" }}
              loading="lazy"
            />
          ) : (
            <div className="alert alert-info mb-0">Công ty này chưa ghim vị trí trên bản đồ.</div>
          )}
        </Modal.Body>
        {googleMapsUrl && (
          <Modal.Footer>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline-dark"
            >
              Xem trên Google Maps
            </a>
          </Modal.Footer>
        )}
      </Modal>
    </div>
  );
}

export default Company;
