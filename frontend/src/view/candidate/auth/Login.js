import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import authApi from "../../../api/auth";
import { candAuthActions } from "../../../redux/slices/candAuthSlice";

const TEXT = {
  welcomeBack: "Ch\u00e0o m\u1eebng quay tr\u1edf l\u1ea1i",
  login: "\u0110\u0103ng nh\u1eadp",
  password: "M\u1eadt kh\u1ea9u",
  forgotPassword: "Qu\u00ean m\u1eadt kh\u1ea9u",
  invalidCredentials: "*Email ho\u1eb7c m\u1eadt kh\u1ea9u kh\u00f4ng ch\u00ednh x\u00e1c!",
};

function Login() {
  const { register, handleSubmit } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleLogin = async (user) => {
    user.role = 1;
    setIsLoading(true);
    await authApi
      .login(user)
      .then(async (res) => {
        localStorage.setItem("candidate_jwt", res.authorization.token);
        dispatch(candAuthActions.setCurrentCandidate(res.user));
        if (window.location.pathname === "/sign-up") {
          navigate("/");
        } else {
          const closeBtn = document.getElementById("closeBtn");
          closeBtn.click();
          document.querySelector("button.resetBtn").click();
        }
      })
      .catch(() => {
        setIsError(true);
      });
    setIsLoading(false);
  };

  return (
    <div className="modal fade" id="login-box">
      <div className="modal-dialog shadow">
        <div className="modal-content">
          <div className="modal-header border-0 pb-0">
            <div>
              <div className="app-soft-badge mb-2">{TEXT.welcomeBack}</div>
              <h3 className="modal-title">{TEXT.login}</h3>
            </div>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              id="closeBtn"
            ></button>
          </div>
          <div className="modal-body pt-3">
            <form onSubmit={handleSubmit(handleLogin)}>
              <div className="form-floating">
                <input
                  type="text"
                  className="form-control"
                  name="email"
                  {...register("email")}
                />
                <label htmlFor="email">Email</label>
              </div>
              <div className="form-floating mt-3">
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  {...register("password")}
                />
                <label htmlFor="password">{TEXT.password}</label>
              </div>
              <div className="text-center mt-3">
                <a href="/k" className="d-block mt-1 text-decoration-none">
                  {TEXT.forgotPassword}
                </a>
                <span className="text-danger">
                  {isError && <span>{TEXT.invalidCredentials}</span>}
                </span>
              </div>
              <div className="d-flex justify-content-end mt-3">
                <button
                  type="submit"
                  className="btn app-button-primary me-1 w-100 py-3"
                >
                  {isLoading && (
                    <span className="spinner-border spinner-border-sm" />
                  )}
                  &nbsp;{TEXT.login}
                </button>
                <button
                  type="reset"
                  className="resetBtn"
                  style={{ display: "none" }}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
