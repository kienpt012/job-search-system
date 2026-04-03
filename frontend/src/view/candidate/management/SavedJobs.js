import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BsTrash3 } from "react-icons/bs";
import { useSelector } from "react-redux";
import SavedJobPopup from "./SavedJobPopup";
import candidateApi from "../../../api/candidate";

function SavedJobs() {
  const [jobs, setJobs] = useState([]);
  const [jobLocations, setJobLocations] = useState([]);
  const [curJob, setCurJob] = useState({});
  const user = useSelector((state) => state.candAuth.current);
  const isAuth = useSelector((state) => state.candAuth.isAuth);
  const candidateId = user?.id;

  const getSavedJobs = async () => {
    const jobs = await candidateApi.getSavedJobs(candidateId);
    let jobLocs = [];
    console.log(jobs);
    setJobs(jobs);
    for (let i = 0; i < jobs.length; i++) {
      jobLocs[i] = "";
      for (let j = 0; j < jobs[i].locations.length; j++) {
        jobLocs[i] = jobLocs[i] + jobs[i].locations[j].name;
        if (j !== jobs[i].locations.length - 1) {
          jobLocs[i] = jobLocs[i] + ", ";
        }
      }
    }
    setJobLocations(jobLocs);
  };

  useEffect(() => {
    if (isAuth && candidateId) getSavedJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateId, isAuth]);

  return (
    <>
      <div className="ms-4 mt-4 px-5 py-3 bg-white">
        <h4 className="mb-4 text-main">Việc làm đã lưu</h4>
        <table className="table border shadow-sm">
          <thead className="table-primary">
            <tr>
              <th className="fw-500" style={{ width: "26%" }}>
                Vị trí
              </th>
              <th className="fw-500" style={{ width: "26%" }}>
                Công ty
              </th>
              <th className="fw-500" style={{ width: "18%" }}>
                Địa điểm
              </th>
              <th className="fw-500" style={{ width: "14%" }}>
                Hạn nộp
              </th>
              <th className="fw-500">Hành động</th>
            </tr>
          </thead>
          <tbody className="ts-smd">
            {jobs.length > 0 &&
              jobs.map((item, index) => (
                <tr key={"saveJob" + item.id}>
                  <td>{item.jname}</td>
                  <td>{item.employer.name} </td>
                  <td>{jobLocations[index]}</td>
                  <td>{item.deadline} </td>
                  <td>
                    <div className="d-flex flex-wrap align-items-center gap-lg-3 gap-1">
                      {item.is_active === 1 ? (
                        <Link to={`/jobs/${item.id}`}>
                          <button className="btn btn-sm btn-outline-primary">
                            Ứng tuyển
                          </button>
                        </Link>
                      ) : (
                        <button className="btn btn-sm btn-outline-primary disabled">
                          Đã đóng
                        </button>
                      )}
                      <div
                        className="text-danger bg-white border-0"
                        data-bs-toggle="modal"
                        data-bs-target="#jobDeletingModal"
                        onClick={() => setCurJob(item)}
                      >
                        <BsTrash3 className="fs-5" />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {jobs.length === 0 && <h5 className="">Không có bản ghi nào</h5>}
      </div>
      <SavedJobPopup job_id={curJob.id} />     
    </>
  );
}

export default SavedJobs;
