import { AiTwotoneAppstore } from "react-icons/ai";
import {
  BsBellFill,
  BsFillBriefcaseFill,
  BsFillPeopleFill,
  BsFillPersonFill,
  BsLightningChargeFill,
  BsSearch,
} from "react-icons/bs";
import { useNavigate, useLocation } from "react-router-dom";
import "./layout_style.css";
import { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import authApi from "../../../api/auth";
import { employerAuthActions } from "../../../redux/slices/employerAuthSlice";
import { AppContext } from "../../../App";
import clsx from "clsx";

const handleAmbientPointerMove = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--x", `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty("--y", `${event.clientY - rect.top}px`);
};

function Layout(props) {
  const nav = useNavigate();
  const location = useLocation();
  const { setCurrentPage } = useContext(AppContext);
  const company = useSelector((state) => state.employerAuth.current.employer);
  const dispatch = useDispatch();
  const activePath = location.pathname;

  const handleLogout = async () => {
    await authApi.logout(2);
    dispatch(employerAuthActions.logout());
    localStorage.removeItem("employer_jwt");
    nav("/employer/login");
  };

  const getMe = async () => {
    const res = await authApi.getMe(2);
    dispatch(employerAuthActions.setUser(res));
  };

  const handleChangePage = (url) => {
    nav(url);
    setCurrentPage(url);
  };

  useEffect(() => {
    setCurrentPage(activePath);
  }, [activePath, setCurrentPage]);

  useEffect(() => {
    if (!localStorage.getItem("employer_jwt")) {
      nav("/employer/login");
    } else {
      getMe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="employer-shell">
      <nav className="navbar employer-topbar px-4 py-3">
        <div>
          <div className="employer-brand">Recruitment Studio</div>
          <div className="employer-brand-subtitle">Employer Control Center</div>
        </div>
        <div className="employer-topbar__right">
          <div className="employer-topbar__quick" aria-hidden="true">
            <BsLightningChargeFill />
            <span>Live studio</span>
          </div>
          <div className="employer-topbar__icon" aria-hidden="true">
            <BsBellFill />
          </div>
          <div className="dropdown" style={{ cursor: "pointer" }}>
            <div className="employer-account dropdown-toggle" data-bs-toggle="dropdown">
              <div className="employer-account__avatar">
                <BsFillPersonFill />
              </div>
              <span>{company?.name ? company.name : "Company Account"}</span>
            </div>
            <ul className="dropdown-menu">
              <li className="dropdown-item" onClick={handleLogout}>
                Đăng xuất
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div className="employer-layout">
        <div className="menu-part ts-smd fw-500" onMouseMove={handleAmbientPointerMove}>
          <div className="menu-part__brand fw-500" onMouseMove={handleAmbientPointerMove}>
            <div className="menu-part__logo">
              <BsFillBriefcaseFill />
            </div>
            <div>
              <div className="menu-part__brand-name">{company?.name || "Doanh nghiệp"}</div>
              <div className="menu-part__status">
                <span />
                Online workspace
              </div>
            </div>
          </div>
          <div
            className={clsx("menu-part__item pointer", activePath === "/employer" && "is-active")}
            onMouseMove={handleAmbientPointerMove}
            onClick={() => handleChangePage("/employer")}
          >
            <AiTwotoneAppstore className="fs-5 me-1" />
            Dashboard
          </div>
          <div
            className={clsx(
              "menu-part__item pointer",
              activePath === "/employer/jobs" && "is-active"
            )}
            onMouseMove={handleAmbientPointerMove}
            onClick={() => handleChangePage("/employer/jobs")}
          >
            <BsFillBriefcaseFill className="ts-lg me-1" />
            Việc làm
          </div>
          <div
            className={clsx(
              "menu-part__item pointer",
              activePath === "/employer/candidates" && "is-active"
            )}
            onMouseMove={handleAmbientPointerMove}
            onClick={() => handleChangePage("/employer/candidates")}
          >
            <BsFillPeopleFill className="fs-5 me-1" />
            Hồ sơ ứng tuyển
          </div>
          <div
            className={clsx(
              "menu-part__item pointer",
              activePath === "/employer/candidate-search" && "is-active"
            )}
            onMouseMove={handleAmbientPointerMove}
            onClick={() => handleChangePage("/employer/candidate-search")}
          >
            <BsSearch className="fs-5 me-1" />
            Tìm ứng viên
          </div>
        </div>
        <div className="content-part page-body">{props.children}</div>
      </div>
    </div>
  );
}

export default Layout;
