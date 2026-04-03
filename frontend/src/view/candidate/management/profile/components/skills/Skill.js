import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack";
import { useContext, useState } from "react";
import FrameLayout from "../frameLayout";
import skillApi from "../../../../../../api/skill";
import { IoMdStar, IoMdStarOutline } from "react-icons/io";
import SkillFormDialog from "./SkillFormDialog";
import { CandidateContext } from "../../../layouts/CandidateLayout";

export default function Skill() {
  const { skills, setSkills, getSkills } = useContext(CandidateContext);
  const [actType, setActType] = useState("VIEW");
  const [current, setCurrent] = useState({});

  const handleDelete = async (id) => {
    let choice = window.confirm("Bạn có chắc muốn xóa Kỹ năng này?");
    if (choice) {
      await skillApi.destroy(id);
      let temp = skills.filter((item) => {
        return item.id !== id;
      });
      setSkills(temp);
    }
  };
  const handleEdit = (item) => {
    setActType("EDIT");
    setCurrent(item);
  };

  return (
    <FrameLayout
      title="Kỹ năng"
      hasaddbtn={true}
      className="mt-4"
      setActType={setActType}
    >
      {skills?.map((item, index) => (
        <div key={index}>
          <hr />
          <div className="border-0 border-success border-start ps-3 d-inline-block">
            <div className="fw-bold">{item.name}</div>
            <Stack direction="horizontal">
              {Array.from({ length: 5 }, (_, ind) => (
                <span key={ind}>
                  {ind <= item.proficiency - 1 ? (
                    <IoMdStar className="fs-3" style={{ color: "orange" }} />
                  ) : (
                    <IoMdStarOutline
                      className="fs-3"
                      style={{ color: "orange" }}
                    />
                  )}
                </span>
              ))}
            </Stack>
            {item.description && (
              <div className="ts-smd">
                <span className="text-secondary">{" " + item.description}</span>
              </div>
            )}
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
        <SkillFormDialog
          actType={actType}
          setActType={setActType}
          current={current}
          getAll={getSkills}
        />
      )}
    </FrameLayout>
  );
}
