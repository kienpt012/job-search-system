import "./job.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AiFillHeart, AiOutlineHeart, AiOutlinePlus } from "react-icons/ai";
import {
  BsCalendar2Check,
  BsCalendarEvent,
  BsFillBriefcaseFill,
  BsFillGeoAltFill,
  BsFillPeopleFill,
  BsFillPersonFill,
  BsPersonWorkspace,
  BsUpload,
} from "react-icons/bs";
import { FaIndustry } from "react-icons/fa";
import { useSelector } from "react-redux";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import jobApi from "../../api/job";
import candidateApi from "../../api/candidate";
import resumeApi from "../../api/resume";
import { MdOutlineAttachMoney } from "react-icons/md";
import { IoMdPeople } from "react-icons/io";
import dayjs from "dayjs";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
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

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatMultiline = (value = "") => escapeHtml(value).replace(/\n/g, "<br />");

const sanitizeFileName = (value = "cv") => {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 _-]/g, "")
    .trim()
    .replace(/\s+/g, "_");

  return normalized || "cv";
};

const formatMonthYear = (value, fallback = "Hiện tại") =>
  value ? dayjs(value).format("MM/YYYY") : fallback;

const isPdfFile = (selectedFile) => {
  if (!selectedFile) {
    return false;
  }

  return (
    selectedFile.type === "application/pdf" ||
    selectedFile.name.toLowerCase().endsWith(".pdf")
  );
};

const buildResumeSection = (title, content) => {
  if (!content) {
    return "";
  }

  return `
    <section style="margin-top: 24px;">
      <h2 style="margin: 0 0 12px; font-size: 18px; color: #0f766e; border-bottom: 1px solid #d1d5db; padding-bottom: 8px;">
        ${escapeHtml(title)}
      </h2>
      ${content}
    </section>
  `;
};

