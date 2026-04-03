import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack";
import { useContext, useState } from "react";
import FrameLayout from "../frameLayout";
import dayjs from "dayjs";
import PrizeFormDialog from "./PrizeFormDialog";
import prizeApi from "../../../../../../api/prize";
import { CandidateContext } from "../../../layouts/CandidateLayout";

export default function Prize() {
  const { prizes, setPrizes, getPrizes } = useContext(CandidateContext);
  const [actType, setActType] = useState("VIEW");
  const [current, setCurrent] = useState({});

  const handleDelete = async (id) => {
    let choice = window.confirm("Bạn có chắc muốn xóa Giải thưởng này?");
    if (choice) {
      await prizeApi.destroy(id);
      let temp = prizes.filter((item) => {
        return item.id !== id;
      });
      setPrizes(temp);
    }
  };
  const handleEdit = (item) => {
    setActType("EDIT");
    setCurrent(item);
  };

  return (
    <FrameLayout
      title="Giải thưởng"
      hasaddbtn={true}
      className="mt-4"
      setActType={setActType}
    >
      {prizes?.map((item, index) => (
        <div key={index}>
          <hr />
          <div className="border-0 border-success border-start ps-3 d-inline-block">
            <div className="fw-bold">{item.name}</div>
            <div>
              <span className="text-secondary ts-xs">
                {dayjs(item.receive_date).format("DD/MM/YYYY")}
              </span>
            </div>
            {item.image && (
              <a
                className="nav-link text-primary"
                href={item.image}
                target="_blank"
                rel="noreferrer"
              >
                <span className="ts-smd">Ảnh</span>
              </a>
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
        <PrizeFormDialog
          actType={actType}
          setActType={setActType}
          current={current}
          getAll={getPrizes}
        />
      )}
    </FrameLayout>
  );
}
