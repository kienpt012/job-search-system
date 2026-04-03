import "./admin.css";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BsArrowRepeat,
  BsBarChartFill,
  BsBuildingsFill,
  BsCheckCircleFill,
  BsFillPeopleFill,
  BsFillGeoAltFill,
  BsFolderFill,
  BsImageFill,
  BsKeyFill,
  BsLockFill,
  BsPencilSquare,
  BsPlusCircleFill,
  BsPinMapFill,
  BsSearch,
  BsShieldFillCheck,
  BsTrashFill,
} from "react-icons/bs";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import AppImage from "../../components/AppImage";
import adminApi from "../../api/admin";
import { adminAuthActions } from "../../redux/slices/adminAuthSlice";

const initialCompanyForm = {
  email: "",
  password: "",
  name: "",
  address: "",
  map_lat: "",
  map_lng: "",
  contact_name: "",
  phone: "",
  website: "",
  description: "",
  min_employees: "",
  max_employees: "",
  is_hot: false,
  is_active: true,
};

const LEAFLET_JS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const LEAFLET_CSS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const DEFAULT_CENTER = [21.028511, 105.804817];
const DEFAULT_ZOOM = 6;
const FOCUS_ZOOM = 16;

const hasMapLocation = (company) =>
  Boolean(
    company?.map_lat !== null &&
      company?.map_lat !== undefined &&
      company?.map_lat !== "" &&
      company?.map_lng !== null &&
      company?.map_lng !== undefined &&
      company?.map_lng !== ""
  );

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

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const currentAdmin = useSelector((state) => state.adminAuth.current);
  const [dashboard, setDashboard] = useState({
    stats: {},
    role_breakdown: [],
    status_breakdown: [],
    monthly_registrations: [],
    users: [],
    companies: [],
    current_admin: null,
  });
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [companyForm, setCompanyForm] = useState(initialCompanyForm);
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [savingSection, setSavingSection] = useState("");
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [sharedMapUrl, setSharedMapUrl] = useState("");
  const [mapSearchResults, setMapSearchResults] = useState([]);
  const [isMapSearching, setIsMapSearching] = useState(false);
  const [isResolvingSharedMapUrl, setIsResolvingSharedMapUrl] = useState(false);
  const [isLocatingCurrentPosition, setIsLocatingCurrentPosition] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [mapError, setMapError] = useState("");
  const mapNodeRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

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
      map_lat: lat === null || lat === undefined || lat === "" ? "" : String(lat),
      map_lng: lng === null || lng === undefined || lng === "" ? "" : String(lng),
    }));
  };

  const handleMapSelection = async (lat, lng) => {
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

  const loadDashboard = async () => {
    const res = await adminApi.getDashboard();
    setDashboard(res);
    dispatch(adminAuthActions.setUser(res.current_admin));
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview, logoPreview]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (hasMapLocation({ map_lat: companyForm.map_lat, map_lng: companyForm.map_lng })) {
      syncMarker(companyForm.map_lat, companyForm.map_lng);
    } else {
      clearMarker();
    }
  }, [companyForm.map_lat, companyForm.map_lng]);

  const maxMonthlyValue = useMemo(() => {
    const values = dashboard.monthly_registrations.map((item) => item.value);
    return Math.max(...values, 1);
  }, [dashboard.monthly_registrations]);

  const summaryCards = [
    {
      title: "Người dùng",
      value: dashboard.stats.total_users || 0,
      hint: `${dashboard.stats.active_users || 0} đang hoạt động`,
      icon: <BsFillPeopleFill />,
      tone: "teal",
    },
    {
      title: "Công ty",
      value: dashboard.stats.total_companies || 0,
      hint: `${dashboard.stats.hot_companies || 0} công ty nổi bật`,
      icon: <BsBuildingsFill />,
      tone: "blue",
    },
    {
      title: "Tin tuyển dụng",
      value: dashboard.stats.total_jobs || 0,
      hint: `${dashboard.stats.active_jobs || 0} tin đang mở`,
      icon: <BsFolderFill />,
      tone: "amber",
    },
    {
      title: "Lượt ứng tuyển",
      value: dashboard.stats.total_applications || 0,
      hint: `${dashboard.stats.locked_users || 0} tài khoản đang khóa`,
      icon: <BsBarChartFill />,
      tone: "slate",
    },
  ];

  const getCompanyById = (id) => dashboard.companies.find((item) => item.id === id);

  const resetCompanyEditor = () => {
    setSelectedCompanyId(null);
    setCompanyForm(initialCompanyForm);
    setLogoFile(null);
    setCoverFile(null);
    setMapSearchQuery("");
    setSharedMapUrl("");
    setMapSearchResults([]);
    setMapError("");
    clearMarker();
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
      setLogoPreview("");
    }
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
      setCoverPreview("");
    }
  };

  const hydrateCompanyForm = (company) => {
    setSelectedCompanyId(company.id);
    setCompanyForm({
      email: company.account_email || "",
      password: "",
      name: company.name || "",
      address: company.address || "",
      map_lat:
        company.map_lat !== null && company.map_lat !== undefined ? String(company.map_lat) : "",
      map_lng:
        company.map_lng !== null && company.map_lng !== undefined ? String(company.map_lng) : "",
      contact_name: company.contact_name || "",
      phone: company.phone || "",
      website: company.website || "",
      description: company.description || "",
      min_employees:
        company.min_employees !== null && company.min_employees !== undefined
          ? String(company.min_employees)
          : "",
      max_employees:
        company.max_employees !== null && company.max_employees !== undefined
          ? String(company.max_employees)
          : "",
      is_hot: Boolean(company.is_hot),
      is_active: Boolean(company.account_is_active ?? company.is_active),
    });
    setLogoFile(null);
    setCoverFile(null);
    setMapSearchQuery(company.address || "");
    setMapSearchResults([]);
    setMapError("");
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
      setLogoPreview("");
    }
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
      setCoverPreview("");
    }
  };

  const handleCompanyFieldChange = (event) => {
    const { name, value, type, checked } = event.target;
    setCompanyForm((currentValue) => ({
      ...currentValue,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSearchMap = async () => {
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
    const lat = Number(result.lat);
    const lng = Number(result.lon);
    setMapSearchResults([]);
    setMapSearchQuery(result.display_name || "");
    syncMarker(lat, lng);
    updateLocationFields(result.display_name || `${lat}, ${lng}`, lat, lng);
  };

  const handleClearMapLocation = () => {
    setMapSearchQuery("");
    setSharedMapUrl("");
    setMapSearchResults([]);
    setMapError("");
    clearMarker();
    updateLocationFields("", "", "");
  };

  const handleResolveSharedMapUrl = async () => {
    if (!sharedMapUrl.trim()) {
      setMapError("Hãy nhập liên kết chia sẻ Google Maps.");
      return;
    }

    try {
      setMapError("");
      setIsResolvingSharedMapUrl(true);
      const response = await adminApi.resolveSharedMapLink({ url: sharedMapUrl.trim() });
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

  const handleChooseAsset = (event, type) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;

    if (type === "logo") {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      setLogoFile(nextFile);
      setLogoPreview(URL.createObjectURL(nextFile));
      return;
    }

    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverFile(nextFile);
    setCoverPreview(URL.createObjectURL(nextFile));
  };

  const handleSaveCompany = async () => {
    if (!companyForm.email || !companyForm.name) {
      toast.info("Email tài khoản và tên công ty là bắt buộc.");
      return;
    }

    if (!selectedCompanyId && !companyForm.password) {
      toast.info("Cần nhập mật khẩu cho công ty mới.");
      return;
    }

    const formData = new FormData();
    Object.entries(companyForm).forEach(([key, value]) => {
      if (key === "password" && selectedCompanyId && !value) {
        return;
      }

      if (typeof value === "boolean") {
        formData.append(key, value ? "1" : "0");
        return;
      }

      formData.append(key, value ?? "");
    });

    if (logoFile) formData.append("logo", logoFile);
    if (coverFile) formData.append("image", coverFile);

    try {
      setSavingSection("company");
      if (selectedCompanyId) {
        await adminApi.updateCompany(selectedCompanyId, formData);
        toast.success("Đã cập nhật công ty.");
      } else {
        await adminApi.createCompany(formData);
        toast.success("Đã tạo công ty mới.");
        resetCompanyEditor();
      }

      await loadDashboard();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể lưu thông tin công ty.");
    } finally {
      setSavingSection("");
    }
  };

  const handleDeleteCompany = async (company) => {
    if (!window.confirm(`Xóa công ty "${company.name}" và toàn bộ dữ liệu liên quan?`)) {
      return;
    }

    try {
      await adminApi.deleteCompany(company.id);
      toast.success("Đã xóa công ty.");
      if (selectedCompanyId === company.id) {
        resetCompanyEditor();
      }
      await loadDashboard();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể xóa công ty.");
    }
  };

  const handleToggleUser = async (user) => {
    try {
      await adminApi.updateUserStatus(user.id, { is_active: user.is_active ? 0 : 1 });
      toast.success(user.is_active ? "Đã khóa tài khoản." : "Đã mở khóa tài khoản.");
      await loadDashboard();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể cập nhật trạng thái.");
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Xóa tài khoản "${user.email}" và dữ liệu liên quan?`)) {
      return;
    }

    try {
      await adminApi.deleteUser(user.id);
      toast.success("Đã xóa tài khoản.");
      if (selectedUser?.id === user.id) {
        setSelectedUser(null);
        setNewPassword("");
      }
      await loadDashboard();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể xóa tài khoản.");
    }
  };

  const handleUpdatePassword = async () => {
    if (!selectedUser) {
      toast.info("Chọn tài khoản cần đổi mật khẩu.");
      return;
    }

    if (newPassword.length < 6) {
      toast.info("Mật khẩu mới cần từ 6 ký tự.");
      return;
    }

    try {
      setSavingSection("password");
      await adminApi.updateUserPassword(selectedUser.id, { password: newPassword });
      toast.success("Đã cập nhật mật khẩu.");
      setNewPassword("");
      await loadDashboard();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể cập nhật mật khẩu.");
    } finally {
      setSavingSection("");
    }
  };

  const selectedCompany = getCompanyById(selectedCompanyId);

  return (
    <div className="system-admin-dashboard">
      <section className="system-admin-hero">
        <div>
          <div className="system-admin-kicker">Highest level access</div>
          <h1>Quản trị hệ thống tuyển dụng</h1>
          <p>
            Tạo công ty mới, chỉnh tài khoản nhà tuyển dụng, khóa người dùng, đổi mật khẩu
            và xóa cứng dữ liệu liên quan từ một màn điều khiển tập trung.
          </p>
        </div>

        <div className="system-admin-hero__meta">
          <div className="system-admin-chip">
            <BsShieldFillCheck />
            <span>{currentAdmin?.email || dashboard.current_admin?.email || "admin"}</span>
          </div>
          <div className="system-admin-chip">
            <BsLockFill />
            <span>{dashboard.stats.locked_users || 0} tài khoản đang khóa</span>
          </div>
        </div>
      </section>

      <section className="system-admin-summary-grid">
        {summaryCards.map((card) => (
          <article key={card.title} className={`system-summary-card system-summary-card--${card.tone}`}>
            <div className="system-summary-card__icon">{card.icon}</div>
            <div>
              <div className="system-summary-card__title">{card.title}</div>
              <div className="system-summary-card__value">{card.value}</div>
              <div className="system-summary-card__hint">{card.hint}</div>
            </div>
          </article>
        ))}
      </section>

      <section className="system-admin-chart-grid">
        <article className="system-panel">
          <div className="system-panel__head">
            <div>
              <h2>Tài khoản tạo mới 6 tháng gần đây</h2>
              <p>Biểu đồ cột theo số tài khoản được tạo trong hệ thống.</p>
            </div>
          </div>
          <div className="system-bar-chart">
            {dashboard.monthly_registrations.map((item) => (
              <div key={item.label} className="system-bar-chart__column">
                <span className="system-bar-chart__value">{item.value}</span>
                <div className="system-bar-chart__track">
                  <div
                    className="system-bar-chart__bar"
                    style={{
                      height: `${Math.max((item.value / maxMonthlyValue) * 100, item.value > 0 ? 12 : 0)}%`,
                    }}
                  />
                </div>
                <span className="system-bar-chart__label">{item.label}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="system-panel">
          <div className="system-panel__head">
            <div>
              <h2>Cơ cấu hệ thống</h2>
              <p>Phân bổ role và trạng thái tài khoản hiện tại.</p>
            </div>
          </div>

          <div className="system-ring-grid">
            {[...dashboard.role_breakdown, ...dashboard.status_breakdown].map((item) => {
              const ratio = (dashboard.stats.total_users || 0) > 0 ? item.value / dashboard.stats.total_users : 0;

              return (
                <div key={item.label} className="system-ring-card">
                  <div
                    className="system-ring-card__ring"
                    style={{
                      background: `conic-gradient(${item.tone} ${ratio * 360}deg, #e2e8f0 0deg)`,
                    }}
                  >
                    <div className="system-ring-card__inner">{Math.round(ratio * 100)}%</div>
                  </div>
                  <div className="system-ring-card__label">{item.label}</div>
                  <div className="system-ring-card__value">{item.value}</div>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="system-admin-editor-grid">
        <article className="system-panel system-panel--accent">
          <div className="system-panel__head">
            <div>
              <h2>{selectedCompanyId ? "Chỉnh công ty" : "Tạo công ty mới"}</h2>
              <p>Tài khoản employer và logo, ảnh nền đều được lưu trong thư mục dự án.</p>
            </div>
            <button type="button" className="admin-secondary-btn" onClick={resetCompanyEditor}>
              <BsPlusCircleFill />
              <span>Mẫu mới</span>
            </button>
          </div>

          <div className="system-company-form">
            <label>
              <span>Email đăng nhập</span>
              <input name="email" value={companyForm.email} onChange={handleCompanyFieldChange} />
            </label>
            <label>
              <span>{selectedCompanyId ? "Mật khẩu mới (không bắt buộc)" : "Mật khẩu"}</span>
              <input
                type="password"
                name="password"
                value={companyForm.password}
                onChange={handleCompanyFieldChange}
              />
            </label>
            <label>
              <span>Tên công ty</span>
              <input name="name" value={companyForm.name} onChange={handleCompanyFieldChange} />
            </label>
            <label>
              <span>Người liên hệ</span>
              <input
                name="contact_name"
                value={companyForm.contact_name}
                onChange={handleCompanyFieldChange}
              />
            </label>
            <label>
              <span>Số điện thoại</span>
              <input name="phone" value={companyForm.phone} onChange={handleCompanyFieldChange} />
            </label>
            <label>
              <span>Website</span>
              <input name="website" value={companyForm.website} onChange={handleCompanyFieldChange} />
            </label>
            <label>
              <span>Quy mô tối thiểu</span>
              <input
                name="min_employees"
                value={companyForm.min_employees}
                onChange={handleCompanyFieldChange}
              />
            </label>
            <label>
              <span>Quy mô tối đa</span>
              <input
                name="max_employees"
                value={companyForm.max_employees}
                onChange={handleCompanyFieldChange}
              />
            </label>
            <label className="system-company-form__full">
              <span>Mô tả công ty</span>
              <textarea
                rows="5"
                name="description"
                value={companyForm.description}
                onChange={handleCompanyFieldChange}
              />
            </label>
            <div className="system-company-form__switches">
              <label className="system-switch">
                <input
                  type="checkbox"
                  name="is_hot"
                  checked={companyForm.is_hot}
                  onChange={handleCompanyFieldChange}
                />
                <span>Công ty nổi bật</span>
              </label>
              <label className="system-switch">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={companyForm.is_active}
                  onChange={handleCompanyFieldChange}
                />
                <span>Tài khoản hoạt động</span>
              </label>
            </div>
          </div>

          <div className="system-map-card">
            <div className="system-map-card__head">
              <div>
                <h3>Vị trí công ty trên bản đồ</h3>
                <p>Tìm kiếm địa điểm hoặc bấm trực tiếp lên bản đồ để ghim vị trí công ty.</p>
              </div>
              {hasMapLocation(companyForm) && (
                <a
                  className="system-map-card__link"
                  href={buildMapExternalUrl(companyForm.map_lat, companyForm.map_lng)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <BsPinMapFill />
                  <span>Mở bản đồ lớn</span>
                </a>
              )}
            </div>

            <div className="system-map-search">
              <div className="system-map-search__input">
                <BsSearch />
                <input
                  value={mapSearchQuery}
                  onChange={(event) => setMapSearchQuery(event.target.value)}
                  placeholder="Tìm tên đường, quận, thành phố..."
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleSearchMap();
                    }
                  }}
                />
              </div>
              <button type="button" className="admin-secondary-btn" onClick={handleSearchMap}>
                <BsSearch />
                <span>{isMapSearching ? "Đang tìm..." : "Tìm"}</span>
              </button>
              <button type="button" className="admin-danger-btn" onClick={handleClearMapLocation}>
                <BsTrashFill />
                <span>Xóa vị trí</span>
              </button>
            </div>

            <div className="system-map-search">
              <div className="system-map-search__input">
                <BsPinMapFill />
                <input
                  value={sharedMapUrl}
                  onChange={(event) => setSharedMapUrl(event.target.value)}
                  placeholder="Dán link chia sẻ Google Maps, ví dụ https://maps.app.goo.gl/..."
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
                className="admin-secondary-btn"
                onClick={handleResolveSharedMapUrl}
                disabled={isResolvingSharedMapUrl}
              >
                <BsPinMapFill />
                <span>{isResolvingSharedMapUrl ? "Đang đọc link..." : "Dùng link Google Maps"}</span>
              </button>
              <button
                type="button"
                className="admin-primary-btn"
                onClick={handleUseCurrentLocation}
                disabled={isLocatingCurrentPosition}
              >
                <BsFillGeoAltFill />
                <span>{isLocatingCurrentPosition ? "Đang lấy GPS..." : "Dùng vị trí hiện tại"}</span>
              </button>
            </div>

            {mapSearchResults.length > 0 && (
              <div className="system-map-results">
                {mapSearchResults.map((result) => (
                  <button
                    key={`${result.place_id}_${result.lat}_${result.lon}`}
                    type="button"
                    className="system-map-result"
                    onClick={() => handleSelectMapResult(result)}
                  >
                    <BsFillGeoAltFill />
                    <span>{result.display_name}</span>
                  </button>
                ))}
              </div>
            )}

            <div ref={mapNodeRef} className="system-map-canvas" />

            <div className="system-map-meta">
              <div className="system-map-meta__card">
                <div className="system-map-meta__label">Địa chỉ hiển thị</div>
                <div className="system-map-meta__value">
                  {companyForm.address || (isResolvingAddress ? "Đang lấy địa chỉ..." : "Chưa chọn vị trí")}
                </div>
              </div>
              <div className="system-map-meta__card">
                <div className="system-map-meta__label">Tọa độ</div>
                <div className="system-map-meta__value">
                  {formatCoordinates(companyForm.map_lat, companyForm.map_lng)}
                </div>
              </div>
            </div>

            {mapError && <div className="system-map-error">{mapError}</div>}
          </div>

          <div className="system-asset-grid">
            <div className="system-asset-card">
              <div className="system-asset-card__preview">
                <AppImage src={logoPreview || selectedCompany?.logo} fallbackVariant="logo" alt="Company logo" />
              </div>
              <label className="admin-secondary-btn">
                <BsPencilSquare />
                <span>Chọn logo</span>
                <input type="file" accept="image/*" hidden onChange={(event) => handleChooseAsset(event, "logo")} />
              </label>
            </div>

            <div className="system-asset-card">
              <div className="system-asset-card__preview system-asset-card__preview--cover">
                <AppImage src={coverPreview || selectedCompany?.image} fallbackVariant="cover" alt="Company cover" />
              </div>
              <label className="admin-secondary-btn">
                <BsImageFill />
                <span>Chọn ảnh nền</span>
                <input type="file" accept="image/*" hidden onChange={(event) => handleChooseAsset(event, "cover")} />
              </label>
            </div>
          </div>

          <button type="button" className="admin-primary-btn" onClick={handleSaveCompany}>
            <BsCheckCircleFill />
            <span>{selectedCompanyId ? "Lưu thay đổi công ty" : "Tạo công ty"}</span>
            {savingSection === "company" && <span className="spinner-border spinner-border-sm ms-2" />}
          </button>
        </article>

        <article className="system-panel">
          <div className="system-panel__head">
            <div>
              <h2>Bảo mật tài khoản</h2>
              <p>Đổi mật khẩu nhanh cho user đang chọn trong bảng người dùng.</p>
            </div>
          </div>

          <div className="system-security-card">
            <div className="system-security-card__row">
              <div className="system-security-card__label">Tài khoản chọn</div>
              <div className="system-security-card__value">
                {selectedUser ? selectedUser.email : "Chưa chọn tài khoản"}
              </div>
            </div>
            <div className="system-security-card__row">
              <div className="system-security-card__label">Nhóm quyền</div>
              <div className="system-security-card__value">
                {selectedUser
                  ? selectedUser.role === 0
                    ? "Quản trị hệ thống"
                    : selectedUser.role === 1
                    ? "Ứng viên"
                    : "Nhà tuyển dụng"
                  : "-"}
              </div>
            </div>
            <label className="system-security-card__field">
              <span>Mật khẩu mới</span>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Nhập mật khẩu mới"
              />
            </label>
            <button type="button" className="admin-primary-btn" onClick={handleUpdatePassword}>
              <BsKeyFill />
              <span>Cập nhật mật khẩu</span>
              {savingSection === "password" && <span className="spinner-border spinner-border-sm ms-2" />}
            </button>
          </div>
        </article>
      </section>

      <section className="system-admin-data-grid">
        <article className="system-panel">
          <div className="system-panel__head">
            <div>
              <h2>Quản lý người dùng</h2>
              <p>Khóa, mở khóa, chọn đổi mật khẩu hoặc xóa cứng tài khoản.</p>
            </div>
          </div>

          <div className="system-table-wrapper">
            <table className="system-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Hiển thị</th>
                  <th>Role</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.email}</td>
                    <td>{user.display_name || "-"}</td>
                    <td>
                      <span className={`system-badge system-badge--role-${user.role}`}>
                        {user.role === 0 ? "Admin" : user.role === 1 ? "Candidate" : "Employer"}
                      </span>
                    </td>
                    <td>
                      <span className={`system-badge ${user.is_active ? "is-active" : "is-locked"}`}>
                        {user.is_active ? "Hoạt động" : "Đang khóa"}
                      </span>
                    </td>
                    <td>
                      <div className="system-row-actions">
                        <button type="button" onClick={() => setSelectedUser(user)}>
                          <BsKeyFill />
                        </button>
                        <button type="button" onClick={() => handleToggleUser(user)}>
                          {user.is_active ? <BsLockFill /> : <BsArrowRepeat />}
                        </button>
                        <button type="button" className="is-danger" onClick={() => handleDeleteUser(user)}>
                          <BsTrashFill />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="system-panel">
          <div className="system-panel__head">
            <div>
              <h2>Quản lý công ty</h2>
              <p>Chọn một công ty để chỉnh, hoặc xóa toàn bộ doanh nghiệp và dữ liệu liên quan.</p>
            </div>
          </div>

          <div className="system-company-list">
            {dashboard.companies.map((company) => (
              <div key={company.id} className="system-company-card">
                <div className="system-company-card__media">
                  <div className="system-company-card__logo">
                    <AppImage src={company.logo} fallbackVariant="logo" alt={company.name} />
                  </div>
                  <div>
                    <div className="system-company-card__name">{company.name}</div>
                    <div className="system-company-card__meta">{company.account_email}</div>
                    <div className="system-company-card__meta">
                      {company.jobs_count} tin, {company.applications_count} hồ sơ
                    </div>
                  </div>
                </div>
                <div className="system-company-card__actions">
                  <button type="button" className="admin-secondary-btn" onClick={() => hydrateCompanyForm(company)}>
                    <BsPencilSquare />
                    <span>Chỉnh</span>
                  </button>
                  <button
                    type="button"
                    className="admin-danger-btn"
                    onClick={() => handleDeleteCompany(company)}
                  >
                    <BsTrashFill />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}




