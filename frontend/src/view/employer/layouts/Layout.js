import { AiTwotoneAppstore } from "react-icons/ai";
import {
  BsBellFill,
  BsBuildings,
  BsCreditCard2Front,
  BsFillBriefcaseFill,
  BsFillPeopleFill,
  BsFillPersonFill,
  BsLightningChargeFill,
  BsPersonPlusFill,
  BsSearch,
} from "react-icons/bs";
import { useNavigate, useLocation } from "react-router-dom";
import { useContext, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import clsx from "clsx";
import authApi from "../../../api/auth";
import { employerAuthActions } from "../../../redux/slices/employerAuthSlice";
import { AppContext } from "../../../App";
import "./layout_style.css";

const handleAmbientPointerMove = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--x", `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty("--y", `${event.clientY - rect.top}px`);
};

function Layout(props) {
  const nav = useNavigate();
  const location = useLocation();
  const { setCurrentPage } = useContext(AppContext);
  const current = useSelector((state) => state.employerAuth.current || {});
  const company = current.employer;
  const permissions = current.permissions || {};
  const dispatch = useDispatch();
  const activePath = location.pathname;

  const hasPermission = (key, fallback = false) => Boolean(permissions[key] ?? fallback);
  const permissionsLoaded = Object.keys(permissions).length > 0;

  const menuItems = useMemo(
    () =>
      [
        {
          path: "/employer",
          label: "Dashboard",
          icon: <AiTwotoneAppstore className="fs-5 me-1" />,
          visible: true,
        },
        {
          path: "/employer/jobs",
          label: "Việc làm",
          icon: <BsFillBriefcaseFill className="ts-lg me-1" />,
          visible: hasPermission("view_jobs", true),
        },
        {
          path: "/employer/branches",
          label: "Chi nhánh",
          icon: <BsBuildings className="fs-5 me-1" />,
          visible: hasPermission("view_branches"),
        },
        {
          path: "/employer/members",
          label: "Tài khoản HR",
          icon: <BsPersonPlusFill className="fs-5 me-1" />,
          visible: hasPermission("view_members"),
        },
        {
          path: "/employer/candidates",
          label: "Hồ sơ ứng tuyển",
          icon: <BsFillPeopleFill className="fs-5 me-1" />,
          visible: hasPermission("view_applications", true),
        },
        {
          path: "/employer/candidate-search",
          label: "Tìm ứng viên",
          icon: <BsSearch className="fs-5 me-1" />,
          visible: hasPermission("search_candidates"),
        },
        {
          path: "/employer/billing",
          label: "Thanh toán",
          icon: <BsCreditCard2Front className="fs-5 me-1" />,
          visible: hasPermission("manage_billing"),
        },
      ].filter((item) => item.visible),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [permissions]
  );

  const handleLogout = async () => {
    try {
      await authApi.logout(2);
    } finally {
      dispatch(employerAuthActions.logout());
      localStorage.removeItem("employer_jwt");
      nav("/employer/login", { replace: true });
    }
  };

  const getMe = async () => {
    try {
      const res = await authApi.getMe(2);
      dispatch(employerAuthActions.setUser(res));
    } catch (error) {
      dispatch(employerAuthActions.logout());
      localStorage.removeItem("employer_jwt");
      nav("/employer/login", { replace: true });
    }
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
      nav("/employer/login", { replace: true });
      return;
    }

    getMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!permissionsLoaded) return;

    const routeVisible = menuItems.some((item) => item.path === activePath);
    if (!routeVisible) {
      nav("/employer", { replace: true });
    }
  }, [activePath, menuItems, nav, permissionsLoaded]);

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
              <span>{company?.name || "Company Account"}</span>
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

          {menuItems.map((item) => (
            <div
              key={item.path}
              className={clsx("menu-part__item pointer", activePath === item.path && "is-active")}
              onMouseMove={handleAmbientPointerMove}
              onClick={() => handleChangePage(item.path)}
            >
              {item.icon}
              {item.label}
            </div>
          ))}
        </div>
        <div className="content-part page-body">{props.children}</div>
      </div>
    </div>
  );
}

export default Layout;
