import { useEffect, useState } from "react";
import { BsCheckCircle, BsGeoAlt, BsPencilSquare, BsTrash3, BsXCircle } from "react-icons/bs";
import { toast } from "react-toastify";
import employerApi from "../../../api/employer";
import BranchLocationPicker from "./BranchLocationPicker";
import "./company.css";

const emptyForm = {
  name: "",
  address: "",
  map_lat: "",
  map_lng: "",
  contact_name: "",
  phone: "",
  email: "",
  is_active: true,
};

export default function BranchManagement() {
  const [branches, setBranches] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadBranches = async () => {
    const res = await employerApi.getBranches();
    setBranches(res?.data || []);
    setPermissions(res?.permissions || {});
  };

  useEffect(() => {
    loadBranches().catch(() => toast.error("Không thể tải danh sách chi nhánh."));
  }, []);

  const canCreate = Boolean(permissions.create_branches);
  const canUpdate = Boolean(permissions.update_branches || permissions.update_own_branch);
  const canDelete = Boolean(permissions.delete_branches);
  const canUseForm = editingId ? canUpdate : canCreate;
  const canShowForm = canCreate || Boolean(editingId);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const handleLocationChange = (nextLocation) => {
    setForm((current) => ({
      ...current,
      address: nextLocation.address ?? current.address,
      map_lat: nextLocation.map_lat ?? current.map_lat,
      map_lng: nextLocation.map_lng ?? current.map_lng,
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const editBranch = (branch) => {
    setEditingId(branch.id);
    setForm({
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

  const submit = async (event) => {
    event.preventDefault();
    if (!canUseForm) return;

    setIsSaving(true);
    try {
      const payload = {
        ...form,
        map_lat: form.map_lat === "" ? null : form.map_lat,
        map_lng: form.map_lng === "" ? null : form.map_lng,
      };
      if (editingId) {
        await employerApi.updateBranch(editingId, payload);
        toast.success("Đã cập nhật chi nhánh.");
      } else {
        await employerApi.createBranch(payload);
        toast.success("Đã tạo chi nhánh.");
      }
      resetForm();
      await loadBranches();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể lưu chi nhánh. Kiểm tra thanh toán và quyền truy cập.");
    } finally {
      setIsSaving(false);
    }
  };

  const deactivate = async (branch) => {
    if (!window.confirm(`Ngừng hoạt động chi nhánh "${branch.name}"?`)) return;
    try {
      await employerApi.deleteBranch(branch.id);
      toast.success("Đã ngừng hoạt động chi nhánh.");
      await loadBranches();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể ngừng hoạt động chi nhánh.");
    }
  };

  return (
    <div className="company-admin-page">
      <section className="company-admin-hero">
        <div>
          <div className="company-admin-kicker">Quản trị chi nhánh</div>
          <h1>Chi nhánh công ty</h1>
          <p>
            Mỗi chi nhánh có địa chỉ, vị trí bản đồ và thông tin liên hệ riêng để gắn vào tin
            tuyển dụng và phân quyền HR.
          </p>
        </div>
        <div className="company-admin-stat">
          <strong>{branches.length}</strong>
          <span>chi nhánh</span>
        </div>
      </section>

      <section className="company-admin-grid">
        {canShowForm && (
          <form className="company-admin-panel" onSubmit={submit}>
            <div className="company-admin-panel__head">
              <div>
                <h2>{editingId ? "Sửa chi nhánh" : "Tạo chi nhánh"}</h2>
                <p>
                  {canUseForm
                    ? "Chọn vị trí trực tiếp trên bản đồ, tìm địa chỉ hoặc dán link Google Maps."
                    : "Bạn chỉ có quyền xem chi nhánh được phân công."}
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
                <span>Tên chi nhánh</span>
                <input name="name" value={form.name} onChange={handleChange} required disabled={!canUseForm} />
              </label>
              <label>
                <span>Người liên hệ</span>
                <input name="contact_name" value={form.contact_name} onChange={handleChange} disabled={!canUseForm} />
              </label>
              <label>
                <span>Số điện thoại</span>
                <input name="phone" value={form.phone} onChange={handleChange} disabled={!canUseForm} />
              </label>
              <label>
                <span>Email chi nhánh</span>
                <input name="email" value={form.email} onChange={handleChange} disabled={!canUseForm} />
              </label>
              <label className="company-form-grid__full">
                <span>Địa chỉ</span>
                <textarea name="address" value={form.address} onChange={handleChange} required disabled={!canUseForm} />
              </label>
              <div className="company-form-grid__full">
                <span className="company-field-title">Bản đồ chi nhánh</span>
                <BranchLocationPicker value={form} onChange={handleLocationChange} disabled={!canUseForm} />
              </div>
              <label className="company-switch">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  disabled={!canUseForm}
                />
                <span>Đang hoạt động</span>
              </label>
            </div>

            <button type="submit" className="company-primary-btn" disabled={!canUseForm || isSaving}>
              <BsCheckCircle />
              {isSaving ? "Đang lưu..." : editingId ? "Lưu chi nhánh" : "Tạo chi nhánh"}
            </button>
          </form>
        )}

        <section className="company-admin-panel">
          <div className="company-admin-panel__head">
            <div>
              <h2>Danh sách chi nhánh</h2>
              <p>Tài khoản tổng công ty nhìn thấy toàn bộ, vai trò chi nhánh chỉ thấy phạm vi của mình.</p>
            </div>
          </div>
          <div className="company-list">
            {branches.map((branch) => (
              <article key={branch.id} className="company-row">
                <div>
                  <div className="company-row__title">
                    {branch.name}
                    {branch.is_headquarters && <span>Trụ sở chính</span>}
                  </div>
                  <div className="company-row__meta">
                    <BsGeoAlt />
                    {branch.address || "Chưa có địa chỉ"}
                  </div>
                  <div className="company-row__meta">
                    {branch.contact_name || "Chưa có người liên hệ"} · {branch.phone || "Chưa có SĐT"}
                  </div>
                  <div className="company-row__meta">
                    {branch.map_lat && branch.map_lng
                      ? `${Number(branch.map_lat).toFixed(6)}, ${Number(branch.map_lng).toFixed(6)}`
                      : "Chưa chọn tọa độ bản đồ"}
                  </div>
                </div>
                <div className="company-row__actions">
                  {canUpdate && (
                    <button type="button" onClick={() => editBranch(branch)} title="Sửa chi nhánh">
                      <BsPencilSquare />
                    </button>
                  )}
                  {!branch.is_headquarters && canDelete && (
                    <button type="button" className="is-danger" onClick={() => deactivate(branch)} title="Ngừng hoạt động">
                      <BsTrash3 />
                    </button>
                  )}
                </div>
              </article>
            ))}
            {branches.length === 0 && <div className="company-empty">Chưa có chi nhánh.</div>}
          </div>
        </section>
      </section>
    </div>
  );
}
