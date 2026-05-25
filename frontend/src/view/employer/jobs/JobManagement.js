import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlinePlus } from "react-icons/ai";
import { BsEye, BsSearch } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import JobDetail from "./JobDetail";
import JobCreating from "./JobCreating";
import jtypeApi from "../../../api/jtype";
import jlevelApi from "../../../api/jlevel";
import industryApi from "../../../api/industry";
import employerApi from "../../../api/employer";
import jskillApi from "../../../api/jskill";
import billingApi from "../../../api/billing";
import "./style.css";

const normalizeList = (res) => (Array.isArray(res) ? res : res?.data || []);

function JobManagement() {
  const [jobs, setJobs] = useState([]);
  const [curJob, setCurJob] = useState({ industries: [], skills: [] });
  const [jtypes, setJtypes] = useState([]);
  const [jlevels, setJlevels] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [skills, setSkills] = useState([]);
  const [branches, setBranches] = useState([]);
  const [billingSummary, setBillingSummary] = useState(null);
  const { register, handleSubmit } = useForm();
  const company = useSelector((state) => state.employerAuth.current.employer);
  const assignedBranches = useSelector((state) => state.employerAuth.current.branches || []);
  const permissions = useSelector((state) => state.employerAuth.current.permissions || {});
  const isAuth = useSelector((state) => state.employerAuth.isAuth);
  const nav = useNavigate();

  const canManageJobs = Boolean(permissions.manage_jobs);
  const canManageBilling = Boolean(permissions.manage_billing);

  const getReferenceData = async () => {
    const [typeRes, levelRes, industryRes, skillRes] = await Promise.all([
      jtypeApi.getAll(),
      jlevelApi.getAll(),
      industryApi.getAll(),
      jskillApi.getAll(),
    ]);

    setJtypes(typeRes?.inf || []);
    setJlevels(levelRes?.inf || []);
    setIndustries(industryRes?.inf || []);
    setSkills(skillRes || []);
  };

  const getBranches = async () => {
    try {
      const res = await employerApi.getBranches();
      setBranches(res?.data || []);
    } catch (error) {
      setBranches(assignedBranches);
    }
  };

  const getBillingSummary = async () => {
    try {
      setBillingSummary(await billingApi.getSummary());
    } catch (error) {
      setBillingSummary({ current_subscription: null });
    }
  };

  const getJobList = async (data) => {
    const searchKey = data?.searchKey || "";
    const res = await employerApi.getJobList(null, searchKey);
    setJobs(normalizeList(res));
  };

  const handleClickSwitchBtn = async ({ job_id, status, index }) => {
    if (!canManageJobs) return;

    const tempJobs = [...jobs];
    await employerApi.changeJobStatus(job_id, { status });
    tempJobs[index].is_active = status;
    tempJobs[index].status = status ? "active" : "paused";
    setJobs(tempJobs);
  };

  useEffect(() => {
    getReferenceData();
  }, []);

  useEffect(() => {
    if (isAuth) {
      getJobList();
      getBranches();
      getBillingSummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth]);

  const subscription = billingSummary?.current_subscription;
  const remainingJobPosts = subscription?.remaining_job_posts;
  const isBillingReady = billingSummary !== null;
  const canCreateJob =
    canManageJobs &&
    isBillingReady &&
    Boolean(subscription) &&
    (remainingJobPosts === null || remainingJobPosts > 0);
  const hasActiveBranch = branches.some(
    (branch) => String(branch.is_active) !== "0" && branch.is_active !== false
  );
  const canOpenCreateModal = canCreateJob && hasActiveBranch;

  return (
    <div className="section-card mt-1">
      <div className="section-card__head">
        <div>
          <h1 className="app-section-title mb-1">Quản lý tin tuyển dụng</h1>
          <div className="app-section-subtitle">
            {company?.name || "Doanh nghiệp"} có {jobs.length} tin tuyển dụng trong danh sách hiện tại.
          </div>
        </div>
        {canManageJobs && (
          <button
            type="button"
            className="btn app-button-primary d-flex align-items-center px-4"
            disabled={!isBillingReady}
            {...(canOpenCreateModal ? { "data-bs-toggle": "modal", "data-bs-target": "#jobCreating" } : {})}
            onClick={() => {
              if (!canCreateJob) {
                if (canManageBilling) nav("/employer/billing");
                return;
              }
              if (!canOpenCreateModal) {
                nav("/employer/branches");
              }
            }}
          >
            <AiOutlinePlus />
            <span className="ms-1">Tạo mới</span>
          </button>
        )}
      </div>

      {!canManageJobs && (
        <div className="job-billing-lock">
          <span>Bạn chỉ có quyền xem tin tuyển dụng trong phạm vi được cấp.</span>
        </div>
      )}

      {canManageJobs && isBillingReady && !canCreateJob && (
        <div className="job-billing-lock">
          <span>
            {canManageBilling
              ? "Cần thanh toán gói dịch vụ để tạo tin tuyển dụng mới."
              : "Gói dịch vụ của công ty chưa sẵn sàng. Vui lòng liên hệ tài khoản tổng công ty."}
          </span>
          {canManageBilling && (
            <button type="button" onClick={() => nav("/employer/billing")}>
              Xem gói dịch vụ
            </button>
          )}
        </div>
      )}

      {canManageJobs && isBillingReady && canCreateJob && !canOpenCreateModal && (
        <div className="job-billing-lock">
          <span>Cần có ít nhất một chi nhánh đang hoạt động trước khi đăng tin.</span>
          <button type="button" onClick={() => nav("/employer/branches")}>
            Quản lý chi nhánh
          </button>
        </div>
      )}

      <form className="mb-4" style={{ maxWidth: "460px" }} onSubmit={handleSubmit(getJobList)}>
        <div className="input-group">
          <input
            type="text"
            className="form-control border-end-0"
            placeholder="Nhập tên, hình thức, cấp bậc việc làm"
            {...register("searchKey")}
          />
          <button type="submit" className="input-group-text bg-white">
            <BsSearch />
          </button>
        </div>
      </form>

      <table className="table border text-center shadow-sm">
        <thead className="table-primary ts-smd">
          <tr>
            <th style={{ width: "22%" }}>Tên</th>
            <th style={{ width: "16%" }}>Chi nhánh</th>
            <th style={{ width: "12%" }}>Hình thức</th>
            <th style={{ width: "12%" }}>Cấp bậc</th>
            <th style={{ width: "14%" }}>Ngày đăng</th>
            <th style={{ width: "12%" }}>Deadline</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody style={{ fontSize: "14px" }}>
          {jobs.map((item, index) => (
            <tr key={"job" + item.id}>
              <td>{item.jname}</td>
              <td>{item.branch?.name || "Chưa gắn"}</td>
              <td>{item.jtype_name}</td>
              <td>{item.jlevel_name}</td>
              <td>{item.postTime}</td>
              <td>{item.deadline}</td>
              <td>
                <div className="form-check form-switch">
                  <input
                    type="checkbox"
                    className="form-check-input mx-auto"
                    name="status[]"
                    checked={item.is_active === 1}
                    disabled={!canManageJobs}
                    onChange={() =>
                      handleClickSwitchBtn({
                        job_id: item.id,
                        status: item.is_active === 1 ? 0 : 1,
                        index,
                      })
                    }
                  />
                </div>
              </td>
              <td style={{ fontSize: "17px" }}>
                <BsEye
                  className="text-primary"
                  style={{ cursor: "pointer" }}
                  data-bs-toggle="modal"
                  data-bs-target="#jobDetail"
                  onClick={() => setCurJob(item)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {jobs.length === 0 && <h5>Không có bản ghi nào</h5>}

      <JobDetail
        inf={curJob}
        jtypes={jtypes}
        jlevels={jlevels}
        industries={industries}
        skills={skills}
        branches={branches}
        canEdit={canManageJobs}
      />
      {canManageJobs && (
        <JobCreating
          jtypes={jtypes}
          jlevels={jlevels}
          industries={industries}
          skills={skills}
          branches={branches}
        />
      )}
    </div>
  );
}

export default JobManagement;
