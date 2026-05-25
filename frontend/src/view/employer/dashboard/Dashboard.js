import "./dashboard.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  BsArrowClockwise,
  BsArrowUpRight,
  BsBarChartLineFill,
  BsBuildings,
  BsCameraFill,
  BsCardImage,
  BsChevronUp,
  BsCheckCircleFill,
  BsFillBriefcaseFill,
  BsFillGeoAltFill,
  BsFillPeopleFill,
  BsImageFill,
  BsPencilSquare,
  BsPinMapFill,
  BsSearch,
  BsTrash3Fill,
} from "react-icons/bs";
import authApi from "../../../api/auth";
import employerApi from "../../../api/employer";
import AppImage from "../../../components/AppImage";
import { employerAuthActions } from "../../../redux/slices/employerAuthSlice";

const LEAFLET_JS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const LEAFLET_CSS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const DEFAULT_CENTER = [21.028511, 105.804817];
const DEFAULT_ZOOM = 6;
const FOCUS_ZOOM = 16;

const initialFormState = {
  name: "",
  contact_name: "",
  phone: "",
  website: "",
  address: "",
  map_lat: "",
  map_lng: "",
  min_employees: "",
  max_employees: "",
  description: "",
};

const scrollToSection = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const createObjectPreview = (file) => (file ? URL.createObjectURL(file) : "");

const hasMapLocation = (company) =>
  Boolean(
    company?.map_lat !== null &&
      company?.map_lat !== undefined &&
      company?.map_lat !== "" &&
      company?.map_lng !== null &&
      company?.map_lng !== undefined &&
      company?.map_lng !== ""
  );

const buildMapExternalUrl = (lat, lng) => {
  if (!hasMapLocation({ map_lat: lat, map_lng: lng })) {
    return "";
  }

  return `https://www.openstreetmap.org/?mlat=${Number(lat)}&mlon=${Number(lng)}#map=16/${Number(lat)}/${Number(lng)}`;
};

const formatCoordinates = (lat, lng) => {
  if (!hasMapLocation({ map_lat: lat, map_lng: lng })) {
    return "Chưa có tọa độ";
  }

  return `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`;
};

const ensureLeaflet = async () => {
  if (window.L) {
    return window.L;
  }

  if (!document.querySelector(`link[href="${LEAFLET_CSS_URL}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = LEAFLET_CSS_URL;
    document.head.appendChild(link);
  }

  await new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${LEAFLET_JS_URL}"]`);

    if (existing) {
      if (window.L) {
        resolve();
        return;
      }

      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = LEAFLET_JS_URL;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });

  return window.L;
};

const reverseGeocode = async (lat, lng) => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=vi`
  );

  if (!res.ok) {
    throw new Error("Không thể lấy địa chỉ từ bản đồ.");
  }

  const data = await res.json();
  return data.display_name || `${lat}, ${lng}`;
};

const searchLocation = async (query) => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&accept-language=vi&q=${encodeURIComponent(
      query
    )}`
  );

  if (!res.ok) {
    throw new Error("Không thể tìm kiếm địa điểm.");
  }

  return res.json();
};

const handleAmbientPointerMove = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--x", `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty("--y", `${event.clientY - rect.top}px`);
};

