import { useEffect } from "react";
import { useForm } from "react-hook-form";
import jobApi from "../../../api/job";

const toArray = (value) => {
  if (value === undefined || value === null || value === "") return [];
  return (Array.isArray(value) ? value : [value]).filter(Boolean);
};

const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === "") return null;
  return Number(value);
};

const skillIdsByType = (job, type) =>
  (job?.skills || [])
    .filter((skill) => {
      const pivotType = skill.pivot?.requirement_type || "required";
      return type === "required" ? pivotType !== "preferred" : pivotType === "preferred";
    })
    .map((skill) => String(skill.id));

const buildJobPayload = (form) => {
  const payload = {
    jname: form.jname?.trim(),
    branch_id: Number(form.branch_id),
    jtype_id: Number(form.jtype_id),
    jlevel_id: Number(form.jlevel_id),
    industries: toArray(form.industries).map(Number),
    required_skills: toArray(form.required_skills).map(Number),
    preferred_skills: toArray(form.preferred_skills).map(Number),
    work_location_type: form.work_location_type || "onsite",
    amount: toNumberOrNull(form.amount),
    min_salary: form.salaryOpt === "fixed" ? toNumberOrNull(form.min_salary) : null,
    max_salary: form.salaryOpt === "fixed" ? toNumberOrNull(form.max_salary) : null,
    yoe: toNumberOrNull(form.yoe),
    education_level: form.education_level || null,
    required_languages: form.required_languages || null,
    required_certificates: form.required_certificates || null,
    description: form.description || "",
    requirements: form.requirements || null,
    benefits: form.benefits || null,
    expire_at: form.expire_at,
    status: form.status || "active",
  };

  if (payload.work_location_type === "special") {
    payload.special_address = form.special_address?.trim() || "";
    payload.map_lat = toNumberOrNull(form.map_lat);
    payload.map_lng = toNumberOrNull(form.map_lng);
  }

  return payload;
};

