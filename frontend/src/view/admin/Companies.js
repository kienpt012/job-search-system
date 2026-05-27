import "./admin.css";
import { useEffect, useMemo, useState } from "react";
import {
  BsArrowRepeat,
  BsBoxArrowInRight,
  BsBuildingsFill,
  BsCheckCircleFill,
  BsGeoAltFill,
  BsPeopleFill,
  BsPlusCircleFill,
  BsShieldLockFill,
  BsTrashFill,
} from "react-icons/bs";
import { toast } from "react-toastify";
import adminApi from "../../api/admin";

const emptyBranch = {
  name: "",
  address: "",
  map_lat: "",
  map_lng: "",
  contact_name: "",
  phone: "",
  email: "",
  is_active: true,
};

const emptyMember = {
  email: "",
  password: "",
  name: "",
  phone: "",
  title: "",
  role: "branch_hr",
  branch_id: "",
  status: "active",
};

const roleLabels = {
  company_owner: "Tổng công ty",
  branch_manager: "Quản lý chi nhánh",
  branch_hr: "HR chi nhánh",
};

const normalizeList = (response) =>
  Array.isArray(response) ? response : response?.data || [];

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [branches, setBranches] = useState([]);
  const [members, setMembers] = useState([]);
  const [branchForm, setBranchForm] = useState(emptyBranch);
  const [memberForm, setMemberForm] = useState(emptyMember);
  const [editingBranchId, setEditingBranchId] = useState(null);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [sharedMapUrl, setSharedMapUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState("");

  const selectedCompany = useMemo(
    () => companies.find((item) => String(item.id) === String(selectedCompanyId)),
    [companies, selectedCompanyId]
  );

  const loadCompanies = async () => {
    const dashboard = await adminApi.getDashboard();
    const nextCompanies = dashboard.companies || [];
    setCompanies(nextCompanies);
    if (!selectedCompanyId && nextCompanies[0]?.id) {
      setSelectedCompanyId(String(nextCompanies[0].id));
    }
  };

  const loadCompanyScope = async (companyId = selectedCompanyId) => {
    if (!companyId) return;
    setLoading(true);
    try {
      const [branchResponse, memberResponse] = await Promise.all([
        adminApi.getCompanyBranches(companyId),
        adminApi.getCompanyMembers(companyId),
      ]);
      const nextBranches = normalizeList(branchResponse);
      setBranches(nextBranches);
      setMembers(normalizeList(memberResponse));
      setBranchForm(emptyBranch);
      setMemberForm({
        ...emptyMember,
        branch_id: nextBranches.find((branch) => !branch.is_headquarters)?.id || nextBranches[0]?.id || "",
      });
      setEditingBranchId(null);
      setEditingMemberId(null);
      setTemporaryPassword("");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể tải dữ liệu công ty.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies().catch(() => toast.error("Không thể tải danh sách công ty."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      loadCompanyScope(selectedCompanyId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompanyId]);

  const handleBranchChange = (event) => {
    const { name, value, type, checked } = event.target;
    setBranchForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleMemberChange = (event) => {
    const { name, value } = event.target;
    setMemberForm((current) => ({ ...current, [name]: value }));
  };

  const editBranch = (branch) => {
    setEditingBranchId(branch.id);
    setBranchForm({
      name: branch.name || "",
      address: branch.address || "",
      map_lat: branch.map_lat ?? "",
      map_lng: branch.map_lng ?? "",
      contact_name: branch.contact_name || "",
      phone: branch.phone || "",
      email: branch.email || "",
      is_active: Boolean(branch.is_active),
    });
  };

  const editMember = (member) => {
    setEditingMemberId(member.id);
    setTemporaryPassword("");
    setMemberForm({
      email: member.user?.email || "",
      password: "",
      name: member.name || "",
      phone: member.phone || "",
      title: member.title || "",
      role: member.role === "company_owner" ? "branch_manager" : member.role || "branch_hr",
      branch_id: member.branch_id || branches[0]?.id || "",
      status: member.status || "active",
    });
  };

  const resetBranchForm = () => {
    setEditingBranchId(null);
    setSharedMapUrl("");
    setBranchForm(emptyBranch);
  };

  const resetMemberForm = () => {
    setEditingMemberId(null);
    setTemporaryPassword("");
    setMemberForm({
      ...emptyMember,
      branch_id: branches.find((branch) => !branch.is_headquarters)?.id || branches[0]?.id || "",
    });
  };

  const resolveBranchMap = async () => {
    if (!sharedMapUrl.trim()) {
      toast.info("Hãy dán link Google Maps cần lấy tọa độ.");
      return;
    }

    setSaving("map");
    try {
      const response = await adminApi.resolveSharedMapLink({ url: sharedMapUrl.trim() });
      setBranchForm((current) => ({
        ...current,
        map_lat: response.lat ?? "",
        map_lng: response.lng ?? "",
      }));
      toast.success("Đã lấy tọa độ từ Google Maps.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không đọc được tọa độ từ link Google Maps.");
    } finally {
      setSaving("");
    }
  };

  const submitBranch = async (event) => {
    event.preventDefault();
    if (!selectedCompanyId) return;

    setSaving("branch");
    try {
      if (editingBranchId) {
        await adminApi.updateCompanyBranch(editingBranchId, branchForm);
        toast.success("Đã cập nhật chi nhánh.");
      } else {
        await adminApi.createCompanyBranch(selectedCompanyId, branchForm);
        toast.success("Đã tạo chi nhánh.");
      }
      resetBranchForm();
      await loadCompanyScope();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể lưu chi nhánh.");
    } finally {
      setSaving("");
    }
  };

  const submitMember = async (event) => {
    event.preventDefault();
    if (!selectedCompanyId) return;

    setSaving("member");
    setTemporaryPassword("");
    try {
      const payload = { ...memberForm };
      if (!payload.password) delete payload.password;
      if (editingMemberId) {
        delete payload.email;
        await adminApi.updateCompanyMember(editingMemberId, payload);
        toast.success("Đã cập nhật tài khoản.");
      } else {
        const response = await adminApi.createCompanyMember(selectedCompanyId, payload);
        if (response?.temporary_password) setTemporaryPassword(response.temporary_password);
        toast.success("Đã tạo tài khoản.");
      }
      resetMemberForm();
      await loadCompanyScope();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể lưu tài khoản.");
    } finally {
      setSaving("");
    }
  };

  const deleteBranch = async (branch) => {
    if (branch.is_headquarters) {
      toast.info("Không xóa trụ sở chính tại màn hình chi nhánh.");
      return;
    }

    const ok = window.confirm(
      `Xóa chi nhánh "${branch.name}"? Toàn bộ job, hồ sơ ứng tuyển, quản lý chi nhánh và HR bên dưới sẽ bị xóa.`
    );
    if (!ok) return;

    try {
      await adminApi.deleteCompanyBranch(branch.id);
      toast.success("Đã xóa chi nhánh và dữ liệu cấp dưới.");
      await loadCompanyScope();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể xóa chi nhánh.");
    }
  };

  const deleteMember = async (member) => {
    if (member.role === "company_owner") {
      toast.info("Muốn xóa tổng công ty, hãy xóa công ty ở bảng điều khiển admin.");
      return;
    }

    const ok = window.confirm(`Xóa tài khoản "${member.user?.email}" khỏi công ty?`);
    if (!ok) return;

    try {
      await adminApi.deleteCompanyMember(member.id);
      toast.success("Đã xóa tài khoản.");
      await loadCompanyScope();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể xóa tài khoản.");
    }
  };

  const impersonate = async (userId) => {
    try {
      const response = await adminApi.impersonateUser(userId);
      const token = response?.authorization?.token;
      const role = Number(response?.role);
      if (!token) throw new Error("Missing token");

      if (role === 0) {
        localStorage.setItem("admin_jwt", token);
        window.location.assign("/admin");
      } else if (role === 1) {
        localStorage.setItem("candidate_jwt", token);
        window.location.assign("/candidate");
      } else if (role === 2) {
        localStorage.setItem("employer_jwt", token);
        window.location.assign("/employer");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể đăng nhập thay tài khoản này.");
    }
  };

  return (
    <div className="system-admin-dashboard">
      <section className="system-admin-hero">
        <div>
          <div className="system-admin-kicker">Company governance</div>
          <h1>Quản trị công ty, chi nhánh và HR</h1>
          <p>
            Admin có toàn quyền quản lý tổng công ty, chi nhánh, quản lý chi nhánh,
            HR và có thể đăng nhập thay để kiểm tra đúng phạm vi nghiệp vụ.
          </p>
        </div>
        <div className="system-admin-hero__meta">
          <div className="system-admin-chip">
            <BsBuildingsFill />
            <span>{companies.length} công ty</span>
          </div>
          <div className="system-admin-chip">
            <BsPeopleFill />
            <span>{members.length} tài khoản trong công ty đang chọn</span>
          </div>
        </div>
      </section>

      <section className="system-panel">
        <div className="system-panel__head">
          <div>
            <h2>Chọn công ty</h2>
            <p>Chọn một công ty để quản lý toàn bộ chi nhánh và tài khoản cấp dưới.</p>
          </div>
          <button type="button" className="admin-secondary-btn" onClick={() => loadCompanyScope()}>
            <BsArrowRepeat />
            <span>Đồng bộ</span>
          </button>
        </div>
        <div className="system-jobs-filter">
          <label>
            <span>Công ty</span>
            <select value={selectedCompanyId} onChange={(event) => setSelectedCompanyId(event.target.value)}>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name} - {company.account_email}
                </option>
              ))}
            </select>
          </label>
          <div className="system-admin-chip">
            <BsCheckCircleFill />
            <span>{selectedCompany?.jobs_count || 0} job, {selectedCompany?.applications_count || 0} hồ sơ</span>
          </div>
        </div>
      </section>

      <section className="system-admin-two-column">
        <form className="system-panel" onSubmit={submitBranch}>
          <div className="system-panel__head">
            <div>
              <h2>{editingBranchId ? "Sửa chi nhánh" : "Thêm chi nhánh"}</h2>
              <p>Admin có thể tạo, sửa và xóa chi nhánh theo đúng cây dữ liệu công ty.</p>
            </div>
          </div>
          <div className="system-form-grid">
            <label>
              <span>Tên chi nhánh</span>
              <input name="name" value={branchForm.name} onChange={handleBranchChange} required />
            </label>
            <label>
              <span>Người liên hệ</span>
              <input name="contact_name" value={branchForm.contact_name} onChange={handleBranchChange} />
            </label>
            <label>
              <span>Số điện thoại</span>
              <input name="phone" value={branchForm.phone} onChange={handleBranchChange} />
            </label>
            <label>
              <span>Email chi nhánh</span>
              <input name="email" type="email" value={branchForm.email} onChange={handleBranchChange} />
            </label>
            <label className="system-form-grid__wide">
              <span>Địa chỉ</span>
              <input name="address" value={branchForm.address} onChange={handleBranchChange} />
            </label>
            <label>
              <span>Vĩ độ</span>
              <input name="map_lat" value={branchForm.map_lat} onChange={handleBranchChange} />
            </label>
            <label>
              <span>Kinh độ</span>
              <input name="map_lng" value={branchForm.map_lng} onChange={handleBranchChange} />
            </label>
            <label className="system-form-check">
              <input type="checkbox" name="is_active" checked={branchForm.is_active} onChange={handleBranchChange} />
              <span>Chi nhánh đang hoạt động</span>
            </label>
          </div>
          <div className="system-inline-actions">
            <input
              value={sharedMapUrl}
              onChange={(event) => setSharedMapUrl(event.target.value)}
              placeholder="Dán link Google Maps để lấy tọa độ"
            />
            <button type="button" className="admin-secondary-btn" onClick={resolveBranchMap} disabled={saving === "map"}>
              <BsGeoAltFill />
              <span>Lấy tọa độ</span>
            </button>
          </div>
          <div className="system-inline-actions">
            <button type="submit" className="admin-primary-btn" disabled={saving === "branch"}>
              <BsPlusCircleFill />
              <span>{editingBranchId ? "Lưu chi nhánh" : "Tạo chi nhánh"}</span>
            </button>
            {editingBranchId && (
              <button type="button" className="admin-secondary-btn" onClick={resetBranchForm}>
                Hủy
              </button>
            )}
          </div>
        </form>

        <form className="system-panel" onSubmit={submitMember}>
          <div className="system-panel__head">
            <div>
              <h2>{editingMemberId ? "Sửa nhân sự" : "Thêm HR/quản lý"}</h2>
              <p>Admin có thể tạo branch manager hoặc branch HR cho bất kỳ chi nhánh nào.</p>
            </div>
          </div>
          <div className="system-form-grid">
            <label>
              <span>Email đăng nhập</span>
              <input
                name="email"
                type="email"
                value={memberForm.email}
                onChange={handleMemberChange}
                required={!editingMemberId}
                disabled={Boolean(editingMemberId)}
              />
            </label>
            <label>
              <span>Mật khẩu</span>
              <input
                name="password"
                type="password"
                value={memberForm.password}
                onChange={handleMemberChange}
                placeholder="Để trống để tự tạo khi thêm mới"
              />
            </label>
            <label>
              <span>Họ tên</span>
              <input name="name" value={memberForm.name} onChange={handleMemberChange} required />
            </label>
            <label>
              <span>Số điện thoại</span>
              <input name="phone" value={memberForm.phone} onChange={handleMemberChange} />
            </label>
            <label>
              <span>Chức danh</span>
              <input name="title" value={memberForm.title} onChange={handleMemberChange} />
            </label>
            <label>
              <span>Vai trò</span>
              <select name="role" value={memberForm.role} onChange={handleMemberChange}>
                <option value="branch_manager">Quản lý chi nhánh</option>
                <option value="branch_hr">HR chi nhánh</option>
              </select>
            </label>
            <label>
              <span>Chi nhánh</span>
              <select name="branch_id" value={memberForm.branch_id} onChange={handleMemberChange} required>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Trạng thái</span>
              <select name="status" value={memberForm.status} onChange={handleMemberChange}>
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm khóa</option>
              </select>
            </label>
          </div>
          <div className="system-inline-actions">
            <button type="submit" className="admin-primary-btn" disabled={saving === "member"}>
              <BsPeopleFill />
              <span>{editingMemberId ? "Lưu tài khoản" : "Tạo tài khoản"}</span>
            </button>
            {editingMemberId && (
              <button type="button" className="admin-secondary-btn" onClick={resetMemberForm}>
                Hủy
              </button>
            )}
          </div>
          {temporaryPassword && (
            <div className="system-admin-note">
              Mật khẩu tạm: <strong>{temporaryPassword}</strong>
            </div>
          )}
        </form>
      </section>

      <section className="system-admin-two-column">
        <section className="system-panel">
          <div className="system-panel__head">
            <div>
              <h2>Chi nhánh</h2>
              <p>Xóa chi nhánh sẽ xóa toàn bộ job, hồ sơ ứng tuyển, HR và quản lý bên dưới.</p>
            </div>
          </div>
          {loading ? (
            <div className="system-empty-state">Đang tải chi nhánh...</div>
          ) : (
            <div className="system-compact-list">
              {branches.map((branch) => (
                <article className="system-compact-row" key={branch.id}>
                  <div>
                    <strong>{branch.name}</strong>
                    <span>{branch.address || "Chưa có địa chỉ"}</span>
                    <small>{branch.is_headquarters ? "Trụ sở chính" : branch.is_active ? "Đang hoạt động" : "Tạm khóa"}</small>
                  </div>
                  <div className="system-row-actions">
                    <button type="button" className="admin-secondary-btn" onClick={() => editBranch(branch)}>
                      Sửa
                    </button>
                    {!branch.is_headquarters && (
                      <button type="button" className="admin-danger-btn" onClick={() => deleteBranch(branch)}>
                        <BsTrashFill />
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="system-panel">
          <div className="system-panel__head">
            <div>
              <h2>Tài khoản công ty</h2>
              <p>Admin có thể đăng nhập thay, khóa/mở, sửa hoặc xóa nhân sự cấp dưới.</p>
            </div>
          </div>
          {loading ? (
            <div className="system-empty-state">Đang tải tài khoản...</div>
          ) : (
            <div className="system-compact-list">
              {members.map((member) => (
                <article className="system-compact-row" key={member.id}>
                  <div>
                    <strong>{member.name || member.user?.email}</strong>
                    <span>{member.user?.email}</span>
                    <small>
                      {roleLabels[member.role] || member.role} - {member.branch?.name || "Toàn công ty"} -{" "}
                      {member.status === "active" && member.user?.is_active ? "Hoạt động" : "Tạm khóa"}
                    </small>
                  </div>
                  <div className="system-row-actions">
                    {member.user_id && (
                      <button type="button" className="admin-primary-btn" onClick={() => impersonate(member.user_id)}>
                        <BsBoxArrowInRight />
                        <span>Login as</span>
                      </button>
                    )}
                    {member.role !== "company_owner" && (
                      <>
                        <button type="button" className="admin-secondary-btn" onClick={() => editMember(member)}>
                          Sửa
                        </button>
                        <button type="button" className="admin-danger-btn" onClick={() => deleteMember(member)}>
                          <BsTrashFill />
                        </button>
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      <section className="system-panel">
        <div className="system-panel__head">
          <div>
            <h2>Ghi chú quyền admin</h2>
            <p>
              Admin có toàn quyền hệ thống. Các thao tác xóa dùng cascade backend:
              công ty xóa toàn bộ chi nhánh, HR, job, hồ sơ ứng tuyển, thanh toán và dữ liệu con.
            </p>
          </div>
          <BsShieldLockFill />
        </div>
      </section>
    </div>
  );
}
