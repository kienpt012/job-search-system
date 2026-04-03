import Modal from "react-bootstrap/Modal";
import Stack from "react-bootstrap/Stack";
import Button from "react-bootstrap/Button";
import { IoMdClose } from "react-icons/io";
import { useContext } from "react";
import { CandidateContext } from "../layouts/CandidateLayout";
import { useNavigate } from "react-router-dom";

export default function CreateOptionDialog({ show, setShow }) {
  const { setCvMode } = useContext(CandidateContext);
  const nav = useNavigate();
  const handleSelect = (mode) => {
    setCvMode(mode);
    setShow(false);
    nav("/candidate/resumes/create");
  };
  return (
    <Modal show={show} onHide={() => setShow(false)}>
      <IoMdClose
        className="ms-auto fs-4 me-1 mt-1 pointer"
        onClick={() => setShow(false)}
      />
      <Modal.Body className="pt-1 mb-3">
        <h5 className="text-center">Chọn phương thức tạo hồ sơ</h5>
        <Stack direction="vertically" gap={3} className="mt-3">
          <Button
            variant="outline-primary"
            onClick={() => handleSelect("CREATE_0")}
          >
            Tạo mới từ đầu
          </Button>
          <Button
            variant="outline-primary"
            onClick={() => handleSelect("CREATE_1")}
          >
            Tạo từ thông tin Profile
          </Button>
        </Stack>
      </Modal.Body>
    </Modal>
  );
}
