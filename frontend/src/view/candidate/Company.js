import "./custom.css";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import employerApi from "../../api/employer";
import { IoMdPeople } from "react-icons/io";
import { MdLocationOn, MdPhone, MdOutlineAttachMoney } from "react-icons/md";
import { IoIosLink } from "react-icons/io";
import {
  BsBriefcase,
  BsBoxArrowUpRight,
  BsBuilding,
  BsCalendar2Check,
  BsCalendarEvent,
  BsPinMapFill,
} from "react-icons/bs";
import dayjs from "dayjs";
import AppImage from "../../components/AppImage";
import useRevealOnScroll from "../../hooks/useRevealOnScroll";

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

  useRevealOnScroll([id, jobs.length]);

  const mapEmbedUrl = buildMapEmbedUrl(infor.map_lat, infor.map_lng);
  const mapExternalUrl = buildMapExternalUrl(infor.map_lat, infor.map_lng);
  const googleMapsUrl = buildGoogleMapsUrl(infor.map_lat, infor.map_lng);
  const companySizeText = infor.min_employees
    ? `${infor.min_employees}${infor.max_employees !== 0 ? ` - ${infor.max_employees}` : "+"} nhân viên`
    : "Chưa cập nhật";
  const companyLocation = infor.address || "Chưa cập nhật vị trí công ty";
  const companyIndustry = infor.industry?.name || infor.field || "Đa lĩnh vực";

  const formatSalary = (job) =>
    job.min_salary ? `${job.min_salary} - ${job.max_salary} triệu VND` : "Cạnh tranh";

  const formatDate = (value, fallback = "Đang cập nhật") =>
    value ? dayjs(value).format("DD/MM/YYYY") : fallback;

  return (
    <div className="company-profile-page">
      <section className="company-profile-hero reveal reveal-visible">
        <div className="company-profile-hero__content">
          <div className="company-profile-logo">
            <AppImage src={infor.logo} fallbackVariant="logo" alt={infor.name} />
          </div>

          <div>
            <div className="company-profile-eyebrow">
              <BsBuilding />
              Trang doanh nghiệp
            </div>
            <h1>{infor.name}</h1>
            <p>
              Khám phá môi trường làm việc, thông tin doanh nghiệp và các vị trí đang tuyển tại{" "}
              {infor.name || "công ty này"}.
            </p>

            <div className="company-profile-meta">
              <span>
                <BsBriefcase />
                {companyIndustry}
              </span>
              <span>
                <IoMdPeople />
                {companySizeText}
              </span>
              <span>
                <MdLocationOn />
                {companyLocation}
              </span>
            </div>

            <div className="company-profile-actions">
              <a href="#company-jobs" className="company-profile-btn company-profile-btn--primary">
                Xem {jobs.length} việc đang tuyển
              </a>
              {hasMapLocation(infor) && (
                <>
                  <button
                    type="button"
                    className="company-profile-btn company-profile-btn--ghost"
                    onClick={() => setShowMap(true)}
                  >
                    <BsPinMapFill />
                    Xem vị trí công ty
                  </button>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="company-profile-btn company-profile-btn--ghost"
                  >
                    <BsBoxArrowUpRight />
                    Xem qua Google Maps
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="company-profile-hero__visual">
          {infor.image ? (
            <AppImage src={infor.image} fallbackVariant="cover" alt={infor.name} />
          ) : (
            <div className="company-profile-cover-placeholder">
              <BsBuilding />
              <strong>{infor.name || "Company"}</strong>
              <span>Premium employer profile</span>
            </div>
          )}
          <div className="company-profile-floating-card">
            <strong>{jobs.length}</strong>
            <span>việc làm đang tuyển</span>
          </div>
        </div>
      </section>

      <section className="company-profile-quick reveal">
        <div className="company-profile-fact">
          <IoMdPeople />
          <div>
            <span>Quy mô</span>
            <strong>{companySizeText}</strong>
          </div>
        </div>
        <div className="company-profile-fact">
          <BsBriefcase />
          <div>
            <span>Đang tuyển</span>
            <strong>{jobs.length} vị trí</strong>
          </div>
        </div>
        <div className="company-profile-fact">
          <MdPhone />
          <div>
            <span>Điện thoại</span>
            <strong>{infor.phone || "Chưa cập nhật"}</strong>
          </div>
        </div>
        <div className="company-profile-fact">
          <IoIosLink />
          <div>
            <span>Website</span>
            {infor.website ? (
              <a href={infor.website} target="_blank" rel="noreferrer">
                {infor.website}
              </a>
            ) : (
              <strong>Chưa cập nhật</strong>
            )}
          </div>
        </div>
      </section>

      <section className="company-profile-card reveal">
        <div className="company-profile-section-head">
          <h2>Giới thiệu công ty</h2>
          <p>Thông tin tổng quan giúp ứng viên hiểu rõ hơn về môi trường và định hướng của doanh nghiệp.</p>
        </div>
        <div className="company-profile-description">
          {infor.description ? infor.description : "Chưa cập nhật thông tin"}
        </div>
      </section>

      <section className="company-profile-card reveal" id="company-jobs">
        <div className="company-profile-section-head company-profile-section-head--row">
          <div>
            <h2>Việc làm đang tuyển</h2>
            <p>Danh sách vị trí hiện có tại doanh nghiệp này.</p>
          </div>
          <span>{jobs.length} tin tuyển dụng</span>
        </div>

        <div className="company-profile-jobs">
          {jobs.map((job, index) => (
            <article
              className="company-profile-job-card reveal"
              style={{ transitionDelay: `${Math.min(index, 8) * 70}ms` }}
              key={"job" + job.id}
            >
              <div className="company-profile-job-logo">
                <AppImage src={infor.logo} fallbackVariant="logo" alt={infor.name} />
              </div>
              <div className="company-profile-job-body">
                <Link to={`/jobs/${job.id}`} className="company-profile-job-title">
                  {job.jname}
                </Link>
                <span>{infor.name}</span>
                <div className="company-profile-job-meta">
                  <span>
                    <MdOutlineAttachMoney />
                    {formatSalary(job)}
                  </span>
                  <span>
                    <MdLocationOn />
                    {job.location || job.address || companyLocation}
                  </span>
                  <span>
                    <BsCalendarEvent />
                    Đăng {formatDate(job.created_at || job.postDate, "Đang cập nhật")}
                  </span>
                  <span>
                    <BsCalendar2Check />
                    Hạn {formatDate(job.expire_at || job.deadline, "Đang tuyển")}
                  </span>
                </div>
              </div>
              <Link to={`/jobs/${job.id}`} className="company-profile-job-cta">
                Xem chi tiết
                <BsBoxArrowUpRight />
              </Link>
            </article>
          ))}

          {jobs.length === 0 && (
            <div className="company-profile-empty">
              <BsBriefcase />
              <h3>Chưa có vị trí đang tuyển</h3>
              <p>Doanh nghiệp hiện chưa công khai tin tuyển dụng mới.</p>
            </div>
          )}
        </div>
      </section>

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
        {(mapExternalUrl || googleMapsUrl) && (
          <Modal.Footer>
            {mapExternalUrl && (
              <a
                href={mapExternalUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-secondary"
              >
                Mở bản đồ lớn
              </a>
            )}
            {googleMapsUrl && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-dark"
              >
                Xem qua Google Maps
              </a>
            )}
          </Modal.Footer>
        )}
      </Modal>
    </div>
  );
}

export default Company;