const buildResumePdfMarkup = (resumeData) => {
  const basicInfor = resumeData?.basicInfor || {};
  const fullName =
    basicInfor.fullname ||
    [basicInfor.lastname, basicInfor.firstname].filter(Boolean).join(" ") ||
    "Ứng viên";

  const contactItems = [
    basicInfor.phone,
    basicInfor.email,
    basicInfor.address,
    basicInfor.link,
  ]
    .filter(Boolean)
    .map((item) => escapeHtml(item));

  const buildSimpleList = (items, renderer) => {
    const filteredItems = Array.isArray(items) ? items.filter(Boolean) : [];
    if (filteredItems.length === 0) {
      return "";
    }

    return filteredItems
      .map(
        (item) => `
          <div style="margin-bottom: 14px;">
            ${renderer(item)}
          </div>
        `
      )
      .join("");
  };

  const objectiveSection = basicInfor.objective
    ? `<p style="margin: 0; font-size: 14px; line-height: 1.6;">${formatMultiline(
        basicInfor.objective
      )}</p>`
    : "";

  const educationSection = buildSimpleList(resumeData?.educations, (item) => {
    const dateRange = `${formatMonthYear(item.start_date, "")}${
      item.start_date || item.end_date ? " - " : ""
    }${formatMonthYear(item.end_date)}`.trim();

    return `
      <div style="font-weight: 700; font-size: 15px;">${escapeHtml(
        item.school || "Học vấn"
      )}</div>
      <div style="font-size: 14px; color: #374151; margin-top: 2px;">
        ${escapeHtml(item.major || "")}
      </div>
      <div style="font-size: 13px; color: #6b7280; margin-top: 2px;">
        ${escapeHtml(dateRange)}
      </div>
      ${
        item.description
          ? `<div style="font-size: 14px; margin-top: 6px; line-height: 1.6;">${formatMultiline(
              item.description
            )}</div>`
          : ""
      }
    `;
  });

  const experienceSection = buildSimpleList(resumeData?.experiences, (item) => {
    const dateRange = `${formatMonthYear(item.start_date, "")}${
      item.start_date || item.end_date ? " - " : ""
    }${formatMonthYear(item.end_date)}`.trim();

    return `
      <div style="font-weight: 700; font-size: 15px;">${escapeHtml(
        item.name || "Kinh nghiệm"
      )}</div>
      <div style="font-size: 14px; color: #374151; margin-top: 2px;">
        ${escapeHtml(item.company || "")}
      </div>
      <div style="font-size: 13px; color: #6b7280; margin-top: 2px;">
        ${escapeHtml(dateRange)}
      </div>
      ${
        item.description
          ? `<div style="font-size: 14px; margin-top: 6px; line-height: 1.6;">${formatMultiline(
              item.description
            )}</div>`
          : ""
      }
    `;
  });

  const projectSection = buildSimpleList(resumeData?.projects, (item) => {
    const metaParts = [item.role, item.prj_type, item.technologies, item.link].filter(Boolean);
    const dateRange = `${formatMonthYear(item.start_date, "")}${
      item.start_date || item.end_date ? " - " : ""
    }${formatMonthYear(item.end_date)}`.trim();

    return `
      <div style="font-weight: 700; font-size: 15px;">${escapeHtml(
        item.name || "Dự án"
      )}</div>
      ${
        metaParts.length > 0
          ? `<div style="font-size: 14px; color: #374151; margin-top: 2px;">
              ${escapeHtml(metaParts.join(" | "))}
            </div>`
          : ""
      }
      <div style="font-size: 13px; color: #6b7280; margin-top: 2px;">
        ${escapeHtml(dateRange)}
      </div>
      ${
        item.description
          ? `<div style="font-size: 14px; margin-top: 6px; line-height: 1.6;">${formatMultiline(
              item.description
            )}</div>`
          : ""
      }
    `;
  });

  const skillSection = buildSimpleList(resumeData?.skills, (item) => {
    const description = item.description ? `: ${item.description}` : "";
    return `<div style="font-size: 14px; line-height: 1.6;">• ${escapeHtml(
      `${item.name || "Kỹ năng"}${description}`
    )}</div>`;
  });

  const certificateSection = buildSimpleList(
    resumeData?.certificates,
    (item) => `
      <div style="font-size: 14px; line-height: 1.6;">
        • ${escapeHtml(item.name || "Chứng chỉ")}
        ${item.receive_date ? ` (${escapeHtml(dayjs(item.receive_date).format("MM/YYYY"))})` : ""}
      </div>
    `
  );

  const prizeSection = buildSimpleList(
    resumeData?.prizes,
    (item) => `
      <div style="font-size: 14px; line-height: 1.6;">
        • ${escapeHtml(item.name || "Giải thưởng")}
        ${item.receive_date ? ` (${escapeHtml(dayjs(item.receive_date).format("MM/YYYY"))})` : ""}
      </div>
    `
  );

  const activitySection = buildSimpleList(resumeData?.activities, (item) => {
    const metaParts = [item.organization, item.role, item.link].filter(Boolean);
    const dateRange = `${formatMonthYear(item.start_date, "")}${
      item.start_date || item.end_date ? " - " : ""
    }${formatMonthYear(item.end_date)}`.trim();

    return `
      <div style="font-weight: 700; font-size: 15px;">${escapeHtml(
        item.name || "Hoạt động"
      )}</div>
      ${
        metaParts.length > 0
          ? `<div style="font-size: 14px; color: #374151; margin-top: 2px;">
              ${escapeHtml(metaParts.join(" | "))}
            </div>`
          : ""
      }
      <div style="font-size: 13px; color: #6b7280; margin-top: 2px;">
        ${escapeHtml(dateRange)}
      </div>
      ${
        item.description
          ? `<div style="font-size: 14px; margin-top: 6px; line-height: 1.6;">${formatMultiline(
              item.description
            )}</div>`
          : ""
      }
    `;
  });

  const otherSection = buildSimpleList(
    resumeData?.others,
    (item) => `
      <div style="font-size: 14px; line-height: 1.6;">
        <strong>${escapeHtml(item.name || "Khác")}:</strong>
        ${formatMultiline(item.description || "")}
      </div>
    `
  );

  return `
    <div style="width: 794px; background: #ffffff; color: #111827; padding: 40px 48px; font-family: Arial, sans-serif; box-sizing: border-box;">
      <header style="border-bottom: 2px solid #0f766e; padding-bottom: 16px;">
        <div style="font-size: 28px; font-weight: 700; line-height: 1.3;">
          ${escapeHtml(basicInfor.title || "Hồ sơ ứng tuyển")}
        </div>
        <div style="font-size: 24px; font-weight: 700; margin-top: 10px;">
          ${escapeHtml(fullName)}
        </div>
        ${
          contactItems.length > 0
            ? `<div style="font-size: 14px; color: #374151; margin-top: 10px; line-height: 1.6;">
                ${contactItems.join(" | ")}
              </div>`
            : ""
        }
      </header>

      ${buildResumeSection("Mục tiêu nghề nghiệp", objectiveSection)}
      ${buildResumeSection("Học vấn", educationSection)}
      ${buildResumeSection("Kinh nghiệm", experienceSection)}
      ${buildResumeSection("Dự án", projectSection)}
      ${buildResumeSection("Kỹ năng", skillSection)}
      ${buildResumeSection("Chứng chỉ", certificateSection)}
      ${buildResumeSection("Giải thưởng", prizeSection)}
      ${buildResumeSection("Hoạt động", activitySection)}
      ${buildResumeSection("Khác", otherSection)}
    </div>
  `;
};

