import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

export default function BellDialog({ show, setShow, current }) {
  const handleClose = () => {
    setShow(false);
  };
  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Body>
        <h4 className="border-bottom border-2 pb-2 text-center">Thông báo</h4>
        <div className="ts-smd text-danger">{current.name}</div>
        {/* <div className="text-secondary ts-sm">
          Đã nhận lúc {dayjs(current.created_at).format("H:m - DD/MM/YYYY")}
        </div> */}
        <div className="mt-2 ps-3 fw-500 ts-17">{current.title}</div>
        <div className="mt-1 border border-2 rounded py-1 ps-2 bg-mlight whitespace-preline">
          {current.content}
        </div>
        <Button
          className="mt-2 d-block ms-auto"
          size="sm"
          variant="secondary"
          onClick={handleClose}
        >
          Đóng
        </Button>
      </Modal.Body>
    </Modal>
  );
}
