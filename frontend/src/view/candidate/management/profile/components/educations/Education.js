import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack";
import { useContext, useState } from "react";
import educationApi from "../../../../../../api/education";
import FrameLayout from "../frameLayout";
import dayjs from "dayjs";
import EducationFormDialog from "./EducationFormDialog";
import { CandidateContext } from "../../../layouts/CandidateLayout";

export default function Education() {
  const { educations, setEducations, getEducations } =
    useContext(CandidateContext);
  const [actType, setActType] = useState("VIEW");
  const [current, setCurrent] = useState({});

  const handleDelete = async (id) => {
    let choice = window.confirm("Bạn có chắc muốn xóa Thông tin học vấn này?");
    if (choice) {
      await educationApi.destroy(id);
      let temp = educations.filter((item) => {
        return item.id !== id;
      });
      setEducations(temp);
    }
  };
  const handleEdit = (item) => {
    setActType("EDIT");
    setCurrent(item);
  };

  return (
    <FrameLayout
      title="Thông tin học vấn"
      hasaddbtn={true}
      className="mt-4"
      setActType={setActType}
    >
      {educations?.map((item, index) => (
        <div key={index}>
          <hr />
          <div className="border-0 border-success border-start ps-3 d-inline-block">
            <div className="fw-bold">{item.school}</div>
            {item.start_date || item.start_date ? (
              <div>
                <span className="text-secondary" style={{ fontSize: "13px" }}>
                  {dayjs(item.start_date).format("DD/MM/YYYY")} -{" "}
                  {dayjs(item.end_date).format("DD/MM/YYYY")}
                </span>
              </div>
            ) : null}
            {item.major && (
              <div style={{ fontSize: "15px" }}>
                Chuyên ngành:
                <span className="text-secondary">{" " + item.major}</span>
              </div>
            )}
            <div style={{ fontSize: "15px" }}>
              Mô tả:
              <span className="text-secondary">{" " + item.description}</span>
            </div>
          </div>
          <div className="mt-2 float-md-end">
            <Stack direction="horizontal" gap={2}>
              <Button
                size="sm"
                variant="outline-primary"
                onClick={() => handleEdit(item)}
              >
                Sửa
              </Button>
              <Button
                size="sm"
                variant="outline-danger"
                onClick={() => handleDelete(item.id)}
              >
                Xóa
              </Button>
            </Stack>
          </div>
        </div>
      ))}
      {actType !== "VIEW" && (
        <EducationFormDialog
          actType={actType}
          setActType={setActType}
          current={current}
          getAllEducations={getEducations}
        />
      )}
    </FrameLayout>
  );
}