const createPdfFileFromResume = async (resumeData, fallbackTitle) => {
  const tempElement = document.createElement("div");
  tempElement.style.position = "fixed";
  tempElement.style.left = "-10000px";
  tempElement.style.top = "0";
  tempElement.style.zIndex = "-1";
  tempElement.style.background = "#ffffff";
  tempElement.innerHTML = buildResumePdfMarkup(resumeData);
  document.body.appendChild(tempElement);

  try {
    const canvas = await html2canvas(tempElement, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
    });
    const imageData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imageHeight = (canvas.height * pdfWidth) / canvas.width;
    let remainingHeight = imageHeight;
    let position = 0;

    pdf.addImage(imageData, "PNG", 0, position, pdfWidth, imageHeight);
    remainingHeight -= pdfHeight;

    while (remainingHeight > 0) {
      position = remainingHeight - imageHeight;
      pdf.addPage();
      pdf.addImage(imageData, "PNG", 0, position, pdfWidth, imageHeight);
      remainingHeight -= pdfHeight;
    }

    const pdfBlob = pdf.output("blob");
    const fileName = `${sanitizeFileName(
      resumeData?.basicInfor?.title || fallbackTitle || "cv_online"
    )}.pdf`;

    return new File([pdfBlob], fileName, { type: "application/pdf" });
  } finally {
    document.body.removeChild(tempElement);
  }
};

