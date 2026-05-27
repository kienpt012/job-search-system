import { useEffect, useMemo, useState } from "react";
import {
  BsKey,
  BsPencilSquare,
  BsPeople,
  BsPersonPlus,
  BsShieldLock,
  BsShieldCheck,
  BsTrash,
  BsXCircle,
} from "react-icons/bs";
import { toast } from "react-toastify";
import employerApi from "../../../api/employer";
import "./company.css";

const roleLabels = {
  company_owner: "Tổng công ty",
  branch_manager: "Quản lý chi nhánh",
  branch_hr: "HR chi nhánh",
};

const emptyForm = {
  email: "",
  password: "",
  name: "",
  phone: "",
  title: "",
  role: "branch_hr",
  branch_id: "",
  status: "active",
};

export default function MemberManagement() {
  const [members, setMembers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const canCreate = Boolean(permissions.create_members);
  const canUpdate = Boolean(permissions.update_members);
  const canLock = Boolean(permissions.lock_members);
  const canUnlock = Boolean(permissions.unlock_members);
  const canUseForm = editingId ? canUpdate : canCreate;

  const roleOptions = useMemo(
    () => (permissions.manage_company_members ? ["branch_manager", "branch_hr"] : ["branch_hr"]),
    [permissions.manage_company_members]
  );

  const loadData = async () => {
    const [memberRes, branchRes] = await Promise.all([
      employerApi.getMembers(),
      employerApi.getBranches(),
    ]);
    const branchList = branchRes?.data || [];

    setMembers(memberRes?.data || []);
    setPermissions(memberRes?.permissions || {});
    setBranches(branchList);
    setForm((current) => ({
      ...current,
      branch_id: current.branch_id || (branchList[0]?.id ? String(branchList[0].id) : ""),
    }));
  };

  useEffect(() => {
    loadData().catch(() => toast.error("Không thể tải danh sách tài khoản."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setTemporaryPassword("");
    setForm({ ...emptyForm, branch_id: branches[0]?.id ? String(branches[0].id) : "" });
  };

  const editMember = (member) => {
    setEditingId(member.id);
    setTemporaryPassword("");
    setForm({
      email: member.user?.email || "",
      password: "",
      name: member.name || "",
      phone: member.phone || "",
      title: member.title || "",
      role: member.role || "branch_hr",
      branch_id: member.branch_id ? String(member.branch_id) : "",
      status: member.status || "active",
    });
  };

  const buildPayload = () => {
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    if (editingId) {
      delete payload.email;
    }
    return payload;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!canUseForm) return;

    setIsSaving(true);
    setTemporaryPassword("");
    try {
      const payload = buildPayload();
      if (editingId) {
        await employerApi.updateMember(editingId, payload);
        toast.success("Đã cập nhật tài khoản.");
      } else {
        const res = await employerApi.createMember(payload);
        if (res?.temporary_password) {
          setTemporaryPassword(res.temporary_password);
        }
        toast.success("Đã tạo tài khoản.");
      }
      resetForm();
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể lưu tài khoản. Kiểm tra thanh toán và quyền truy cập.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateStatus = async (member, status) => {
    const actionLabel = status === "active" ? "mở khóa" : "khóa";
    if (!window.confirm(`Bạn muốn ${actionLabel} tài khoản "${member.user?.email}"?`)) return;

    try {
      await employerApi.updateMember(member.id, { status, is_active: status === "active" });
      toast.success(status === "active" ? "Đã mở khóa tài khoản." : "Đã khóa tài khoản.");
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể cập nhật trạng thái tài khoản.");
    }
  };

  const deleteMember = async (member) => {
    if (member.role === "company_owner") return;
    if (!window.confirm(`Xóa tài khoản "${member.user?.email}"?`)) return;

    try {
      await employerApi.deleteMember(member.id);
      toast.success("Đã xóa tài khoản.");
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể xóa tài khoản.");
    }
  };

  return (
    <div className="company-admin-page">
      <section className="company-admin-hero">
        <div>
          <div className="company-admin-kicker">Phân quyền nhân sự</div>
          <h1>Tài khoản HR chi nhánh</h1>
          <p>
            Cấp tài khoản cho quản lý chi nhánh và HR. Mỗi người chỉ thao tác trong phạm vi
            chi nhánh hoặc công ty được phân quyền.
          </p>
        </div>
        <div className="company-admin-stat">
          <strong>{members.length}</strong>
          <span>tài khoản</span>
        </div>
      </section>

      <section className="company-admin-grid">
        {(canCreate || editingId) && (
          <form className="company-admin-panel" onSubmit={submit}>
            <div className="company-admin-panel__head">
              <div>
                <h2>{editingId ? "Sửa tài khoản" : "Tạo tài khoản"}</h2>
                <p>
                  {canUseForm
                    ? "Mật khẩu có thể để trống để hệ thống tự tạo khi thêm mới."
                    : "Bạn không có quyền chỉnh sửa tài khoản này."}
                </p>
              </div>
              {editingId && (
                <button type="button" className="company-secondary-btn" onClick={resetForm}>
                  <BsXCircle />
                  Hủy
                </button>
              )}
            </div>
            <div className="company-form-grid">
              <label>
                <span>Email đăng nhập</span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required={!editingId}
                  disabled={!canUseForm || Boolean(editingId)}
                />
              </label>
              <label>
                <span>Mật khẩu</span>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  disabled={!canUseForm}
                  placeholder={editingId ? "Để trống nếu không đổi" : "Để trống để tự tạo"}
                />
              </label>
              <label>
                <span>Họ tên</span>
                <input name="name" value={form.name} onChange={handleChange} required disabled={!canUseForm} />
              </label>
              <label>
                <span>Số điện thoại</span>
                <input name="phone" value={form.phone} onChange={handleChange} disabled={!canUseForm} />
              </label>
              <label>
                <span>Chức danh</span>
                <input name="title" value={form.title} onChange={handleChange} disabled={!canUseForm} />
              </label>
              <label>
                <span>Vai trò</span>
                <select name="role" value={form.role} onChange={handleChange} disabled={!canUseForm}>
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {roleLabels[role]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Chi nhánh</span>
                <select name="branch_id" value={form.branch_id} onChange={handleChange} required disabled={!canUseForm}>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Trạng thái</span>
                <select name="status" value={form.status} onChange={handleChange} disabled={!canUseForm}>
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Tạm khóa</option>
                </select>
              </label>
            </div>
            <button type="submit" className="company-primary-btn" disabled={!canUseForm || isSaving}>
              <BsPersonPlus />
              {isSaving ? "Đang lưu..." : editingId ? "Lưu tài khoản" : "Tạo tài khoản"}
            </button>
            {temporaryPassword && (
              <div className="company-password-note">
                <BsKey />
                Mật khẩu tạm: <strong>{temporaryPassword}</strong>
              </div>
            )}
          </form>
        )}

        <section className="company-admin-panel">
          <div className="company-admin-panel__head">
            <div>
              <h2>Danh sách tài khoản</h2>
              <p>Theo dõi vai trò, chi nhánh và trạng thái đăng nhập.</p>
            </div>
          </div>
          <div className="company-list">
            {members.map((member) => {
              const isActive = member.status === "active" && Boolean(member.user?.is_active);

              return (
                <article key={member.id} className="company-row">
                  <div>
                    <div className="company-row__title">
                      {member.name || member.user?.email}
                      <span>{roleLabels[member.role] || member.role}</span>
                    </div>
                    <div className="company-row__meta">
                      <BsPeople />
                      {member.branch?.name || "Toàn công ty"} · {isActive ? "Hoạt động" : "Tạm khóa"}
                    </div>
                    <div className="company-row__meta">{member.user?.email} · {member.phone || "Chưa có SĐT"}</div>
                  </div>
                  <div className="company-row__actions">
                    {member.role !== "company_owner" && canUpdate && (
                      <button type="button" onClick={() => editMember(member)} title="Sửa tài khoản">
                        <BsPencilSquare />
                      </button>
                    )}
                    {member.role !== "company_owner" && isActive && canLock && (
                      <button type="button" className="is-danger" onClick={() => updateStatus(member, "inactive")} title="Khóa tài khoản">
                        <BsShieldLock />
                      </button>
                    )}
                    {member.role !== "company_owner" && canLock && (
                      <button type="button" className="is-danger" onClick={() => deleteMember(member)} title="Xóa tài khoản">
                        <BsTrash />
                      </button>
                    )}
                    {member.role !== "company_owner" && !isActive && canUnlock && (
                      <button type="button" onClick={() => updateStatus(member, "active")} title="Mở khóa tài khoản">
                        <BsShieldCheck />
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
            {members.length === 0 && <div className="company-empty">Chưa có tài khoản HR.</div>}
          </div>
        </section>
      </section>
    </div>
  );
}
