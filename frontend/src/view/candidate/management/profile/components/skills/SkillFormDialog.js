import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { Form, Stack, Button } from "react-bootstrap";
import RequiredMark from "../../../../../../components/form/requiredMark/RequiredMark";
import Modal from "react-bootstrap/Modal";
import skillApi from "../../../../../../api/skill";
import { IoMdStar, IoMdStarOutline } from "react-icons/io";

export default function SkillFormDialog({
  actType,
  setActType,
  current,
  getAll,
}) {
  const requiredMsg = "Không được để trống";
  const schema = yup.object({
    name: yup.string().required(requiredMsg),
  });
  const {
    register,
    watch,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    console.log({ data });
    if (actType === "ADD") {
      await skillApi.create(data);
      alert("Tạo mới thành công!");
      await getAll();
      setActType("VIEW");
    }
    if (actType === "EDIT") {
      await skillApi.update(current.id, data);
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
      size="md"
      fullscreen="sm-down"
    >
      <Modal.Header closeButton>
        <Modal.Title>Kỹ năng</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Form.Group className="mt-2">
              <Form.Label className="fw-600">Tên kỹ năng</Form.Label>
              <RequiredMark />
              <Form.Control
                size="sm"
                type="text"
                defaultValue={actType === "EDIT" ? current.name : null}
                {...register("name")}
                isInvalid={errors.name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name?.message}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label className="fw-600">Mức độ thành thạo</Form.Label>
              <Form.Select
                className="d-inline ms-3"
                size="sm"
                {...register("proficiency")}
                style={{ width: "20%" }}
                defaultValue={actType === "EDIT" && current.proficiency}
              >
                {Array.from({ length: 6 }, (_, ind) => (
                  <option value={ind} key={"proficiency" + ind}>
                    {ind}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Stack direction="horizontal">
              {Array.from({ length: 5 }, (_, ind) => {
                if (!watch("proficiency") && actType === "EDIT") {
                  return (
                    <span key={ind}>
                      {ind <= current?.proficiency - 1 ? (
                        <IoMdStar
                          className="fs-3"
                          style={{ color: "orange" }}
                        />
                      ) : (
                        <IoMdStarOutline
                          className="fs-3"
                          style={{ color: "orange" }}
                        />
                      )}
                    </span>
                  );
                } else
                  return (
                    <span key={ind}>
                      {ind <= watch("proficiency") - 1 ? (
                        <IoMdStar
                          className="fs-3"
                          style={{ color: "orange" }}
                        />
                      ) : (
                        <IoMdStarOutline
                          className="fs-3"
                          style={{ color: "orange" }}
                        />
                      )}
                    </span>
                  );
              })}
            </Stack>
            <Form.Group className="mt-2">
              <Form.Label className="fw-600">Mô tả chi tiết</Form.Label>
              <Form.Control
                as={"textarea"}
                rows={5}
                size="sm"
                defaultValue={actType === "EDIT" ? current.description : null}
                {...register("description")}
              />
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