export default function EmployerDashboard() {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const employerAuth = useSelector((state) => state.employerAuth.current || {});
  const company = employerAuth.employer;
  const authPermissions = employerAuth.permissions || {};

  const [dashboard, setDashboard] = useState({
    employer: null,
    stats: {
      total_jobs: 0,
      active_jobs: 0,
      inactive_jobs: 0,
      total_applications: 0,
      waiting_applications: 0,
      interviewing_applications: 0,
      passed_applications: 0,
      rejected_applications: 0,
    },
    monthly_applications: [],
    application_status: [],
    job_performance: [],
    branches: [],
    branch: null,
    branch_summaries: [],
    branch_stats: {
      total: 0,
      active: 0,
      with_jobs: 0,
      without_location: 0,
      total_members: 0,
    },
    workspace_location: null,
    profile_scope: "",
    permissions: {},
  });
  const [companyForm, setCompanyForm] = useState(initialFormState);
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [savingSection, setSavingSection] = useState("");
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [sharedMapUrl, setSharedMapUrl] = useState("");
  const [mapSearchResults, setMapSearchResults] = useState([]);
  const [isMapSearching, setIsMapSearching] = useState(false);
  const [isResolvingSharedMapUrl, setIsResolvingSharedMapUrl] = useState(false);
  const [isLocatingCurrentPosition, setIsLocatingCurrentPosition] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [mapError, setMapError] = useState("");
  const mapNodeRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const canEditScopeRef = useRef(false);

  const companyProfile = dashboard.employer || company || {};
  const hasDashboardPermissions = Object.keys(dashboard.permissions || {}).length > 0;
  const dashboardPermissions = hasDashboardPermissions ? dashboard.permissions : authPermissions || {};
  const authMember = employerAuth.member || employerAuth.company_member || {};
  const authBranch =
    employerAuth.branch ||
    authMember.branch ||
    (authMember.branch_id
      ? (employerAuth.branches || []).find((branch) => String(branch.id) === String(authMember.branch_id))
      : null);
  const effectiveProfileScope =
    dashboard.profile_scope || (authMember.role && authMember.role !== "company_owner" ? "branch" : "company");
  const isBranchScope = effectiveProfileScope === "branch";
  const scopedProfile = isBranchScope
    ? dashboard.workspace_location || dashboard.branch || dashboard.branches?.[0] || authBranch || {}
    : dashboard.workspace_location || companyProfile || {};
  const employer = scopedProfile?.id ? scopedProfile : companyProfile || {};
  const scopeLabel = isBranchScope ? "chi nhánh" : "công ty";
  const canEditScope = Boolean(
    isBranchScope
      ? dashboardPermissions.update_own_branch || dashboardPermissions.update_branches
      : dashboardPermissions.manage_company_profile
  );
  const branchSummaries = dashboard.branch_summaries || [];
  const branchStats = dashboard.branch_stats || {};
  const topBranchSummaries = branchSummaries.slice(0, 4);

  useEffect(() => {
    canEditScopeRef.current = canEditScope;
  }, [canEditScope]);

  const syncMarker = (lat, lng) => {
    if (!mapRef.current || !window.L || !hasMapLocation({ map_lat: lat, map_lng: lng })) {
      return;
    }

    const point = [Number(lat), Number(lng)];

    if (!markerRef.current) {
      markerRef.current = window.L.marker(point).addTo(mapRef.current);
    } else {
      markerRef.current.setLatLng(point);
    }

    mapRef.current.setView(point, FOCUS_ZOOM);
  };

  const clearMarker = () => {
    if (markerRef.current && mapRef.current) {
      mapRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
  };

  const updateLocationFields = (nextAddress, lat, lng) => {
    const safeAddress = nextAddress ? String(nextAddress).slice(0, 255) : "";
    setCompanyForm((currentValue) => ({
      ...currentValue,
      address: safeAddress,
      map_lat: lat === null || lat === undefined ? "" : String(lat),
      map_lng: lng === null || lng === undefined ? "" : String(lng),
    }));
  };

  const handleMapSelection = async (lat, lng) => {
    if (!canEditScopeRef.current) {
      return;
    }

    try {
      setMapError("");
      setIsResolvingAddress(true);
      syncMarker(lat, lng);
      const address = await reverseGeocode(lat, lng);
      updateLocationFields(address, lat, lng);
    } catch (error) {
      setMapError(error.message || "Không thể lấy địa chỉ từ vị trí đã chọn.");
      updateLocationFields(companyForm.address || `${lat}, ${lng}`, lat, lng);
    } finally {
      setIsResolvingAddress(false);
    }
  };

  const hydrateForm = (employerData) => {
    setCompanyForm({
      name: employerData?.name || "",
      contact_name: employerData?.contact_name || "",
      phone: employerData?.phone || "",
      website: employerData?.website || "",
      address: employerData?.address || "",
      map_lat:
        employerData?.map_lat !== null && employerData?.map_lat !== undefined
          ? String(employerData.map_lat)
          : "",
      map_lng:
        employerData?.map_lng !== null && employerData?.map_lng !== undefined
          ? String(employerData.map_lng)
          : "",
      min_employees:
        employerData?.min_employees !== null && employerData?.min_employees !== undefined
          ? String(employerData.min_employees)
          : "",
      max_employees:
        employerData?.max_employees !== null && employerData?.max_employees !== undefined
          ? String(employerData.max_employees)
          : "",
      description: employerData?.description || "",
    });
    setMapSearchQuery("");
    setSharedMapUrl("");
    setMapSearchResults([]);
    setMapError("");
    setLogoPreview("");
    setCoverPreview("");
    setLogoFile(null);
    setCoverFile(null);
  };

  const getDashboard = async () => {
    const res = await employerApi.getDashboard();
    setDashboard(res);
    const profile =
      res.profile_scope === "branch"
        ? res.workspace_location || res.branch || res.branches?.[0]
        : res.workspace_location || res.employer;
    hydrateForm(profile);
  };

  const refreshAuthEmployer = async () => {
    const res = await authApi.getMe(2);
    dispatch(employerAuthActions.setUser(res));
  };

  useEffect(() => {
    getDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [logoPreview, coverPreview]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isProfileEditorOpen) {
      return undefined;
    }

    let isMounted = true;

    const bootMap = async () => {
      try {
        const leaflet = await ensureLeaflet();
        if (!isMounted || !mapNodeRef.current || mapRef.current) {
          return;
        }

        const hasLocation = hasMapLocation(companyForm);
        mapRef.current = leaflet.map(mapNodeRef.current, {
          center: hasLocation
            ? [Number(companyForm.map_lat), Number(companyForm.map_lng)]
            : DEFAULT_CENTER,
          zoom: hasLocation ? FOCUS_ZOOM : DEFAULT_ZOOM,
        });

        leaflet
          .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
          })
          .addTo(mapRef.current);

        mapRef.current.on("click", (event) => {
          handleMapSelection(event.latlng.lat, event.latlng.lng);
        });

        if (hasLocation) {
          syncMarker(companyForm.map_lat, companyForm.map_lng);
        }
      } catch (error) {
        if (isMounted) {
          setMapError("Không thể tải bản đồ. Hãy kiểm tra kết nối mạng.");
        }
      }
    };

    bootMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProfileEditorOpen]);

  useEffect(() => {
    if (hasMapLocation({ map_lat: companyForm.map_lat, map_lng: companyForm.map_lng })) {
      syncMarker(companyForm.map_lat, companyForm.map_lng);
    } else {
      clearMarker();
    }
  }, [companyForm.map_lat, companyForm.map_lng]);

  const maxMonthlyValue = useMemo(() => {
    const values = dashboard.monthly_applications.map((item) => item.value);
    return Math.max(...values, 1);
  }, [dashboard.monthly_applications]);

  const maxJobApplications = useMemo(() => {
    const values = dashboard.job_performance.map((item) => item.total_applications);
    return Math.max(...values, 1);
  }, [dashboard.job_performance]);

  const openProfileEditor = () => {
    setIsProfileEditorOpen(true);
    window.setTimeout(() => scrollToSection("company-info-section"), 60);
  };

  const summaryCards = [
    {
      title: "Tin tuyển dụng",
      value: dashboard.stats.total_jobs,
      hint: `${dashboard.stats.active_jobs} đang mở, ${dashboard.stats.inactive_jobs} tạm dừng`,
      icon: <BsFillBriefcaseFill />,
      tone: "teal",
    },
    {
      title: "Lượt ứng tuyển",
      value: dashboard.stats.total_applications,
      hint: `${dashboard.stats.waiting_applications} hồ sơ đang chờ xử lý`,
      icon: <BsFillPeopleFill />,
      tone: "blue",
    },
    {
      title: "Ứng viên đạt",
      value: dashboard.stats.passed_applications,
      hint: `${dashboard.stats.interviewing_applications} đang ở vòng phỏng vấn`,
      icon: <BsCheckCircleFill />,
      tone: "amber",
    },
    {
      title: isBranchScope ? "Tỷ lệ phản hồi" : "Chi nhánh",
      value: isBranchScope
        ? dashboard.stats.total_applications > 0
          ? `${Math.round(
              ((dashboard.stats.interviewing_applications +
                dashboard.stats.passed_applications +
                dashboard.stats.rejected_applications) /
                dashboard.stats.total_applications) *
                100
            )}%`
          : "0%"
        : `${branchStats.active || 0}/${branchStats.total || 0}`,
      hint: isBranchScope
        ? "Tính trên toàn bộ hồ sơ đã nhận"
        : `${branchStats.with_jobs || 0} chi nhánh đang có tin tuyển dụng`,
      icon: isBranchScope ? <BsBarChartLineFill /> : <BsBuildings />,
      tone: "slate",
    },
  ];

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setCompanyForm((currentValue) => ({ ...currentValue, [name]: value }));
  };

  const sendUpdateRequest = async (section, formData, successMessage) => {
    try {
      setSavingSection(section);
      if (section === "info" && isBranchScope) {
        await employerApi.updateBranch(employer.id, formData);
      } else {
        await employerApi.updateCurrent(formData);
      }
      await Promise.all([getDashboard(), refreshAuthEmployer()]);
      toast.success(successMessage);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể cập nhật dữ liệu.");
    } finally {
      setSavingSection("");
    }
  };

  const handleSaveCompanyInfo = async () => {
    if (!canEditScope) {
      toast.error("Bạn không có quyền cập nhật thông tin này.");
      return;
    }

    if (isBranchScope) {
      await sendUpdateRequest(
        "info",
        {
          name: companyForm.name,
          contact_name: companyForm.contact_name,
          phone: companyForm.phone,
          address: companyForm.address,
          map_lat: companyForm.map_lat === "" ? null : companyForm.map_lat,
          map_lng: companyForm.map_lng === "" ? null : companyForm.map_lng,
        },
        "Đã cập nhật thông tin chi nhánh."
      );
      return;
    }

    const formData = new FormData();
    Object.entries(companyForm).forEach(([key, value]) => {
      formData.append(key, value);
    });
    await sendUpdateRequest("info", formData, "Đã cập nhật thông tin công ty.");
  };

  const handleSaveLogo = async () => {
    if (isBranchScope) {
      toast.info("Logo được quản lý ở hồ sơ tổng công ty.");
      return;
    }

    if (!logoFile) {
      toast.info("Chọn logo trước khi cập nhật.");
      return;
    }

    const formData = new FormData();
    formData.append("logo", logoFile);
    await sendUpdateRequest("logo", formData, "Đã cập nhật logo công ty.");
  };

  const handleSaveCover = async () => {
    if (isBranchScope) {
      toast.info("Ảnh nền được quản lý ở hồ sơ tổng công ty.");
      return;
    }

    if (!coverFile) {
      toast.info("Chọn ảnh nền trước khi cập nhật.");
      return;
    }

    const formData = new FormData();
    formData.append("image", coverFile);
    await sendUpdateRequest("cover", formData, "Đã cập nhật ảnh nền công ty.");
  };

  const handleChooseLogo = (event) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;

    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }

    setLogoFile(nextFile);
    setLogoPreview(createObjectPreview(nextFile));
  };

  const handleChooseCover = (event) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;

    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }

    setCoverFile(nextFile);
    setCoverPreview(createObjectPreview(nextFile));
  };

  const handleSearchMap = async () => {
    if (!canEditScope) {
      return;
    }

    if (!mapSearchQuery.trim()) {
      setMapSearchResults([]);
      return;
    }

    try {
      setMapError("");
      setIsMapSearching(true);
      const results = await searchLocation(mapSearchQuery.trim());
      setMapSearchResults(results);
    } catch (error) {
      setMapError(error.message || "Không thể tìm kiếm địa điểm.");
    } finally {
      setIsMapSearching(false);
    }
  };

  const handleSelectMapResult = (result) => {
    if (!canEditScope) {
      return;
    }

    const lat = Number(result.lat);
    const lng = Number(result.lon);
    setMapSearchResults([]);
    setMapSearchQuery(result.display_name || "");
    syncMarker(lat, lng);
    updateLocationFields(result.display_name || `${lat}, ${lng}`, lat, lng);
  };

  const handleClearMapLocation = () => {
    if (!canEditScope) {
      return;
    }

    setMapSearchQuery("");
    setSharedMapUrl("");
    setMapSearchResults([]);
    setMapError("");
    clearMarker();
    updateLocationFields("", "", "");
  };

  const handleResolveSharedMapUrl = async () => {
    if (!canEditScope) {
      return;
    }

    if (!sharedMapUrl.trim()) {
      setMapError("Hãy nhập liên kết chia sẻ Google Maps.");
      return;
    }

    try {
      setMapError("");
      setIsResolvingSharedMapUrl(true);
      const response = await employerApi.resolveSharedMapLink({ url: sharedMapUrl.trim() });
      const lat = Number(response?.lat);
      const lng = Number(response?.lng);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        throw new Error("Không đọc được tọa độ từ liên kết Google Maps.");
      }

      setMapSearchResults([]);
      setMapSearchQuery(response?.resolved_url || `${lat}, ${lng}`);
      await handleMapSelection(lat, lng);
      toast.success("Đã lấy vị trí từ liên kết Google Maps.");
    } catch (error) {
      setMapError(error?.response?.data?.message || error?.message || "Không thể xử lý liên kết Google Maps.");
    } finally {
      setIsResolvingSharedMapUrl(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    if (!canEditScope) {
      return;
    }

    if (!navigator.geolocation) {
      setMapError("Trình duyệt hiện tại không hỗ trợ GPS.");
      return;
    }

    try {
      setMapError("");
      setIsLocatingCurrentPosition(true);

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        });
      });

      const lat = Number(position.coords.latitude);
      const lng = Number(position.coords.longitude);
      setMapSearchResults([]);
      setMapSearchQuery("Vị trí hiện tại");
      await handleMapSelection(lat, lng);
      toast.success("Đã lấy vị trí hiện tại.");
    } catch (error) {
      if (error?.code === 1) {
        setMapError("Bạn đã từ chối quyền truy cập vị trí.");
      } else if (error?.code === 2) {
        setMapError("Không xác định được vị trí hiện tại.");
      } else if (error?.code === 3) {
        setMapError("Yêu cầu lấy vị trí đã hết thời gian.");
      } else {
        setMapError("Không thể lấy vị trí hiện tại.");
      }
    } finally {
      setIsLocatingCurrentPosition(false);
    }
  };

  return (
    <div className="employer-dashboard">
      <section
        className={`employer-dashboard__hero ${!isBranchScope ? "employer-dashboard__hero--company" : ""}`}
        onMouseMove={handleAmbientPointerMove}
      >
        <div className="employer-dashboard__hero-content">
          <div className="dashboard-kicker">
            {isBranchScope ? "Employer control room" : "Company command center"}
          </div>
          <h1>{employer?.name || "Dashboard nhà tuyển dụng"}</h1>
          <p>
            {isBranchScope
              ? "Theo dõi hiệu suất tuyển dụng và vị trí chi nhánh trong phạm vi được phân quyền."
              : "Quản lý toàn bộ chi nhánh, tin tuyển dụng, hồ sơ ứng tuyển và quyền truy cập HR trong một màn hình gọn."}
          </p>
          <div className="dashboard-quick-actions">
            {!isBranchScope && (
              <button type="button" onClick={() => nav("/employer/branches")}>
                <BsBuildings /> Quản lý chi nhánh
              </button>
            )}
            <button type="button" onClick={() => nav("/employer/jobs")}>
              <BsFillBriefcaseFill /> Việc làm
            </button>
            <button type="button" onClick={openProfileEditor}>
              <BsPencilSquare /> Chỉnh hồ sơ {scopeLabel}
            </button>
            {!isBranchScope && isProfileEditorOpen && (
              <>
                <button type="button" onClick={() => scrollToSection("company-logo-section")}>
                  <BsCameraFill /> Chỉnh logo
                </button>
                <button type="button" onClick={() => scrollToSection("company-cover-section")}>
                  <BsCardImage /> Chỉnh ảnh nền
                </button>
              </>
            )}
          </div>
        </div>

        {!isBranchScope ? (
          <div className="dashboard-branch-overview">
            <div className="dashboard-branch-overview__head">
              <div>
                <span>Tổng quan chi nhánh</span>
                <strong>{branchStats.total || 0} chi nhánh</strong>
              </div>
              <button type="button" onClick={() => nav("/employer/branches")}>
                <BsBuildings />
                Mở quản lý
              </button>
            </div>

            <div className="dashboard-branch-overview__stats">
              <div>
                <strong>{branchStats.active || 0}</strong>
                <span>Đang hoạt động</span>
              </div>
              <div>
                <strong>{branchStats.with_jobs || 0}</strong>
                <span>Có tin tuyển dụng</span>
              </div>
              <div>
                <strong>{branchStats.total_members || 0}</strong>
                <span>Nhân sự HR</span>
              </div>
            </div>

            <div className="dashboard-branch-overview__list">
              {topBranchSummaries.map((branch) => (
                <div key={branch.id} className="dashboard-branch-overview__item">
                  <div>
                    <strong>{branch.name}</strong>
                    <span>{branch.is_headquarters ? "Trụ sở chính" : branch.address || "Chưa cập nhật địa chỉ"}</span>
                  </div>
                  <div>
                    <b>{branch.active_jobs}/{branch.total_jobs}</b>
                    <small>tin mở</small>
                  </div>
                </div>
              ))}
              {topBranchSummaries.length === 0 && (
                <div className="dashboard-empty">Chưa có chi nhánh để hiển thị.</div>
              )}
            </div>
          </div>
        ) : (
          <div className="dashboard-hero__profile">
            <div className="dashboard-hero__cover">
              <AppImage
                src={coverPreview || companyProfile?.image}
                fallbackVariant="cover"
                alt={employer?.name || "Company cover"}
              />
            </div>
            <div className="dashboard-hero__metrics" aria-label="Recruitment summary">
              <div>
                <span>{dashboard.stats.total_jobs}</span>
                <small>Tin tuyển dụng</small>
              </div>
              <div>
                <span>{dashboard.stats.total_applications}</span>
                <small>Lượt ứng tuyển</small>
              </div>
              <div>
                <span>{dashboard.stats.passed_applications}</span>
                <small>Ứng viên đạt</small>
              </div>
            </div>
            <div className="dashboard-hero__company">
              <div className="dashboard-hero__logo">
                <AppImage
                  src={logoPreview || companyProfile?.logo}
                  fallbackVariant="logo"
                  alt={employer?.name || "Company logo"}
                />
              </div>
              <div>
                <div className="dashboard-hero__name">{employer?.name || "Company"}</div>
                <div className="dashboard-hero__meta">
                  <BsBuildings />
                  <span>{employer?.address || "Chưa cập nhật vị trí"}</span>
                </div>
                <div className="dashboard-hero__meta">
                  <BsArrowUpRight />
                  <span>{companyProfile?.name || "Tổng công ty"}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="dashboard-summary-grid">
        {summaryCards.map((card) => (
          <article
            key={card.title}
            className={`summary-card summary-card--${card.tone}`}
            onMouseMove={handleAmbientPointerMove}
          >
            <div className="summary-card__icon">{card.icon}</div>
            <div className="summary-card__body">
              <div className="summary-card__title">{card.title}</div>
              <div className="summary-card__value">{card.value}</div>
              <div className="summary-card__hint">{card.hint}</div>
            </div>
          </article>
        ))}
      </section>

      {!isBranchScope && (
        <section className="dashboard-panel dashboard-branch-section" onMouseMove={handleAmbientPointerMove}>
          <div className="dashboard-panel__head dashboard-branch-section__head">
            <div>
              <h2>Toàn bộ chi nhánh</h2>
              <p>Theo dõi job, hồ sơ và đội HR theo từng chi nhánh. Thao tác chi tiết ở màn quản lý chi nhánh.</p>
            </div>
            <button type="button" className="dashboard-secondary-btn" onClick={() => nav("/employer/branches")}>
              <BsBuildings />
              Quản lý chi nhánh
            </button>
          </div>

          <div className="dashboard-branch-table">
            {branchSummaries.map((branch) => (
              <div key={branch.id} className="dashboard-branch-row">
                <div className="dashboard-branch-row__main">
                  <strong>{branch.name}</strong>
                  <span>{branch.address || "Chưa cập nhật địa chỉ"}</span>
                </div>
                <div>
                  <b>{branch.active_jobs}/{branch.total_jobs}</b>
                  <span>Tin đang mở</span>
                </div>
                <div>
                  <b>{branch.total_applications}</b>
                  <span>Hồ sơ</span>
                </div>
                <div>
                  <b>{branch.total_members}</b>
                  <span>HR/QLCN</span>
                </div>
                <div className={`dashboard-branch-status ${branch.is_active ? "is-active" : "is-paused"}`}>
                  {branch.is_headquarters ? "Trụ sở" : branch.is_active ? "Hoạt động" : "Tạm dừng"}
                </div>
              </div>
            ))}

            {branchSummaries.length === 0 && (
              <div className="dashboard-empty">Chưa có chi nhánh. Hãy tạo chi nhánh trước khi phân quyền HR.</div>
            )}
          </div>
        </section>
      )}

      <section className="dashboard-chart-grid">
        <article className="dashboard-panel dashboard-panel--ambient" onMouseMove={handleAmbientPointerMove}>
          <div className="dashboard-panel__head">
            <div>
              <h2>Ứng tuyển 6 tháng gần đây</h2>
              <p>Sơ đồ cột theo số hồ sơ nộp vào các tin tuyển dụng.</p>
            </div>
          </div>
          <div className="applications-chart">
            {dashboard.monthly_applications.map((item) => (
              <div key={item.label} className="applications-chart__col">
                <span className="applications-chart__value">{item.value}</span>
                <div className="applications-chart__track">
                  <div
                    className="applications-chart__bar"
                    style={{
                      height: `${Math.max((item.value / maxMonthlyValue) * 100, item.value > 0 ? 16 : 0)}%`,
                    }}
                  />
                </div>
                <span className="applications-chart__label">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="dashboard-panel__insight">
            Pipeline đang được tính theo dữ liệu ứng tuyển 6 tháng gần nhất.
          </div>
        </article>

        <article className="dashboard-panel dashboard-panel--ambient" onMouseMove={handleAmbientPointerMove}>
          <div className="dashboard-panel__head">
            <div>
              <h2>Hiệu quả từng tin tuyển dụng</h2>
              <p>Top tin đang thu hút nhiều hồ sơ nhất trong doanh nghiệp.</p>
            </div>
          </div>
          <div className="performance-list">
            {dashboard.job_performance.map((item, index) => (
              <div key={item.id} className="performance-item">
                <div className="performance-item__top">
                  <div className="performance-item__rank">#{index + 1}</div>
                  <div>
                    <div className="performance-item__title">{item.jname}</div>
                    <div className="performance-item__meta">
                      {item.is_active ? "Đang hiển thị" : "Đang ẩn"}
                    </div>
                  </div>
                  <div className="performance-item__count">{item.total_applications}</div>
                </div>
                <div className="performance-item__bar">
                  <div
                    className="performance-item__bar-fill"
                    style={{
                      width: `${Math.max(
                        (item.total_applications / maxJobApplications) * 100,
                        item.total_applications > 0 ? 8 : 0
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {isProfileEditorOpen && (
      <>
      <section id="company-info-section" className="dashboard-editor-grid">
        <article className="dashboard-panel dashboard-editor">
          <div className="dashboard-panel__head">
            <div>
              <h2>Thông tin {scopeLabel}</h2>
              <p>
                {isBranchScope
                  ? "Dashboard này dùng vị trí chi nhánh được phân quyền, không dùng vị trí tổng công ty."
                  : "Chỉnh các trường text, website, quy mô, mô tả và vị trí bản đồ."}
              </p>
            </div>
            <button type="button" className="dashboard-secondary-btn" onClick={() => setIsProfileEditorOpen(false)}>
              <BsChevronUp />
              Thu gọn
            </button>
          </div>
          <fieldset className="dashboard-form-grid" disabled={!canEditScope}>
            <label>
              <span>Tên {scopeLabel}</span>
              <input name="name" value={companyForm.name} onChange={handleInputChange} />
            </label>
            <label>
              <span>Người liên hệ</span>
              <input
                name="contact_name"
                value={companyForm.contact_name}
                onChange={handleInputChange}
              />
            </label>
            <label>
              <span>Số điện thoại</span>
              <input name="phone" value={companyForm.phone} onChange={handleInputChange} />
            </label>
            {!isBranchScope && (
              <>
                <label>
                  <span>Website</span>
                  <input name="website" value={companyForm.website} onChange={handleInputChange} />
                </label>
                <label>
                  <span>Quy mô từ</span>
                  <input
                    type="number"
                    name="min_employees"
                    value={companyForm.min_employees}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  <span>Quy mô đến</span>
                  <input
                    type="number"
                    name="max_employees"
                    value={companyForm.max_employees}
                    onChange={handleInputChange}
                  />
                </label>
                <label className="dashboard-form-grid__full">
                  <span>Mô tả công ty</span>
                  <textarea
                    rows="6"
                    name="description"
                    value={companyForm.description}
                    onChange={handleInputChange}
                  />
                </label>
              </>
            )}
          </fieldset>

          <div className="dashboard-map-card">
            <div className="dashboard-map-card__head">
              <div>
                <h3>Vị trí {scopeLabel} trên bản đồ</h3>
                <p>
                  {canEditScope
                    ? "Tìm kiếm địa điểm hoặc bấm trực tiếp lên bản đồ để ghim vị trí."
                    : "Bạn chỉ có quyền xem vị trí trong phạm vi được phân quyền."}
                </p>
              </div>
              {hasMapLocation(companyForm) && (
                <a
                  className="dashboard-map-card__link"
                  href={buildMapExternalUrl(companyForm.map_lat, companyForm.map_lng)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <BsPinMapFill />
                  <span>Mở bản đồ lớn</span>
                </a>
              )}
            </div>

            <div className="dashboard-map-search">
              <div className="dashboard-map-search__input">
                <BsSearch />
                <input
                  value={mapSearchQuery}
                  onChange={(event) => setMapSearchQuery(event.target.value)}
                  placeholder="Tìm tên đường, quận, thành phố..."
                  disabled={!canEditScope}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleSearchMap();
                    }
                  }}
                />
              </div>
              <button
                type="button"
                className="dashboard-secondary-btn"
                onClick={handleSearchMap}
                disabled={!canEditScope || isMapSearching}
              >
                {isMapSearching ? <BsArrowClockwise className="dashboard-spin" /> : <BsSearch />}
                <span>Tìm</span>
              </button>
              <button
                type="button"
                className="dashboard-danger-btn"
                onClick={handleClearMapLocation}
                disabled={!canEditScope}
              >
                <BsTrash3Fill />
                <span>Xóa vị trí</span>
              </button>
            </div>

            <div className="dashboard-map-search">
              <div className="dashboard-map-search__input">
                <BsPinMapFill />
                <input
                  value={sharedMapUrl}
                  onChange={(event) => setSharedMapUrl(event.target.value)}
                  placeholder="Dán link chia sẻ Google Maps, ví dụ https://maps.app.goo.gl/..."
                  disabled={!canEditScope}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleResolveSharedMapUrl();
                    }
                  }}
                />
              </div>
              <button
                type="button"
                className="dashboard-secondary-btn"
                onClick={handleResolveSharedMapUrl}
                disabled={!canEditScope || isResolvingSharedMapUrl}
              >
                {isResolvingSharedMapUrl ? <BsArrowClockwise className="dashboard-spin" /> : <BsPinMapFill />}
                <span>{isResolvingSharedMapUrl ? "Đang đọc link..." : "Dùng link Google Maps"}</span>
              </button>
              <button
                type="button"
                className="dashboard-primary-btn"
                onClick={handleUseCurrentLocation}
                disabled={!canEditScope || isLocatingCurrentPosition}
              >
                <BsFillGeoAltFill />
                <span>{isLocatingCurrentPosition ? "Đang lấy GPS..." : "Dùng vị trí hiện tại"}</span>
              </button>
            </div>

            {mapSearchResults.length > 0 && (
              <div className="dashboard-map-results">
                {mapSearchResults.map((result) => (
                  <button
                    key={`${result.place_id}_${result.lat}_${result.lon}`}
                    type="button"
                    className="dashboard-map-result"
                    onClick={() => handleSelectMapResult(result)}
                    disabled={!canEditScope}
                  >
                    <BsFillGeoAltFill />
                    <span>{result.display_name}</span>
                  </button>
                ))}
              </div>
            )}

            <div ref={mapNodeRef} className="dashboard-map-canvas" />

            <div className="dashboard-map-meta">
              <div className="dashboard-map-meta__card">
                <div className="dashboard-map-meta__label">Địa chỉ hiển thị</div>
                <div className="dashboard-map-meta__value">
                  {companyForm.address || (isResolvingAddress ? "Đang lấy địa chỉ..." : "Chưa chọn vị trí")}
                </div>
              </div>
              <div className="dashboard-map-meta__card">
                <div className="dashboard-map-meta__label">Tọa độ</div>
                <div className="dashboard-map-meta__value">
                  {formatCoordinates(companyForm.map_lat, companyForm.map_lng)}
                </div>
              </div>
            </div>

            {mapError && <div className="dashboard-map-error">{mapError}</div>}
          </div>

          <div className="dashboard-editor__actions">
            <button
              type="button"
              className="dashboard-primary-btn"
              disabled={!canEditScope || savingSection === "info"}
              onClick={handleSaveCompanyInfo}
            >
              {savingSection === "info" ? "Đang lưu..." : `Lưu thông tin ${scopeLabel}`}
            </button>
          </div>
        </article>
      </section>

      {!isBranchScope && (
      <section className="dashboard-editor-grid">
        <article id="company-logo-section" className="dashboard-panel dashboard-asset-card">
          <div className="dashboard-panel__head">
            <div>
              <h2>Logo công ty</h2>
              <p>Upload logo mới. File sẽ được lưu trong thư mục dự án.</p>
            </div>
          </div>
          <div className="dashboard-asset-card__preview dashboard-asset-card__preview--logo">
            <AppImage
              src={logoPreview || companyProfile?.logo}
              fallbackVariant="logo"
              alt={employer?.name || "Logo"}
            />
          </div>
          <label className="dashboard-upload-field">
            <BsImageFill />
            <span>{logoFile ? logoFile.name : "Chọn logo PNG/JPG/WEBP"}</span>
            <input type="file" accept=".png,.jpg,.jpeg,.webp" onChange={handleChooseLogo} />
          </label>
          <button
            type="button"
            className="dashboard-primary-btn"
            disabled={savingSection === "logo"}
            onClick={handleSaveLogo}
          >
            {savingSection === "logo" ? "Đang cập nhật..." : "Cập nhật logo"}
          </button>
        </article>

        <article id="company-cover-section" className="dashboard-panel dashboard-asset-card">
          <div className="dashboard-panel__head">
            <div>
              <h2>Ảnh nền công ty</h2>
              <p>Upload cover mới cho trang doanh nghiệp và các job card.</p>
            </div>
          </div>
          <div className="dashboard-asset-card__preview dashboard-asset-card__preview--cover">
            <AppImage
              src={coverPreview || companyProfile?.image}
              fallbackVariant="cover"
              alt={employer?.name || "Cover"}
            />
          </div>
          <label className="dashboard-upload-field">
            <BsCardImage />
            <span>{coverFile ? coverFile.name : "Chọn ảnh nền PNG/JPG/WEBP"}</span>
            <input type="file" accept=".png,.jpg,.jpeg,.webp" onChange={handleChooseCover} />
          </label>
          <button
            type="button"
            className="dashboard-primary-btn"
            disabled={savingSection === "cover"}
            onClick={handleSaveCover}
          >
            {savingSection === "cover" ? "Đang cập nhật..." : "Cập nhật ảnh nền"}
          </button>
        </article>
      </section>
      )}
      </>
      )}
    </div>
  );
}





