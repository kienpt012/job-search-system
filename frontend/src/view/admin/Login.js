import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { BsShieldLockFill } from "react-icons/bs";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import authApi from "../../api/auth";
import { adminAuthActions } from "../../redux/slices/adminAuthSlice";
import "./layout.css";

export default function AdminLogin() {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const [isViewPassword, setIsViewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (localStorage.getItem("admin_jwt")) {
      nav("/admin");
    }
  }, [nav]);

  const onSubmit = async (values) => {
    setMessage("");
    setIsLoading(true);

    try {
      const res = await authApi.login({ ...values, role: 0 });
      localStorage.setItem("admin_jwt", res.authorization.token);
      const currentAdmin = await authApi.getMe(0);
      dispatch(adminAuthActions.setUser(currentAdmin));
      toast.success("Đăng nhập quản trị thành công.");
      nav("/admin");
    } catch (error) {
      setMessage(
        error?.response?.data?.message === "Account is locked"
          ? "Tài khoản quản trị đang bị khóa."
          : "Email hoặc mật khẩu không chính xác."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-card">
        <div className="admin-auth-card__badge">
          <BsShieldLockFill />
        </div>
        <div className="admin-auth-card__eyebrow">Administration</div>
        <h1>Đăng nhập quản trị hệ thống</h1>
        <p>Quản lý doanh nghiệp, người dùng, khóa tài khoản và xóa dữ liệu liên quan.</p>

        <form className="admin-auth-form" onSubmit={handleSubmit(onSubmit)}>
          <label>
            <span>Email quản trị</span>
            <input
              type="email"
              placeholder="admin@example.com"
              {...register("email", { required: true })}
            />
            {errors.email && <small>Vui lòng nhập email.</small>}
          </label>

          <label>
            <span>Mật khẩu</span>
            <div className="admin-password-field">
              <input
                type={isViewPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                {...register("password", { required: true })}
              />
              <button
                type="button"
                onClick={() => setIsViewPassword((value) => !value)}
                className="admin-password-field__toggle"
              >
                {isViewPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
              </button>
            </div>
            {errors.password && <small>Vui lòng nhập mật khẩu.</small>}
          </label>

          {message && <div className="admin-auth-form__error">{message}</div>}

          <button type="submit" className="admin-primary-btn admin-auth-form__submit">
            Đăng nhập
            {isLoading && <span className="spinner-border spinner-border-sm ms-2" />}
          </button>
        </form>
      </div>
    </div>
  );
}
