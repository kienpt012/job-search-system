import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { Form, Stack, Button } from "react-bootstrap";
import RequiredMark from "../../../../../../components/form/requiredMark/RequiredMark";
import Modal from "react-bootstrap/Modal";
import { useEffect, useState } from "react";
import clsx from "clsx";
import prizeApi from "../../../../../../api/prize";
import AppImage from "../../../../../../components/AppImage";
import { resolveImageUrl } from "../../../../../../utils/image";

export default function PrizeFormDialog({
  actType,
  setActType,
  current,
  getAll,
}) {
  const requiredMsg = "Không được để trống";
  const schema = yup.object({
    name: yup.string().required(requiredMsg),
    receive_date: yup.string().required("Vui lòng chọn"),
  });
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: yupResolver(schema),
  });
  const [hasImg, setHasImg] = useState(false);
  const [isDeleteImg, setIsDeleteImg] = useState(false);
  // useEffect(() => {
  //   console.log("has img::", hasImg);
  // }, [hasImg]);

  const handleDisplayImg = (e) => {
    setHasImg(true);
    setIsDeleteImg(false);
    var reader = new FileReader();
    reader.onload = () => {
      var output = document.getElementById("upload-img");
      output.src = reader.result;
    };
    reader.readAsDataURL(e.target.files[0]);
  };
  const handleDeleteImg = () => {
    setHasImg(false);
    setIsDeleteImg(true);
  };
  useEffect(() => {
    if (actType === "EDIT" && current.image) setHasImg(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data) => {
    console.log({ data });

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("receive_date", data.receive_date);
    if (hasImg) {
      formData.append("image", data.image[0]);
    }    
    if (isDeleteImg) {
      formData.append("delete_img", 1);      
    }

    if (actType === "ADD") {
      await prizeApi.create(formData);
      alert("Tạo mới thành công!");
      await getAll();
      setActType("VIEW");
    }
    if (actType === "EDIT") {
      await prizeApi.update(current.id, formData);
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
        <Modal.Title>Giải thưởng</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Form.Group className="mt-2">
              <Form.Label className="fw-600">Tên giải thưởng</Form.Label>
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
            <div className="row row-cols-md-2 row-cols-sm-1">
              <Form.Group className="mt-2">
                <Form.Label className="fw-600">Ngày nhận</Form.Label>
                <RequiredMark />
                <Form.Control
                  size="sm"
                  type="date"
                  {...register("receive_date")}
                  defaultValue={
                    actType === "EDIT" ? current.receive_date : null
                  }
                  isInvalid={errors.receive_date}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.receive_date?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </div>
            <form>
              <Form.Group className="mt-2" style={{ width: "40%" }}>
                <Form.Label className="fw-600">Tải lên ảnh</Form.Label>
                <Form.Control
                  size="sm"
                  type="file"
                  {...register("image")}
                  onChange={(e) => handleDisplayImg(e)}
                />
              </Form.Group>
              <Button
                type="reset"
                variant="outline-danger"
                size="sm"
                className="mt-2"
                onClick={handleDeleteImg}
              >
                Xóa ảnh
              </Button>
            </form>
            {hasImg && (
              <AppImage
                id="upload-img"
                className={clsx("mt-3 border border-2 rounded")}
                src={
                  actType === "EDIT" && current.image
                    ? resolveImageUrl(current.image)
                    : null
                }
                alt=""
                width="50%"
                height="auto"
              />
            )}
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