function JobDetail({ inf, jtypes, jlevels, industries, skills, branches, canEdit = true }) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const locationType = watch("work_location_type") || "onsite";
  const salaryOpt = watch("salaryOpt") || "negotiable";
  const selectedBranch = branches.find((branch) => String(branch.id) === String(watch("branch_id")));

  useEffect(() => {
    if (!inf?.id) return;

    reset({
      jname: inf.jname || "",
      branch_id: inf.branch_id ? String(inf.branch_id) : "",
      jtype_id: inf.jtype_id ? String(inf.jtype_id) : "",
      jlevel_id: inf.jlevel_id ? String(inf.jlevel_id) : "",
      industries: (inf.industries || []).map((industry) => String(industry.id)),
      required_skills: skillIdsByType(inf, "required"),
      preferred_skills: skillIdsByType(inf, "preferred"),
      work_location_type: inf.work_location_type || "onsite",
      special_address: inf.special_address || "",
      map_lat: inf.map_lat || "",
      map_lng: inf.map_lng || "",
      amount: inf.amount || "",
      salaryOpt: inf.min_salary ? "fixed" : "negotiable",
      min_salary: inf.min_salary || "",
      max_salary: inf.max_salary || "",
      yoe: inf.yoe || "",
      education_level: inf.education_level || "",
      required_languages: inf.required_languages || "",
      required_certificates: inf.required_certificates || "",
      description: inf.description || "",
      requirements: inf.requirements || "",
      benefits: inf.benefits || "",
      expire_at: inf.expire_at || "",
      status: inf.status || (inf.is_active ? "active" : "paused"),
    });
  }, [inf, reset]);

  const onSubmit = async (form) => {
    if (!canEdit) return;

    try {
      await jobApi.update(inf.id, buildJobPayload(form));
      alert("Cập nhật tin tuyển dụng thành công.");
      window.location.reload();
    } catch (error) {
      alert(error?.response?.data?.message || "Không thể cập nhật tin tuyển dụng.");
    }
  };

  return (
    <div className="modal modal-xl fade" id="jobDetail">
      <div className="modal-dialog modal-fullscreen-md-down modal-dialog-scrollable">
        <div className="modal-content job-editor-modal">
          <div className="modal-header">
            <div>
              <div className="job-editor-eyebrow">Chi tiết tin tuyển dụng</div>
              <h5 className="mb-0">{inf?.jname || "Tin tuyển dụng"}</h5>
            </div>
            <button type="button" className="btn btn-sm btn-close" data-bs-dismiss="modal" />
          </div>
          <div className="modal-body text-start">
            {!inf?.id ? (
              <div className="job-empty-state">Chọn một tin tuyển dụng để xem chi tiết.</div>
            ) : (
              <form className="job-editor-form" onSubmit={handleSubmit(onSubmit)}>
                {!canEdit && (
                  <div className="job-billing-lock">
                    Bạn chỉ có quyền xem chi tiết tin tuyển dụng này.
                  </div>
                )}
                <fieldset className="job-editor-fieldset" disabled={!canEdit}>
                <section className="job-editor-section">
                  <div>
                    <h3>Thông tin chính</h3>
                    <p>Job được gắn với chi nhánh hoặc một địa điểm hợp lệ cho trường hợp đặc biệt.</p>
                  </div>
                  <div className="job-editor-grid">
                    <label className="job-field job-field--wide">
                      <span>Chức danh</span>
                      <input {...register("jname", { required: true, maxLength: 150 })} />
                      {errors.jname && <small>Vui lòng nhập chức danh.</small>}
                    </label>
                    <label className="job-field">
                      <span>Chi nhánh phụ trách</span>
                      <select {...register("branch_id", { required: true })}>
                        {branches.map((branch) => (
                          <option key={branch.id} value={branch.id}>
                            {branch.name}
                          </option>
                        ))}
                      </select>
                      {selectedBranch?.address && <em>{selectedBranch.address}</em>}
                    </label>
                    <label className="job-field">
                      <span>Hình thức làm việc</span>
                      <select {...register("work_location_type")}>
                        <option value="onsite">Làm tại chi nhánh</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="remote">Remote</option>
                        <option value="special">Địa điểm riêng</option>
                      </select>
                    </label>
                    {locationType === "special" && (
                      <>
                        <label className="job-field job-field--wide">
                          <span>Địa điểm riêng</span>
                          <input {...register("special_address", { required: true })} />
                        </label>
                        <label className="job-field">
                          <span>Vĩ độ</span>
                          <input type="number" step="0.000001" {...register("map_lat")} />
                        </label>
                        <label className="job-field">
                          <span>Kinh độ</span>
                          <input type="number" step="0.000001" {...register("map_lng")} />
                        </label>
                      </>
                    )}
                    <label className="job-field">
                      <span>Ngành nghề</span>
                      <select multiple size="5" {...register("industries", { required: true })}>
                        {industries.map((industry) => (
                          <option key={industry.id} value={industry.id}>
                            {industry.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="job-field">
                      <span>Hình thức tuyển dụng</span>
                      <select {...register("jtype_id", { required: true })}>
                        <option value="">Chọn hình thức</option>
                        {jtypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="job-field">
                      <span>Cấp bậc</span>
                      <select {...register("jlevel_id", { required: true })}>
                        <option value="">Chọn cấp bậc</option>
                        {jlevels.map((level) => (
                          <option key={level.id} value={level.id}>
                            {level.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="job-field">
                      <span>Số lượng tuyển</span>
                      <input type="number" min="1" {...register("amount")} />
                    </label>
                    <label className="job-field">
                      <span>Deadline</span>
                      <input type="date" {...register("expire_at", { required: true })} />
                    </label>
                    <label className="job-field">
                      <span>Trạng thái</span>
                      <select {...register("status")}>
                        <option value="active">Đang đăng</option>
                        <option value="draft">Nháp</option>
                        <option value="paused">Tạm dừng</option>
                        <option value="closed">Đã đóng</option>
                      </select>
                    </label>
                  </div>
                </section>

                <section className="job-editor-section">
                  <div>
                    <h3>Tiêu chí matching</h3>
                    <p>Các trường này được dùng để chấm điểm và giải thích lý do phù hợp.</p>
                  </div>
                  <div className="job-editor-grid">
                    <label className="job-field">
                      <span>Kỹ năng bắt buộc</span>
                      <select multiple size="7" {...register("required_skills", { required: true })}>
                        {skills.map((skill) => (
                          <option key={skill.id} value={skill.id}>
                            {skill.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="job-field">
                      <span>Kỹ năng ưu tiên</span>
                      <select multiple size="7" {...register("preferred_skills")}>
                        {skills.map((skill) => (
                          <option key={skill.id} value={skill.id}>
                            {skill.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="job-field">
                      <span>Kinh nghiệm tối thiểu</span>
                      <select {...register("yoe")}>
                        <option value="">Không bắt buộc</option>
                        {Array.from({ length: 20 }, (_, index) => (
                          <option value={index + 1} key={index + 1}>
                            {index + 1} năm
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="job-field">
                      <span>Học vấn</span>
                      <input {...register("education_level")} />
                    </label>
                    <label className="job-field">
                      <span>Ngôn ngữ</span>
                      <input {...register("required_languages")} />
                    </label>
                    <label className="job-field">
                      <span>Chứng chỉ</span>
                      <input {...register("required_certificates")} />
                    </label>
                    <div className="job-field job-field--wide">
                      <span>Lương</span>
                      <div className="job-segment">
                        <label>
                          <input type="radio" value="negotiable" {...register("salaryOpt")} />
                          Thỏa thuận
                        </label>
                        <label>
                          <input type="radio" value="fixed" {...register("salaryOpt")} />
                          Khoảng lương
                        </label>
                      </div>
                      {salaryOpt === "fixed" && (
                        <div className="job-inline-inputs">
                          <input type="number" min="0" placeholder="Từ" {...register("min_salary")} />
                          <input type="number" min="0" placeholder="Đến" {...register("max_salary")} />
                          <span>triệu VND</span>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section className="job-editor-section">
                  <div>
                    <h3>Nội dung hiển thị</h3>
                    <p>Nội dung càng rõ thì ứng viên càng ít ứng tuyển sai.</p>
                  </div>
                  <div className="job-editor-grid">
                    <label className="job-field job-field--wide">
                      <span>Mô tả công việc</span>
                      <textarea rows="8" {...register("description", { required: true })} />
                    </label>
                    <label className="job-field job-field--wide">
                      <span>Yêu cầu ứng viên</span>
                      <textarea rows="6" {...register("requirements")} />
                    </label>
                    <label className="job-field job-field--wide">
                      <span>Quyền lợi</span>
                      <textarea rows="6" {...register("benefits")} />
                    </label>
                  </div>
                </section>

                </fieldset>

                <div className="job-editor-actions">
                  <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">
                    Đóng
                  </button>
                  {canEdit && (
                  <button type="submit" className="btn app-button-primary">
                    Cập nhật
                  </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetail;
