import "./admin.css";
import { useEffect, useState } from "react";
import { BsPencilFill, BsPlusCircleFill, BsSearch, BsTrashFill } from "react-icons/bs";
import { toast } from "react-toastify";
import adminApi from "../../api/admin";

export default function AdminSkills() {
  const [skills, setSkills] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(null);

  const loadSkills = async () => {
    try {
      setSkills(await adminApi.getSkills());
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể tải thư viện kỹ năng.");
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const filteredSkills = skills.filter((skill) =>
    skill.name.toLowerCase().includes(keyword.toLowerCase())
  );

  const resetForm = () => {
    setName("");
    setEditing(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextName = name.trim();
    if (!nextName) {
      toast.error("Vui lòng nhập tên kỹ năng.");
      return;
    }

    try {
      if (editing) {
        await adminApi.updateSkill(editing.id, { name: nextName });
        toast.success("Đã cập nhật kỹ năng.");
      } else {
        await adminApi.createSkill({ name: nextName });
        toast.success("Đã thêm kỹ năng.");
      }
      resetForm();
      await loadSkills();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể lưu kỹ năng.");
    }
  };

  const handleDelete = async (skill) => {
    if (!window.confirm(`Xóa kỹ năng "${skill.name}"?`)) {
      return;
    }

    try {
      await adminApi.deleteSkill(skill.id);
      toast.success("Đã xóa kỹ năng.");
      await loadSkills();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể xóa kỹ năng.");
    }
  };

  return (
    <div className="system-admin-dashboard">
      <section className="system-admin-hero">
        <div>
          <div className="system-admin-kicker">Skill library</div>
          <h1>Quản lý thư viện kỹ năng</h1>
          <p>
            Các thẻ kỹ năng này được ứng viên chọn trong hồ sơ và nhà tuyển dụng chọn khi
            tạo việc làm để hệ thống đề xuất ứng viên phù hợp.
          </p>
        </div>
        <div className="system-admin-hero__meta">
          <div className="system-admin-chip">
            <BsPlusCircleFill />
            <span>{skills.length} kỹ năng</span>
          </div>
        </div>
      </section>

      <section className="system-panel">
        <div className="system-panel__head">
          <div>
            <h2>{editing ? "Cập nhật kỹ năng" : "Thêm kỹ năng mới"}</h2>
            <p>Giữ tên kỹ năng ngắn gọn để ứng viên và nhà tuyển dụng chọn nhanh.</p>
          </div>
        </div>

        <form className="system-jobs-filter" onSubmit={handleSubmit}>
          <label>
            <span>Tên kỹ năng</span>
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <div className="system-jobs-filter__actions">
            <button type="submit" className="admin-primary-btn">
              <BsPlusCircleFill />
              <span>{editing ? "Cập nhật" : "Thêm"}</span>
            </button>
            {editing && (
              <button type="button" className="admin-secondary-btn" onClick={resetForm}>
                Hủy
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="system-panel">
        <div className="system-panel__head">
          <div>
            <h2>Danh sách kỹ năng</h2>
            <p>Tìm kiếm, sửa hoặc xóa các thẻ trong thư viện.</p>
          </div>
          <div className="system-search-field">
            <BsSearch />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm kỹ năng"
            />
          </div>
        </div>

        <div className="system-table-wrapper">
          <table className="system-table">
            <thead>
              <tr>
                <th>Kỹ năng</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredSkills.map((skill) => (
                <tr key={skill.id}>
                  <td>{skill.name}</td>
                  <td>
                    <div className="system-row-actions">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(skill);
                          setName(skill.name);
                        }}
                      >
                        <BsPencilFill />
                      </button>
                      <button
                        type="button"
                        className="is-danger"
                        onClick={() => handleDelete(skill)}
                      >
                        <BsTrashFill />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSkills.length === 0 && (
          <div className="system-empty-state">Không có kỹ năng nào phù hợp.</div>
        )}
      </section>
    </div>
  );
}
