import { useContext, useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import resumeApi from "../../../../api/resume";
import dayjs from "dayjs";
import { BsEyeFill } from "react-icons/bs";
import { MdDelete } from "react-icons/md";
import { MdEdit } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import CreateOptionDialog from "./CreateOptionDialog";
import { useNavigate } from "react-router-dom";
import { CandidateContext } from "../layouts/CandidateLayout";
import { toast } from "react-toastify";

export default function Resume() {
  const { setCvMode } = useContext(CandidateContext);
  const [resumes, setResumes] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const nav = useNavigate();

  const getResumes = async () => {
    const res = await resumeApi.getByCurrentCandidate();
    setResumes(res);
  };
  const handleCreate = () => {
    setShowDialog(true);
  };
  const handleEdit = (id) => {
    setCvMode("EDIT");
    nav(`/candidate/resumes/${id}`);
  };
  const handleDelete = async (id) => {
    const choice = window.confirm("Bạn có chắc muốn xóa bản ghi này?");
    if (choice) {
      try {
        await resumeApi.destroy(id);
        toast.success("Xóa bản ghi thành công!");
        await getResumes();
      } catch (error) {
        toast.error("Đã có lỗi xảy ra!");
      }
    }
  };

  useEffect(() => {
    getResumes();
  }, []);

  return (
    <div className="vh-100 pt-4 px-4">
      <div className="bg-white py-3 ps-5">
        <h4 className="text-main">Quản lý hồ sơ</h4>
        <div className="w-85 clearfix">
          <Button
            variant="info"
            className="py-1 pe-3 text-white d-flex align-items-center gap-1 float-end"
            onClick={handleCreate}
          >
            <IoMdAdd className="fs-5" />
            Tạo mới hồ sơ
          </Button>
        </div>
        <Table hover className="w-85 shadow-sm mt-3">
          <thead className="table-primary">
            <tr>
              <th className="fw-500 w-30">Tiêu đề hồ sơ</th>
              <th className="fw-500">Thời gian tạo</th>
              <th className="fw-500">Thời gian sửa</th>
              <th className="fw-500">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {resumes.length > 0 &&
              resumes.map((item) => (
                <tr key={`resume_${item.id}`}>
                  <td className="ts-smd">{item.title}</td>
                  <td className="ts-smd">
                    {dayjs(item.created_at).format("H:mm DD/MM/YYYY")}
                  </td>
                  <td className="ts-smd">
                    {dayjs(item.updated_at).format("H:mm DD/MM/YYYY")}
                  </td>
                  <td className="ts-lg">
                    <div className="d-flex gap-3">
                      <BsEyeFill className="text-secondary pointer" />
                      <MdEdit
                        className="text-primary pointer"
                        onClick={() => handleEdit(item.id)}
                      />
                      <MdDelete
                        className="text-danger pointer"
                        onClick={() => handleDelete(item.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
        {resumes.length === 0 && <h5 className="my-2">Không có bản ghi nào</h5>}
        {showDialog && (
          <CreateOptionDialog show={showDialog} setShow={setShowDialog} />
        )}
      </div>
    </div>
  );
}