function Job() {
  const { id } = useParams();
  const nav = useNavigate();
  const [job, setJob] = useState({
    employer: {},
    jtype: {},
    jlevel: {},
    industries: {},
  });
  const user = useSelector((state) => state.candAuth.current);
  const isAuth = useSelector((state) => state.candAuth.isAuth);
  const [isApplied, setIsApplied] = useState(false);
  const [isUpload, setIsUpload] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [file, setFile] = useState();
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [industries, setIndustries] = useState([]);
  const [showCompanyMap, setShowCompanyMap] = useState(false);
  const candidateFullName =
    [user?.lastname, user?.firstname].filter(Boolean).join(" ").trim() || "";

  const getJobInf = async () => {
    const res = await jobApi.getById(id);
    setJob(res);
    setIndustries(res.industries);
  };

  const checkApplying = async () => {
    const res = await jobApi.checkApplying(id);
    setIsApplied(res.value);
  };

  const getResumes = async () => {
    const res = await resumeApi.getByCurrentCandidate();
    setResumes(res);
    if (res.length > 0) {
      setSelectedResumeId((currentResumeId) => {
        if (res.some((item) => item.id === currentResumeId)) {
          return currentResumeId;
        }
        return res[0].id;
      });
    } else {
      setSelectedResumeId(null);
    }
  };

  const handleApply = async () => {
    const formData = new FormData();

    try {
      setIsApplying(true);

      if (isUpload) {
        if (!file) {
          alert("Vui lòng chọn hồ sơ tải lên!");
          return;
        }

        if (!isPdfFile(file)) {
          alert("Chỉ hỗ trợ nộp file PDF!");
          return;
        }

        formData.append("cv", file);
        formData.append("fname", `${sanitizeFileName(file.name.replace(/\.pdf$/i, ""))}.pdf`);
      } else {
        const selectedResume = resumes.find(
          (item) => item.id === Number(selectedResumeId)
        );

        if (!selectedResume) {
          alert("Vui lòng chọn hồ sơ để ứng tuyển!");
          return;
        }

        const resumeDetail = await resumeApi.getById(selectedResume.id);
        const generatedPdfFile = await createPdfFileFromResume(
          resumeDetail,
          selectedResume.title
        );

        formData.append("resume_id", selectedResume.id);
        formData.append("cv", generatedPdfFile);
        formData.append("fname", generatedPdfFile.name);
      }

      await jobApi.apply(id, formData);
      alert("Ứng tuyển thành công!");
      window.location.reload();
    } finally {
      setIsApplying(false);
    }
  };

  const checkLoggedIn = () => {
    if (!isAuth) {
      alert("Vui lòng đăng nhập!");
    }
  };

  const checkJobSaved = async () => {
    const res = await candidateApi.checkJobSaved(id);
    setIsSaved(res.value);
  };

  const handleClickSaveBtn = async (status) => {
    const data = { status };
    await candidateApi.processJobSaving(id, data);
    setIsSaved(!isSaved);
    setTimeout(() => {
      alert("Cập nhật thành công!");
    }, 100);
  };

  useEffect(() => {
    getJobInf();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const companyMapEmbedUrl = buildMapEmbedUrl(job.employer?.map_lat, job.employer?.map_lng);
  const companyMapExternalUrl = buildMapExternalUrl(job.employer?.map_lat, job.employer?.map_lng);
  const companyGoogleMapsUrl = buildGoogleMapsUrl(job.employer?.map_lat, job.employer?.map_lng);

  useEffect(() => {
    if (isAuth) {
      checkApplying();
      checkJobSaved();
      getResumes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth]);

  return (
    <div className="job-layout">
      <div className="job-cover">
        <AppImage
          src={job.employer.image}
          fallbackVariant="cover"
          alt={"com-img-" + job.employer.id}
        />
      </div>
      <div className="job-content">
        <div className="d-flex mt-3 flex-column flex-lg-row">
          <div className="left-part">
            <div className="job-main-panel">
              <div className="d-flex flex-column flex-md-row gap-4 border-bottom pb-4">
                <div
                  className="logo-frame"
                  style={{ width: "130px", height: "130px" }}
                >
                  <AppImage
                    src={job.employer.logo}
                    fallbackVariant="logo"
                    width="100%"
                    alt={job.employer.name}
                  />
                </div>
                <div className="flex-fill">
                  <h1 className="mt-2 mb-2 app-section-title">{job.jname}</h1>
                  <div className="text-secondary ts-smd">{job.employer.name}</div>
                  <div className="d-flex flex-wrap gap-3 mt-4">
                    <button
                      className="btn app-button-primary ts-sm px-4"
                      data-bs-toggle={isAuth ? "modal" : ""}
                      data-bs-target={isAuth ? "#applying_dialog" : ""}
                      disabled={isApplied === true}
                      onClick={() => {
                        if (isAuth) {
                          setIsUpload(false);
                          setFile(undefined);
                          getResumes();
                        } else {
                          checkLoggedIn();
                        }
                      }}
                    >
                      {isApplied === true ? "Đã ứng tuyển" : "Ứng tuyển"}
                    </button>
                    <button
                      className="btn btn-outline-danger ts-sm px-4"
                      onClick={() => handleClickSaveBtn(!isSaved)}
                    >
                      {!isSaved ? (
                        <div>
                          <AiOutlineHeart className="fs-5" /> Lưu việc làm
                        </div>
                      ) : (
                        <div>
                          <AiFillHeart className="fs-5" /> Hủy lưu việc làm
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="job-detail-grid mt-4">
                <div className="job-detail-item">
                  <FaIndustry className="text-main me-1 fs-5" />
                  <div>
                    <div className="job-detail-item__label">Ngành nghề</div>
                    <div className="job-detail-item__value">
                      {industries.map((item, index) => (
                        <span key={"industry" + item.id}>
                          {item.name}
                          {index !== industries.length - 1 ? ", " : null}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="job-detail-item">
                  <MdOutlineAttachMoney className="text-main me-1 fs-5" />
                  <div>
                    <div className="job-detail-item__label">Lương</div>
                    <div className="job-detail-item__value">
                      {job.min_salary ? (
                        <span>
                          {job.min_salary} - {job.max_salary} triệu VND
                        </span>
                      ) : (
                        <span>Cạnh tranh</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="job-detail-item">
                  <BsFillBriefcaseFill className="text-main me-1 fs-5" />
                  <div>
                    <div className="job-detail-item__label">Kinh nghiệm</div>
                    <div className="job-detail-item__value">
                      {job.yoe ? (
                        <span>{job.yoe} năm</span>
                      ) : (
                        <span>Không yêu cầu</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="job-detail-item">
                  <BsFillPeopleFill className="text-main me-1 fs-5" />
                  <div>
                    <div className="job-detail-item__label">Số lượng</div>
                    <div className="job-detail-item__value">
                      {job.amount} người
                    </div>
                  </div>
                </div>
                <div className="job-detail-item">
                  <BsPersonWorkspace className="text-main me-1 fs-5" />
                  <div>
                    <div className="job-detail-item__label">Hình thức</div>
                    <div className="job-detail-item__value">{job.jtype.name}</div>
                  </div>
                </div>
                <div className="job-detail-item">
                  <BsFillPersonFill className="text-main me-1 fs-5" />
                  <div>
                    <div className="job-detail-item__label">Cấp bậc</div>
                    <div className="job-detail-item__value">{job.jlevel.name}</div>
                  </div>
                </div>
                <div className="job-detail-item">
                  <BsCalendarEvent className="text-main me-1 fs-5" />
                  <div>
                    <div className="job-detail-item__label">Ngày đăng</div>
                    <div className="job-detail-item__value">
                      {dayjs(job.created_at).format("DD/MM/YYYY")}
                    </div>
                  </div>
                </div>
                <div className="job-detail-item">
                  <BsCalendar2Check className="text-main me-1 fs-5" />
                  <div>
                    <div className="job-detail-item__label">Hạn nộp</div>
                    <div className="job-detail-item__value">
                      {dayjs(job.expire_at).format("DD/MM/YYYY")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="job-main-panel mt-4 mb-5">
              <h2 className="app-section-title mb-3">Chi tiết công việc</h2>
              <div className="p-0">
                {job.description ? (
                  <div className="whitespace-preline">{job.description}</div>
                ) : (
                  "Chưa cập nhật thông tin"
                )}
              </div>
            </div>
          </div>

          <div className="right-part ps-lg-3 pt-3 pt-lg-0">
            <div className="job-side-panel">
              <div className="d-flex align-items-center mb-3">
                <div
                  className="logo-frame"
                  style={{ width: "84px", height: "84px" }}
                >
                  <AppImage
                    src={job.employer.logo}
                    fallbackVariant="logo"
                    width="100%"
                    alt={job.employer.name}
                  />
                </div>
                <div className="fw-bold ms-3">{job.employer.name}</div>
              </div>
              <div className="mx-1 ts-smd">
                <div className="d-flex mb-2">
                  <div
                    className="d-flex align-items-center text-secondary"
                    style={{ minWidth: "100px" }}
                  >
                    <IoMdPeople className="fs-5 me-1" />
                    Quy mô:
                  </div>
                  <div>
                    {job.employer.min_employees ? (
                      <>
                        {job.employer.min_employees}
                        {job.employer.max_employees !== 0
                          ? " - " + job.employer.max_employees
                          : "+ "}{" "}
                        nhân viên
                      </>
                    ) : (
                      "Chưa cập nhật"
                    )}
                  </div>
                </div>
                <div className="d-flex">
                  <div className="text-secondary" style={{ minWidth: "100px" }}>
                    <BsFillGeoAltFill className="me-1 mb-1" />
                    Địa điểm:
                  </div>
                  <div
                    className="whitespace-preline"
                    style={{ fontSize: "14.5px" }}
                  >
                    {job.employer.address || job.address}
                  </div>
                </div>
                {hasMapLocation(job.employer) && (
                  <>
                    <Button
                      size="sm"
                      variant="light"
                      className="container-fluid mt-3 border"
                      onClick={() => setShowCompanyMap(true)}
                    >
                      Xem vị trí công ty
                    </Button>
                    <a
                      href={companyGoogleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline-dark btn-sm container-fluid mt-2"
                    >
                      Xem trên Google Maps
                    </a>
                  </>
                )}
                <Button
                  size="sm"
                  className="container-fluid mt-3 app-button-primary"
                  onClick={() => nav(`/companies/${job.employer.id}`)}
                >
                  Xem trang công ty
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isAuth && (
        <div className="modal fade" id="applying_dialog">
          <div
            className="modal-dialog modal-lg modal-fullscreen-sm-down modal-dialog-scrollable"
            style={{ width: "60%" }}
          >
            <div className="modal-content">
              <div className="modal-header border-bottom-0">
                <button
                  type="button"
                  className="btn-close btn btn-sm"
                  data-bs-dismiss="modal"
                ></button>
              </div>
              <div className="modal-body ps-5">
                <span style={{ fontSize: "15px" }}>Ứng tuyển vào vị trí</span>
                <h4>{job.jname}</h4>
                <span className="text-secondary" style={{ fontSize: "15px" }}>
                  {job.employer.name}
                </span>

                <form className="mt-3" style={{ width: "65%" }}>
                  <div>
                    <label htmlFor="fullname">Họ và tên</label>
                    <input
                      type="text"
                      className="form-control"
                      name="fullname"
                      placeholder={candidateFullName}
                      disabled
                    />
                  </div>
                  <div className="mt-2">
                    <label htmlFor="email">Email</label>
                    <input
                      type="text"
                      className="form-control"
                      name="email"
                      placeholder={user && user.email}
                      disabled
                    />
                  </div>
                </form>
                <div className="mt-3">
                  Hồ sơ của bạn:
                  <div>
                    {resumes.length > 0 && !isUpload && (
                      <div className="mt-2 w-50">
                        {resumes.map((item) => (
                          <label
                            key={`resume-option-${item.id}`}
                            className="form-check border rounded px-3 py-2 mb-2 d-flex align-items-center gap-2"
                            style={{ cursor: "pointer" }}
                          >
                            <input
                              className="form-check-input mt-0"
                              type="radio"
                              name="selected_resume"
                              checked={Number(selectedResumeId) === item.id}
                              onChange={() => {
                                setSelectedResumeId(item.id);
                                setFile(undefined);
                              }}
                            />
                            <span>{item.title}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    {resumes.length === 0 && !isUpload && (
                      <button
                        type="button"
                        className="btn btn-outline-primary mt-2 w-50"
                        onClick={() => {
                          document.getElementById("close-dialog-btn").click();
                          nav("/candidate/resumes");
                        }}
                      >
                        <AiOutlinePlus /> Tạo hồ sơ trực tuyến
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-outline-primary mt-3 w-50"
                      onClick={() => {
                        setIsUpload((currentValue) => {
                          const nextValue = !currentValue;
                          if (nextValue) {
                            setSelectedResumeId(null);
                          } else if (resumes.length > 0) {
                            setSelectedResumeId(resumes[0].id);
                          }
                          setFile(undefined);
                          return nextValue;
                        });
                      }}
                    >
                      <BsUpload /> Tải lên hồ sơ có sẵn
                    </button>
                    {resumes.length > 0 && (
                      <>
                        <br />
                        <button
                          type="button"
                          className="btn btn-outline-secondary mt-3 w-50"
                          onClick={() => {
                            document.getElementById("close-dialog-btn").click();
                            nav("/candidate/resumes");
                          }}
                        >
                          <AiOutlinePlus /> Quản lý / tạo thêm hồ sơ
                        </button>
                      </>
                    )}
                    {isUpload && (
                      <div>
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          className="form-control mt-3 w-50"
                          onChange={(e) => {
                            const selectedFile = e.target.files[0];

                            if (selectedFile && !isPdfFile(selectedFile)) {
                              alert("Chỉ hỗ trợ chọn file PDF!");
                              e.target.value = "";
                              setFile(undefined);
                              return;
                            }

                            setFile(selectedFile);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top-0">
                <button
                  type="button"
                  className="btn app-button-primary"
                  disabled={isApplying}
                  onClick={handleApply}
                >
                  {isApplying ? "Đang nộp..." : "Nộp hồ sơ"}
                </button>
                <button
                  id="close-dialog-btn"
                  type="button"
                  className="btn btn-danger"
                  data-bs-dismiss="modal"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal show={showCompanyMap} onHide={() => setShowCompanyMap(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>Vị trí của {job.employer?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3 text-secondary">{job.employer?.address || job.address}</div>
          {companyMapEmbedUrl ? (
            <iframe
              title={`map-company-${job.employer?.id || "job"}`}
              src={companyMapEmbedUrl}
              width="100%"
              height="460"
              style={{ border: 0, borderRadius: "20px" }}
              loading="lazy"
            />
          ) : (
            <div className="alert alert-info mb-0">Công ty này chưa ghim vị trí trên bản đồ.</div>
          )}
        </Modal.Body>
        {(companyMapExternalUrl || companyGoogleMapsUrl) && (
          <Modal.Footer>
            {companyMapExternalUrl && (
              <a
                href={companyMapExternalUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-secondary"
              >
                Mở bản đồ lớn
              </a>
            )}
            {companyGoogleMapsUrl && (
              <a
                href={companyGoogleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-dark"
              >
                Xem trên Google Maps
              </a>
            )}
          </Modal.Footer>
        )}
      </Modal>
    </div>
  );
}

export default Job;
