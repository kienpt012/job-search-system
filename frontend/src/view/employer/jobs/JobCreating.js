import { useForm } from "react-hook-form";
import { AiOutlineLine } from "react-icons/ai";
import jobApi from "../../../api/job";

function JobCreating({ jtypes, jlevels, industries, locations }) {
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm();

  const onSubmit = async (job_inf) => {
    // console.log(job_inf);
    for (let j = 0; j < job_inf.industries.length; j++) {
      job_inf.industries[j] = industries[job_inf.industries[j]].id;
    }
    for (let j = 0; j < job_inf.locations.length; j++) {
      job_inf.locations[j] = locations[job_inf.locations[j]].id;
    }
    delete job_inf.salaryOpt;
    if (job_inf.yoe === "") delete job_inf.yoe;
    if (job_inf.min_salary === "") delete job_inf.min_salary;
    if (job_inf.max_salary === "") delete job_inf.max_salary;
    console.log(job_inf);

    await jobApi.create(job_inf);
    alert("Tạo mới thành công!");
    window.location.reload();
  };

  return (
    <div className="modal modal-xl fade" id="jobCreating">
      <div className="modal-dialog modal-fullscreen-md-down modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="ms-2">Thêm việc làm mới</h5>
            <button
              type="button"
              className="btn btn-sm btn-close"
              data-bs-dismiss="modal"
            />
          </div>
          <div
            className="modal-body text-start mb-4"
            style={{ fontSize: "16px" }}
          >
            <form className="ms-5" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <strong>Tên:</strong>
                <input
                  type="text"
                  className="form-control w-50 mt-1"
                  placeholder="Nhập tên việc làm"
                  required
                  {...register("jname")}
                />
              </div>
              <div className="mt-2">
                <strong>Ngành nghề:</strong>
                <div className="d-flex mt-2">
                  <span>Chọn:</span>
                  <select
                    className="form-select w-25 ms-2"
                    multiple
                    size="4"
                    required
                    {...register("industries")}
                  >
                    {industries.map((item, index) => (
                      <option value={index} key={"industry" + item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
                {watch("industries") && watch("industries").length > 0 ? (
                  <div
                    className="form-control disabled-field mt-2"
                    style={{ width: "50%" }}
                  >
                    {watch("industries").map((item, index) => (
                      <span key={"cur_industry" + item}>
                        {industries[item].name}
                        {index !== watch("industries").length - 1 && ", "}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="mt-2">
                <strong>Hình thức việc làm:</strong>
                <select
                  className="form-select w-50 mt-1"
                  {...register("jtype_id", { required: true })}
                >
                  {jtypes.map((item) => (
                    <option key={item.name} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.jtype_id && (
                <span className="text-danger">Vui lòng chọn 1 lựa chọn</span>
              )}
              <div className="mt-2">
                <strong>Cấp bậc:</strong>
                <select
                  className="form-select w-50 mt-1"
                  {...register("jlevel_id", { required: true })}
                >
                  {jlevels.map((item) => (
                    <option key={item.name} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-2">
                <strong>Tỉnh thành:</strong>
                <div className="d-flex mt-2">
                  <span>Chọn:</span>
                  <select
                    className="form-select w-25 ms-2"
                    multiple
                    size="6"
                    required
                    {...register("locations")}
                  >
                    {locations.map((item, index) => (
                      <option value={index} key={"location" + item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
                {watch("locations") && watch("locations").length > 0 ? (
                  <div
                    className="form-control disabled-field mt-2"
                    style={{ width: "50%" }}
                  >
                    {watch("locations").map((item, index) => (
                      <span key={"cur_location" + item}>
                        {locations[item].name}
                        {index !== watch("locations").length - 1 && ", "}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="mt-2">
                <strong>Địa chỉ:</strong>
                <textarea
                  rows="4"
                  className="form-control mt-1 w-75"
                  placeholder="Nhập địa chỉ"
                  required
                  {...register("address")}
                />
              </div>
              {errors.jlevel_id && (
                <span className="text-danger">Vui lòng chọn 1 lựa chọn</span>
              )}
              <div className="mt-2 d-flex align-items-center">
                <strong>Số lượng tuyển:</strong>
                <input
                  type="number"
                  className="form-control ms-2"
                  style={{ width: "70px" }}
                  required
                  {...register("amount", { min: 1 })}
                />
              </div>
              {errors.amount?.type === "min" && (
                <span className="text-danger">Hãy nhập 1 số lớn hơn 0</span>
              )}
              <div className="mt-2">
                <div className="d-flex align-items-center">
                  <strong>Lương:</strong>
                </div>
                <div className="form-check mt-1">
                  <input
                    type="radio"
                    className="form-check-input"
                    name="salaryOpt"
                    value="0"
                    {...register("salaryOpt")}
                  />
                  Theo thỏa thuận <br />
                  <input
                    type="radio"
                    className="form-check-input"
                    name="salaryOpt"
                    value="1"
                    {...register("salaryOpt")}
                  />
                  Cụ thể <br />
                  <span className="text-danger">
                    {!watch("salaryOpt") && "Mời chọn 1 trong 2 lựa chọn trên"}
                  </span>
                  {watch("salaryOpt") === "1" && (
                    <div className="d-flex mt-1 align-items-center">
                      <input
                        type="number"
                        className="form-control"
                        style={{ width: "70px" }}
                        required
                        {...register("min_salary")}
                      />
                      <AiOutlineLine
                        className="mx-1"
                        style={{ fontSize: "14px" }}
                      />
                      <input
                        type="number"
                        className="form-control"
                        style={{ width: "70px" }}
                        required
                        {...register("max_salary")}
                      />
                      &nbsp; triệu VND
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 d-flex align-items-center">
                <strong>Yêu cầu kinh nghiệm:</strong>
                <select
                  className="form-select ms-1"
                  style={{ width: "100px" }}
                  {...register("yoe")}
                >
                  <option value="">Không</option>
                  {Array.from({ length: 20 }, (e, index) => (
                    <option value={index + 1} key={"yoe" + index}>
                      {index + 1 + " năm"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-2 d-flex align-items-center">
                <strong>Hạn nộp hồ sơ:</strong>
                <input
                  type="date"
                  className="form-control ms-1"
                  style={{ width: "180px" }}
                  required
                  {...register("expire_at")}
                />
              </div>
              <div className="mt-2">
                <strong>Mô tả việc làm:</strong>
                <textarea
                  rows="13"
                  className="form-control mt-1"
                  style={{ width: "98%" }}
                  placeholder="Nhập mô tả việc làm"
                  required
                  {...register("description")}
                />
              </div>
              <div className="mt-3 float-end">
                <button type="submit" className="btn btn-primary">
                  Tạo mới
                </button>
                <button
                  type="button"
                  className="btn btn-danger me-2 ms-3"
                  data-bs-dismiss="modal"
                >
                  Đóng
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobCreating;
