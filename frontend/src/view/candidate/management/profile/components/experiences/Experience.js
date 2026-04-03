import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack";
import { useContext, useState } from "react";
import FrameLayout from "../frameLayout";
import dayjs from "dayjs";
import experienceApi from "../../../../../../api/experience";
import ExperienceFormDialog from "./ExperienceFormDialog";
import { CandidateContext } from "../../../layouts/CandidateLayout";

export default function Experience() {
  const { experiences, setExperiences, getExperiences } =
    useContext(CandidateContext);
  const [actType, setActType] = useState("VIEW");
  const [current, setCurrent] = useState({});

  const handleDelete = async (id) => {
    let choice = window.confirm(
      "Bạn có chắc muốn xóa Kinh nghiệm việc làm này?"
    );
    if (choice) {
      await experienceApi.destroy(id);
      let temp = experiences.filter((item) => {
        return item.id !== id;
      });
      setExperiences(temp);
    }
  };
  const handleEdit = (item) => {
    setActType("EDIT");
    setCurrent(item);
  };

  return (
    <FrameLayout
      title="Kinh nghiệm việc làm"
      hasaddbtn={true}
      className="mt-4"
      setActType={setActType}
    >
      {experiences?.map((item, index) => (
        <div key={index}>
          <hr />
          <div className="border-0 border-success border-start ps-3 d-inline-block">
            <div className="fw-bold">{item.name}</div>
            <div className="text-secondary ts-smd">{item.company}</div>
            {item.start_date || item.start_date ? (
              <div>
                <span className="text-secondary ts-xs">
                  {dayjs(item.start_date).format("DD/MM/YYYY")} -{" "}
                  {dayjs(item.end_date).format("DD/MM/YYYY")}
                </span>
              </div>
            ) : null}
            <div className="ts-smd">
              <span className="">Mô tả:</span>
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
        <ExperienceFormDialog
          actType={actType}
          setActType={setActType}
          current={current}
          getAll={getExperiences}
        />
      )}
    </FrameLayout>
  );
}
