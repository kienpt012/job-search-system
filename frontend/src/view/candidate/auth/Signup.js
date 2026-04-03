import { useForm } from "react-hook-form";
import { AiFillWarning } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import authApi from "../../../api/auth";
import "../custom.css";

function Signup() {
  const requiredField = <span className="text-danger fw-bold">*</span>;
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm();
  const navigate = useNavigate();

  const AlertMsg = ({ msg }) => (
    <div className="d-flex justify-content-start">
      <span className="text-danger text-start" style={{ fontSize: "15px" }}>
        <span className="h5">
          <AiFillWarning />
        </span>
        <span className="ms-1">{msg}</span>
      </span>
    </div>
  );

  const onSubmit = async (userInfo) => {
    try {
      await authApi.register(userInfo);
      alert('Đăng ký thành công!\nNhấn "OK" để quay về trang chủ');
      if (window.location.pathname === "/sign-up") {
        navigate("/");
      }
    } catch (error) {
      alert("Email đã tồn tại trong hệ thống!");
    }
  };

  return (
    <div className="page-section">
      <div className="hero-panel mb-4">
        <div className="row g-4 align-items-center">
          <div className="col-lg-6">
            <div className="app-pill mb-3 bg-white text-dark">Tạo tài khoản mới</div>
            <h1 className="display-6 fw-800 mb-3">Bắt đầu hành trình ứng tuyển</h1>
            <p className="text-white-50">
              Tài khoản giúp bạn lưu hồ sơ, theo dõi tiến trình ứng tuyển và nhận thông
              báo từ nhà tuyển dụng.
            </p>
          </div>
          <div className="col-lg-6">
            <div className="section-card2">
              <div className="pt-1 text-center mb-3">
                <strong style={{ fontSize: "22px" }}>Đăng ký</strong>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="d-flex mb-2">
                  <div className="me-2">
                    <label htmlFor="lastname" className="d-flex form-label">
                      Họ{requiredField}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      {...register("lastname", { required: true })}
                      id="lastname"
                      name="lastname"
                      placeholder="Họ..."
                    />
                  </div>
                  <div>
                    <label htmlFor="firstname" className="d-flex form-label">
                      Tên{requiredField}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      {...register("firstname", { required: true })}
                      id="firstname"
                      name="firstname"
                      placeholder="Tên..."
                    />
                  </div>
                </div>
                {errors.lastname || errors.firstname ? (
                  <AlertMsg msg="Hãy nhập đầy đủ họ, tên" />
                ) : null}

                <div className="mb-2">
                  <label htmlFor="su_email" className="d-flex form-label">
                    Email{requiredField}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    {...register("email", {
                      required: true,
                      pattern:
                        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
                    })}
                    id="su_email"
                    name="email"
                    placeholder="Email..."
                  />
                </div>
                {errors.email?.type === "required" && <AlertMsg msg="Hãy nhập email" />}
                {errors.email?.type === "pattern" && (
                  <AlertMsg msg="Email không đúng định dạng" />
                )}

                <div className="mb-2">
                  <label htmlFor="su_pswd" className="d-flex form-label">
                    Mật khẩu{requiredField}
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    {...register("password", {
                      required: true,
                      pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                    })}
                    id="su_pswd"
                    name="password"
                    placeholder="Mật khẩu..."
                  />
                </div>
                {errors.password?.type === "required" && (
                  <AlertMsg msg="Hãy nhập mật khẩu" />
                )}
                {errors.password?.type === "pattern" && (
                  <AlertMsg msg="Mật khẩu phải có ít nhất 8 ký tự và chứa ít nhất một chữ cái viết hoa, một chữ cái viết thường và một số" />
                )}

                <div className="mb-2">
                  <label htmlFor="re_pswd" className="d-flex form-label">
                    Nhập lại mật khẩu{requiredField}
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    {...register("re_password", {
                      required: true,
                    })}
                    id="re_pswd"
                    name="re_password"
                    placeholder="Nhập lại mật khẩu..."
                  />
                </div>
                {!errors.password && errors.re_password?.type === "required" && (
                  <AlertMsg msg="Không được để trống" />
                )}
                {!errors.password &&
                watch("re_password") !== "" &&
                watch("password") !== watch("re_password") ? (
                  <AlertMsg msg="Mật khẩu nhập lại không khớp" />
                ) : null}

                <div className="mt-4">
                  <button
                    type="submit"
                    className="btn app-button-primary d-block mx-auto px-5 py-3"
                  >
                    Gửi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
