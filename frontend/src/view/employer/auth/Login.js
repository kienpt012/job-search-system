import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  BsArrowRight,
  BsBriefcaseFill,
  BsBuildings,
  BsCheckCircleFill,
  BsEnvelope,
  BsEye,
  BsEyeSlash,
  BsLock,
  BsPeopleFill,
  BsShieldCheck,
} from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import authApi from "../../../api/auth";
import { employerAuthActions } from "../../../redux/slices/employerAuthSlice";
import "./login.css";

function Login() {
  const requiredMark = <span className="employer-login__required"> *</span>;
  const requiredError = <div className="employer-login__field-error">Vui lòng nhập thông tin.</div>;
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();
  const [isView, setIsView] = useState(false);
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate();
  const dispatch = useDispatch();

  const hydrateEmployerSession = async (loginPayload) => {
    if (loginPayload?.user) {
      dispatch(employerAuthActions.setUser(loginPayload.user));
    }

    const profile = await authApi.getMe(2);
    dispatch(employerAuthActions.setUser(profile));
    nav("/employer", { replace: true });
  };

  const onSubmit = async (inf) => {
    setMsg("");
    setIsLoading(true);

    try {
      const payload = { ...inf, role: 2 };
      const res = await authApi.login(payload);
      const token = res?.authorization?.token;

      if (!token) {
        throw new Error("Missing employer token");
      }

      localStorage.setItem("employer_jwt", token);
      await hydrateEmployerSession(res);
      toast.success("Đăng nhập thành công.");
    } catch (error) {
      localStorage.removeItem("employer_jwt");
      dispatch(employerAuthActions.logout());
      setMsg(
        error?.response?.data?.message === "Account is locked"
          ? "Tài khoản đã bị khóa."
          : "Email hoặc mật khẩu không chính xác."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("employer_jwt")) return;

    hydrateEmployerSession().catch(() => {
      localStorage.removeItem("employer_jwt");
      dispatch(employerAuthActions.logout());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="employer-login-page">
      <section className="employer-login-shell" aria-label="Đăng nhập nhà tuyển dụng">
        <aside className="employer-login-panel">
          <Link to="/" className="employer-login-brand">
            <span>
              <BsBriefcaseFill />
            </span>
            <div>
              <strong>Recruitment Studio</strong>
              <small>Employer control center</small>
            </div>
          </Link>

          <div className="employer-login-panel__copy">
            <span className="employer-login-kicker">
              <BsShieldCheck />
              Khu vực nhà tuyển dụng
            </span>
            <h1>Quản lý tuyển dụng theo công ty, chi nhánh và đội HR.</h1>
            <p>
              Đăng nhập để theo dõi tin tuyển dụng, hồ sơ ứng tuyển, phân quyền HR và hiệu suất từng chi nhánh.
            </p>
          </div>

          <div className="employer-login-metrics" aria-label="Tóm tắt chức năng">
            <div>
              <BsBuildings />
              <strong>Đa chi nhánh</strong>
              <span>Quản lý dữ liệu theo phạm vi được phân quyền.</span>
            </div>
            <div>
              <BsPeopleFill />
              <strong>Ứng viên phù hợp</strong>
              <span>Theo dõi hồ sơ và gợi ý match theo từng job.</span>
            </div>
          </div>
        </aside>

        <section className="employer-login-card">
          <div className="employer-login-card__head">
            <span className="employer-login-card__icon">
              <BsCheckCircleFill />
            </span>
            <div>
              <h2>Đăng nhập nhà tuyển dụng</h2>
              <p>Dùng tài khoản công ty, quản lý chi nhánh hoặc HR đã được cấp quyền.</p>
            </div>
          </div>

          <form className="employer-login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <label className="employer-login-field" htmlFor="email">
              <span>Email{requiredMark}</span>
              <div className="employer-login-input">
                <BsEnvelope />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="tencongty@example.com"
                  {...register("email", { required: true })}
                />
              </div>
              {errors.email && requiredError}
            </label>

            <label className="employer-login-field" htmlFor="password">
              <span>Mật khẩu{requiredMark}</span>
              <div className="employer-login-input">
                <BsLock />
                <input
                  id="password"
                  type={isView ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu"
                  {...register("password", { required: true })}
                />
                <button
                  type="button"
                  className="employer-login-password-toggle"
                  onClick={() => setIsView(!isView)}
                  aria-label={isView ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {isView ? <BsEyeSlash /> : <BsEye />}
                </button>
              </div>
              {errors.password && requiredError}
            </label>

            {msg && <div className="employer-login-alert">{msg}</div>}

            <button type="submit" className="employer-login-submit" disabled={isLoading}>
              <span>{isLoading ? "Đang đăng nhập..." : "Đăng nhập"}</span>
              {isLoading ? <span className="employer-login-spinner" /> : <BsArrowRight />}
            </button>

            <div className="employer-login-support">
              <Link to="#" className="employer-login-link">
                Quên mật khẩu?
              </Link>
            </div>

            <div className="employer-login-register">
              <span>Bạn là nhà tuyển dụng mới?</span>
              <Link to="/employer/register">
                Đăng ký tài khoản <BsArrowRight />
              </Link>
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}

export default Login;
