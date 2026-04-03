import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineLine } from "react-icons/ai";
import jobApi from "../../../api/job";

function JobDetail({ inf, jtypes, jlevels, industries, locations }) {
  const jobIndustries = inf.industries;
  const jobLocations = inf.locations;
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm();
  const [isEditIndustry, setIsEditIndustry] = useState(false);
  const [isEditLocation, setIsEditLocation] = useState(false);
  const [isEditSalary, setIsEditSalary] = useState(false);

  const onSubmit = async (job_inf) => {
    console.log(job_inf);
    const keys = Object.keys(job_inf);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      if (job_inf[key] === "") {
        delete job_inf[key];
      }
      if (key === "salaryOpt") {
        if (job_inf[key] === "0") {
          job_inf.min_salary = null;
          job_inf.max_salary = null;
        }
        delete job_inf[key];
      }
      if (key === "industries") {
        for (let j = 0; j < job_inf[key].length; j++) {
          job_inf[key][j] = industries[job_inf[key][j]].id;
        }
      }
      if (key === "locations") {
        for (let j = 0; j < job_inf[key].length; j++) {
          job_inf[key][j] = locations[job_inf[key][j]].id;
        }
      }
    }
    console.log(job_inf);
    await jobApi.update(inf.id, job_inf);
    alert("Cập nhật thành công!");
    window.location.reload();
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="modal modal-xl fade" id="jobDetail">
      <div className="modal-dialog modal-fullscreen-md-down modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="ms-2">Thông tin chi tiết việc làm</h5>
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
                  defaultValue={inf.jname}
                  required
                  {...register("jname")}
                />
              </div>
              <div className="mt-2">
                <strong>Ngành nghề:</strong>
                <div className="d-flex align-items-center mt-1">
                  <div
                    className="form-control disabled-field"
                    style={{ width: "50%" }}
                  >
                    {!watch("industries") ? (
                      <>
                        {jobIndustries.map((item, index) => (
                          <span key={item.name}>
                            {item.name}
                            {index !== jobIndustries.length - 1 && ", "}
                          </span>
                        ))}
                      </>
                    ) : (
                      <>
                        {watch("industries").map((item, index) => (
                          <span key={"cur_industry" + index}>
                            {industries[item].name}
                            {index !== watch("industries").length - 1 && ", "}
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-primary ms-2"
                    onClick={() => setIsEditIndustry(!isEditIndustry)}
                  >
                    {!isEditIndustry ? "Sửa" : "OK"}
                  </button>
                </div>
                {isEditIndustry && (
                  <div className="d-flex mt-2">
                    <span>Chọn:</span>
                    <select
                      className="form-select w-25 ms-2"
                      multiple
                      size="4"
                      {...register("industries")}
                    >
                      {industries.map((item, index) => (
                        <option value={index} key={"industry" + item.id}>
                          {item.name}{" "}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="mt-2">
                <strong>Hình thức việc làm:</strong>
                <select
                  className="form-select w-50 mt-1"
                  {...register("jtype_id")}
                >
                  {jtypes.map((item) => (
                    <option
                      key={item.name}
                      value={item.id}
                      selected={item.name === inf.jtype_name}
                    >
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-2">
                <strong>Cấp bậc:</strong>
                <select
                  className="form-select w-50 mt-1"
                  {...register("jlevel_id")}
                >
                  {jlevels.map((item) => (
                    <option
                      key={item.name}
                      value={item.id}
                      selected={item.name === inf.jlevel_name}
                    >
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-2">
                <strong>Tỉnh thành:</strong>
                <div className="d-flex align-items-center mt-1">
                  <div
                    className="form-control disabled-field"
                    style={{ width: "35%" }}
                  >
                    {!watch("locations") ? (
                      <>
                        {jobLocations.map((item, index) => (
                          <span key={item.name}>
                            {item.name}
                            {index !== jobLocations.length - 1 && ", "}
                          </span>
                        ))}
                      </>
                    ) : (
                      <>
                        {watch("locations").map((item, index) => (
                          <span key={"cur_location" + index}>
                            {locations[item].name}
                            {index !== watch("locations").length - 1 && ", "}
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-primary ms-2"
                    onClick={() => setIsEditLocation(!isEditLocation)}
                  >
                    {!isEditLocation ? "Sửa" : "OK"}
                  </button>
                </div>
                {isEditLocation && (
                  <div className="d-flex mt-2">
                    <span>Chọn:</span>
                    <select
                      className="form-select ms-2"
                      style={{ width: "20%" }}
                      multiple
                      size="6"
                      {...register("locations")}
                    >
                      {locations.map((item, index) => (
                        <option value={index} key={"location" + item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="mt-2">
                <strong>Địa chỉ:</strong>
                <textarea
                  rows="4"
                  className="form-control mt-1 w-75"
                  defaultValue={inf.address}
                  required
                  {...register("address")}
                />
              </div>
              <div className="mt-2 d-flex align-items-center">
                <strong>Số lượng tuyển:</strong>
                <input
                  type="number"
                  className="form-control ms-2"
                  style={{ width: "70px" }}
                  defaultValue={inf.amount}
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
                  <div
                    className="form-control ms-1 disabled-field"
                    style={{ width: "180px" }}
                  >
                    {!watch("salaryOpt") && !inf.min_salary
                      ? "Theo thỏa thuận"
                      : null}
                    {!watch("salaryOpt") && inf.min_salary ? (
                      <span>
                        {inf.min_salary + "-" + inf.max_salary} triệu VND
                      </span>
                    ) : null}
                    {watch("salaryOpt") === "0" && "Theo thỏa thuận"}
                    {watch("salaryOpt") === "1" && (
                      <span>
                        {watch("min_salary") && watch("min_salary")}-
                        {watch("max_salary") && watch("max_salary")} triệu VND
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className=" ms-2 btn btn-outline-primary"
                    onClick={() => setIsEditSalary(!isEditSalary)}
                  >
                    {!isEditSalary ? "Sửa" : "OK"}
                  </button>
                </div>
                {isEditSalary && (
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
                    Cụ thể
                    {watch("salaryOpt") === "1" && (
                      <div className="d-flex mt-1 align-items-center">
                        <input
                          type="number"
                          className="form-control"
                          style={{ width: "70px" }}
                          defaultValue={inf.min_salary}
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
                          defaultValue={inf.max_salary}
                          required
                          {...register("max_salary")}
                        />
                        &nbsp; triệu VND
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-3 d-flex align-items-center">
                <strong>Yêu cầu kinh nghiệm:</strong>
                <select
                  className="form-select ms-1"
                  style={{ width: "100px" }}
                  {...register("yoe")}
                >
                  <option value="" selected={inf.yoe === null}>
                    Không
                  </option>
                  {Array.from({ length: 20 }, (e, index) => (
                    <option
                      value={index + 1}
                      selected={inf.yoe === index + 1}
                      key={"yoe" + index}
                    >
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
                  defaultValue={inf.expire_at}
                  {...register("expire_at")}
                />
              </div>
              <div className="mt-2">
                <strong>Mô tả việc làm:</strong>
                <textarea
                  rows="13"
                  className="form-control mt-1"
                  style={{ width: "98%" }}
                  defaultValue={inf.description}
                  {...register("description")}
                />
              </div>
              <div className="mt-3 float-end">
                <button type="submit" className="btn btn-primary">
                  Cập nhật
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

export default JobDetail;
