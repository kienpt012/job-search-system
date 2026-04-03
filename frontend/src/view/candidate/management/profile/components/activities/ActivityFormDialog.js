import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { Form, Stack, Button } from "react-bootstrap";
import RequiredMark from "../../../../../../components/form/requiredMark/RequiredMark";
import Modal from "react-bootstrap/Modal";
import activityApi from "../../../../../../api/activity";
import { useEffect, useState } from "react";

export default function ActivityFormDialog({
  actType,
  setActType,
  current,
  getAll,
}) {
  const [isPresent, setIsPresent] = useState(false);
  const requiredMsg = "Không được để trống";
  const schema = yup.object({
    organization: yup.string().required(requiredMsg),
    role: yup.string().required(requiredMsg),
    description: yup.string().required(requiredMsg),
    start_date: yup.string().required("Vui lòng chọn"),
    end_date: !isPresent && yup.string().required("Vui lòng chọn"),
  });
  const {
    register,
    watch,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: yupResolver(schema),
  });
  useEffect(() => {
    if (watch("is_present")) {
      setIsPresent(true);
      document.getElementById("end-date").value = null;
    } else setIsPresent(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch("is_present")]);

  const onSubmit = async (data) => {
    console.log({ data });
    if (actType === "ADD") {
      await activityApi.create(data);
      alert("Tạo mới thành công!");
      await getAll();
      setActType("VIEW");
    }
    if (actType === "EDIT") {
      await activityApi.update(current.id, data);
      alert("Cập nhật thành công!");
      await getAll();
      setActType("VIEW");
    }
  };

  return (
    <Modal
      show={actType !== "VIEW"}
      onHide={() => setActType("VIEW")}
      centered
      size="lg"
      fullscreen="md-down"
    >
      <Modal.Header closeButton>
        <Modal.Title>Hoạt động</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate onSubmit={handleSubmit(onSubmit)}>
          <div>
            <div className="row row-cols-md-2 row-cols-sm-1">
              <Form.Group className="mt-2">
                <Form.Label className="fw-600">Tên tổ chức</Form.Label>
                <RequiredMark />
                <Form.Control
                  size="sm"
                  type="text"
                  defaultValue={
                    actType === "EDIT" ? current.organization : null
                  }
                  {...register("organization")}
                  isInvalid={errors.organization}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.organization?.message}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mt-2">
                <Form.Label className="fw-600">Vai trò</Form.Label>
                <RequiredMark />
                <Form.Control
                  size="sm"
                  type="text"
                  defaultValue={actType === "EDIT" ? current.role : null}
                  {...register("role")}
                  isInvalid={errors.role}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.role?.message}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mt-2">
                <Form.Label className="fw-600">Thời gian bắt đầu</Form.Label>
                <RequiredMark />
                <Form.Control
                  size="sm"
                  type="date"
                  {...register("start_date")}
                  defaultValue={actType === "EDIT" ? current.start_date : null}
                  isInvalid={errors.start_date}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.start_date?.message}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mt-2">
                <Form.Label className="fw-600">Thời gian kết thúc</Form.Label>
                <RequiredMark />
                <Form.Control
                  id="end-date"
                  size="sm"
                  type="date"
                  {...register("end_date")}
                  defaultValue={actType === "EDIT" ? current.end_date : null}
                  disabled={watch("is_present")}
                  isInvalid={!watch("is_present") && errors.end_date}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.end_date?.message}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mt-2">
                <Form.Label></Form.Label>
                <Form.Check
                  type="checkbox"
                  label="Vẫn đang hoạt động"
                  defaultChecked={actType === "EDIT" && current.is_present}
                  {...register("is_present")}
                />
              </Form.Group>
              <Form.Group className="mt-2">
                <Form.Label className="fw-600">Liên kết</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  defaultValue={actType === "EDIT" ? current.link : null}
                  {...register("link")}
                />
              </Form.Group>
            </div>
            <Form.Group className="mt-2">
              <Form.Label className="fw-600">Mô tả hoạt động</Form.Label>
              <RequiredMark />
              <Form.Control
                as={"textarea"}
                rows={5}
                size="sm"
                defaultValue={actType === "EDIT" ? current.description : null}
                {...register("description")}
                isInvalid={errors.description}
              />
              <Form.Control.Feedback type="invalid">
                {errors.description?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </div>
          <Stack direction="horizontal" gap={3} className="mt-3">
            <Button
              variant="outline-primary"
              size="sm"
              type="submit"
              className="ms-auto"
            >
              Lưu
            </Button>
            <Button
              variant="danger"
              size="sm"
              type="reset"
              className="me-3"
              onClick={() => setActType("VIEW")}
            >
              Hủy
            </Button>
          </Stack>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
