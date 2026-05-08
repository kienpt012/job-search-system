import { useEffect } from "react";
import {
  BsBarChartFill,
  BsBoxArrowRight,
  BsBriefcaseFill,
  BsImages,
  BsShieldLockFill,
  BsTagsFill,
} from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import authApi from "../../api/auth";
import { adminAuthActions } from "../../redux/slices/adminAuthSlice";
import "./layout.css";

const TEXT = {
  eyebrow: "System admin",
  title: "Recruitment Control",
  dashboard: "B\u1ea3ng \u0111i\u1ec1u khi\u1ec3n",
  jobs: "Qu\u1ea3n l\u00fd vi\u1ec7c l\u00e0m",
  skills: "Th\u01b0 vi\u1ec7n k\u1ef9 n\u0103ng",
  appearance: "Giao di\u1ec7n",
  loggedInAs: "\u0110\u0103ng nh\u1eadp v\u1edbi",
  logout: "\u0110\u0103ng xu\u1ea5t",
};

export default function AdminLayout({ children }) {
  const nav = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const admin = useSelector((state) => state.adminAuth.current);

  const loadCurrentAdmin = async () => {
    try {
      const res = await authApi.getMe(0);
      dispatch(adminAuthActions.setUser(res));
    } catch (error) {
      dispatch(adminAuthActions.logout());
      localStorage.removeItem("admin_jwt");
      nav("/admin/login");
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout(0);
    } catch (error) {
      // ignore logout transport errors
    }

    dispatch(adminAuthActions.logout());
    localStorage.removeItem("admin_jwt");
    nav("/admin/login");
  };

  useEffect(() => {
    if (!localStorage.getItem("admin_jwt")) {
      nav("/admin/login");
      return;
    }

    loadCurrentAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <span className="admin-sidebar__logo">
            <BsShieldLockFill />
          </span>
          <div>
            <div className="admin-sidebar__eyebrow">{TEXT.eyebrow}</div>
            <div className="admin-sidebar__title">{TEXT.title}</div>
          </div>
        </div>

        <button
          type="button"
          className={`admin-sidebar__link ${
            location.pathname === "/admin" ? "is-active" : ""
          }`}
          onClick={() => nav("/admin")}
        >
          <BsBarChartFill />
          <span>{TEXT.dashboard}</span>
        </button>

        <button
          type="button"
          className={`admin-sidebar__link ${
            location.pathname === "/admin/skills" ? "is-active" : ""
          }`}
          onClick={() => nav("/admin/skills")}
        >
          <BsTagsFill />
          <span>{TEXT.skills}</span>
        </button>

        <button
          type="button"
          className={`admin-sidebar__link ${
            location.pathname === "/admin/jobs" ? "is-active" : ""
          }`}
          onClick={() => nav("/admin/jobs")}
        >
          <BsBriefcaseFill />
          <span>{TEXT.jobs}</span>
        </button>

        <button
          type="button"
          className={`admin-sidebar__link ${
            location.pathname === "/admin/appearance" ? "is-active" : ""
          }`}
          onClick={() => nav("/admin/appearance")}
        >
          <BsImages />
          <span>{TEXT.appearance}</span>
        </button>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__account">
            <div className="admin-sidebar__account-label">{TEXT.loggedInAs}</div>
            <div className="admin-sidebar__account-email">
              {admin?.email || "admin"}
            </div>
          </div>
          <button type="button" className="admin-ghost-btn" onClick={handleLogout}>
            <BsBoxArrowRight />
            <span>{TEXT.logout}</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  );
}
