import { useState } from "react";
import { useForm } from "react-hook-form";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { toast } from "react-toastify";
import employerApi from "../../../api/employer";

function MessagePopup({
  candidate,
  showDialog,
  setShowDialog,
  getCandidateList,
}) {
  let prefixMsg = "";
  const step = candidate.step;
  const actType = candidate.actType;

  if (step === "step1") {
    if (actType === "ACCEPT") prefixMsg = "Chấp nhận hồ sơ ứng viên ";
    else if (actType === "REJECT") prefixMsg = "Từ chối hồ sơ ứng viên ";
  } else if (step === "step2") {
    if (actType === "ACCEPT") prefixMsg = "Tiếp nhận ứng viên ";
    else if (actType === "REJECT") prefixMsg = "Không tiếp nhận ứng viên ";
  }

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const requiredMsg = "Không được để trống!";
  const [isSendMail, setIsSendMail] = useState(false);

  const onSubmit = async (data) => {
    try {
      await employerApi.processApplying({
        ...candidate,
        ...data,
        is_send_mail: isSendMail,
      });

      toast.success(
        isSendMail
          ? "Đã cập nhật trạng thái và gửi email thành công!"
          : "Đã gửi thông báo thành công!"
      );
      getCandidateList();
      setShowDialog(false);
    } catch (error) {
      toast.error("Xử lý thông báo thất bại!");
    }
  };

  const handleClose = () => {
    setShowDialog(false);
  };

  return (
    <Modal
      show={showDialog}
      onShow={() => {
        document.getElementById("reset").click();
        setIsSendMail(false);
      }}
      onHide={handleClose}
      size="lg"
      fullscreen="md-down"
    >
      <Modal.Body>
        <div className="ts-xl fw-500 text-center border-bottom pb-1">Gửi thông báo</div>
        <div className="text-center bg-mlight">
          <div className="pt-1 pb-2">
            {prefixMsg}
            <span className="fw-500">
              {candidate.lastname} {candidate.firstname}
            </span>
            <div>
              Vị trí <span className="fw-500">{candidate.jname}</span>
            </div>
          </div>
        </div>

        <Form className="mt-2" noValidate onSubmit={handleSubmit(onSubmit)}>
          <Form.Check
            type="checkbox"
            label="Gửi email thông báo"
            checked={isSendMail}
            onChange={(event) => setIsSendMail(event.target.checked)}
          />

          <Form.Group>
            <Form.Label className="fw-500">Tiêu đề</Form.Label>
            <Form.Control
              type="text"
              size="sm"
              {...register("title", { required: requiredMsg })}
              isInvalid={errors.title}
            />
            <Form.Control.Feedback type="invalid">
              {errors.title?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mt-1">
            <Form.Label className="fw-500">Nội dung</Form.Label>
            <Form.Control
              as="textarea"
              size="sm"
              rows={10}
              {...register("content", { required: requiredMsg })}
              isInvalid={errors.content}
            />
            <Form.Control.Feedback type="invalid">
              {errors.content?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <div className="d-flex gap-2 justify-content-end mt-3 me-3">
            <Button type="submit" variant="primary" size="sm">
              Xác nhận
            </Button>
            <Button variant="secondary" size="sm" onClick={handleClose}>
              Hủy
            </Button>
            <button type="reset" id="reset" className="d-none" />
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export { MessagePopup };
