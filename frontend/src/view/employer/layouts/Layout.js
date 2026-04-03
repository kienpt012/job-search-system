import { AiTwotoneAppstore } from "react-icons/ai";
import {
  BsFillBriefcaseFill,
  BsFillPeopleFill,
  BsFillPersonFill,
} from "react-icons/bs";
import { useNavigate, useLocation } from "react-router-dom";
import "./layout_style.css";
import { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import authApi from "../../../api/auth";
import { employerAuthActions } from "../../../redux/slices/employerAuthSlice";
import { AppContext } from "../../../App";
import clsx from "clsx";

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
        <div className="employer-brand">Recruitment Studio</div>
        <div className="dropdown" style={{ cursor: "pointer" }}>
          <div
            className="d-flex align-items-center me-1 dropdown-toggle fw-600"
            data-bs-toggle="dropdown"
          >
            <BsFillPersonFill style={{ fontSize: "24px" }} />
            <span className="ms-2">
              {company?.name ? company.name : "Company Account"}
            </span>
          </div>
          <ul className="dropdown-menu">
            <li className="dropdown-item" onClick={handleLogout}>
              Đăng xuất
            </li>
          </ul>
        </div>
      </nav>
      <div className="employer-layout">
        <div className="menu-part ts-smd fw-500">
          <div className="menu-part__brand fw-500">{company?.name || "Doanh nghiệp"}</div>
          <div
            className={clsx("menu-part__item pointer", activePath === "/employer" && "is-active")}
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
            onClick={() => handleChangePage("/employer/candidates")}
          >
            <BsFillPeopleFill className="fs-5 me-1" /> Ứng viên
          </div>
        </div>
        <div className="content-part page-body">{props.children}</div>
      </div>
    </div>
  );
}

export default Layout;
