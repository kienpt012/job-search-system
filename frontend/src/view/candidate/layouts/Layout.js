import "bootstrap/dist/js/bootstrap.js";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { BsBell, BsFillCircleFill } from "react-icons/bs";
import "./layout.css";
import { useDispatch, useSelector } from "react-redux";
import authApi from "../../../api/auth";
import candMsgApi from "../../../api/candidateMessage";
import { candAuthActions } from "../../../redux/slices/candAuthSlice";
import Login from "../auth/Login";
import Pusher from "pusher-js";
import BellDialog from "./BellDialog";
import { AppContext } from "../../../App";
import clsx from "clsx";
import AppImage from "../../../components/AppImage";

const TEXT = {
  home: "Trang ch\u1ee7",
  companies: "C\u00f4ng ty",
  jobs: "Vi\u1ec7c l\u00e0m",
  login: "\u0110\u0103ng nh\u1eadp",
  signup: "\u0110\u0103ng k\u00fd",
  employerArea: "\u0110\u0103ng tuy\u1ec3n, t\u00ecm \u1ee9ng vi\u00ean",
  noNotification: "Kh\u00f4ng c\u00f3 th\u00f4ng b\u00e1o n\u00e0o",
  account: "T\u00e0i kho\u1ea3n",
  logout: "\u0110\u0103ng xu\u1ea5t",
  footerIntro:
    "N\u1ec1n t\u1ea3ng k\u1ebft n\u1ed1i doanh nghi\u1ec7p v\u1edbi \u1ee9ng vi\u00ean theo m\u1ed9t tr\u1ea3i nghi\u1ec7m tr\u1ef1c quan, nhanh v\u00e0 s\u1ea1ch h\u01a1n.",
  contact: "Li\u00ean h\u1ec7",
  explore: "Kh\u00e1m ph\u00e1",
  phone: "\u0110i\u1ec7n tho\u1ea1i",
  companyList: "Danh s\u00e1ch c\u00f4ng ty",
  jobList: "Danh s\u00e1ch vi\u1ec7c l\u00e0m",
  employerZone: "Khu v\u1ef1c nh\u00e0 tuy\u1ec3n d\u1ee5ng",
  footerAddressLine1: "06 Tr\u1ea7n V\u0103n \u01a0n, Ph\u00fa H\u00f2a,",
  footerAddressLine2: "Th\u1ee7 D\u1ea7u M\u1ed9t, B\u00ecnh D\u01b0\u01a1ng",
  copyright: "\u00a9 2026 Recruitment. All rights reserved.",
};

const derivePageKey = (pathname) => {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/companies")) return "companies";
  if (pathname.startsWith("/jobs")) return "jobs";
  return "";
};

function Layout(props) {
  const nav = useNavigate();
  const location = useLocation();
  const [bellMsgs, setBellMsgs] = useState([]);
  const [msgStyles, setMsgStyles] = useState([]);
  const [hasNew, setHasNew] = useState(false);
  const [showBellDialog, setShowBellDialog] = useState(false);
  const [showListMsg, setShowListMsg] = useState(false);
  const [curNotification, setCurNotification] = useState({});
  const { currentPage, setCurrentPage } = useContext(AppContext);

  const dispatch = useDispatch();
  const candidate = useSelector((state) => state.candAuth.current);
  const isAuth = useSelector((state) => state.candAuth.isAuth);

  const candidateName = useMemo(
    () =>
      [candidate?.lastname, candidate?.firstname]
        .filter(Boolean)
        .join(" ")
        .trim() || "User",
    [candidate]
  );

  const handleLogout = async () => {
    await authApi.logout(1);
    dispatch(candAuthActions.logout());
    localStorage.removeItem("candidate_jwt");
    nav("/");
  };

  const getAllMessages = useCallback(async () => {
    if (!candidate?.id) return;
    const res = await candMsgApi.getMsgs(candidate.id);
    setBellMsgs(res);
  }, [candidate?.id]);

  const handleReadMsg = async (inf) => {
    setShowBellDialog(true);
    setCurNotification(inf);
    if (inf.isRead === 0) {
      await candMsgApi.markAsRead(inf.id);
      const nextMessages = [...bellMsgs];
      for (let i = 0; i < nextMessages.length; i += 1) {
        if (nextMessages[i].id === inf.id) {
          nextMessages[i].isRead = 1;
        }
      }
      setBellMsgs(nextMessages);
    }
  };

  useEffect(() => {
    const nextPageKey = derivePageKey(location.pathname);
    if (nextPageKey) {
      setCurrentPage(nextPageKey);
    }
  }, [location.pathname, setCurrentPage]);

  useEffect(() => {
    let nextHasNew = false;
    const nextStyles = bellMsgs.map((item) => {
      if (item.isRead === 0) {
        nextHasNew = true;
      }
      return item.isRead === 0 ? " text-primary" : " text-secondary";
    });

    setHasNew(nextHasNew);
    setMsgStyles(nextStyles);
  }, [bellMsgs]);

  useEffect(() => {
    const getMe = async () => {
      try {
        const res = await authApi.getMe(1);
        dispatch(candAuthActions.setCurrentCandidate(res));
      } catch (error) {
        localStorage.removeItem("candidate_jwt");
        dispatch(candAuthActions.logout());
      }
    };

    if (localStorage.getItem("candidate_jwt")) {
      getMe();
    }
  }, [dispatch]);

  useEffect(() => {
    if (!isAuth || !candidate?.id) return undefined;

    getAllMessages();
    const pusher = new Pusher("5b0ac1136aca9c77eadb", {
      cluster: "ap1",
      encrypted: true,
    });
    const channel = pusher.subscribe(`candidate-channel_${candidate.id}`);
    channel.bind("notification-event", () => {
      getAllMessages();
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`candidate-channel_${candidate.id}`);
      pusher.disconnect();
    };
  }, [candidate?.id, getAllMessages, isAuth]);

  return (
    <>
      <BellDialog
        show={showBellDialog}
        setShow={setShowBellDialog}
        current={curNotification}
      />
      <header className="site-header">
        <div className="app-shell">
          <div className="site-navbar">
            <Link
              className="nav-link site-brand"
              to="/"
              onClick={() => setCurrentPage("home")}
            >
              Recruit<span>ment</span>
            </Link>
            <nav className="site-nav">
              <Link
                className={clsx(
                  "nav-link site-nav-link",
                  currentPage === "home" && "is-active"
                )}
                to="/"
                onClick={() => setCurrentPage("home")}
              >
                {TEXT.home}
              </Link>
              <Link
                className={clsx(
                  "nav-link site-nav-link",
                  currentPage === "companies" && "is-active"
                )}
                to="/companies"
                onClick={() => setCurrentPage("companies")}
              >
                {TEXT.companies}
              </Link>
              <Link
                className={clsx(
                  "nav-link site-nav-link",
                  currentPage === "jobs" && "is-active"
                )}
                to="/jobs"
                onClick={() => setCurrentPage("jobs")}
              >
                {TEXT.jobs}
              </Link>
            </nav>
            <div className="me-auto"></div>
            {!isAuth ? (
              <div className="site-auth fw-normal ts-md">
                <button
                  type="button"
                  className="border-0 bg-transparent site-auth-link"
                  data-bs-toggle="modal"
                  data-bs-target="#login-box"
                >
                  {TEXT.login}
                </button>
                <Link to="/sign-up" className="text-decoration-none site-auth-link">
                  {TEXT.signup}
                </Link>
                <a
                  href="/employer/login"
                  className="btn app-button-primary site-cta"
                >
                  {TEXT.employerArea}
                </a>
              </div>
            ) : (
              <div className="d-flex align-items-center sidebar-right">
                <div
                  className="position-relative"
                  onMouseLeave={() => setShowListMsg(false)}
                >
                  <BsBell
                    className="fs-3 me-4 pointer"
                    onClick={() => setShowListMsg(true)}
                  />
                  {hasNew && (
                    <div className="bell-new">
                      <BsFillCircleFill />
                    </div>
                  )}
                  <div
                    className={clsx(
                      "position-absolute bg-white z-index-1 msg-list fw-normal shadow",
                      showListMsg ? "d-block" : "d-none"
                    )}
                  >
                    {bellMsgs.length > 0 ? (
                      bellMsgs.map((item, index) => (
                        <div
                          key={`bell_msg_${item.id}_${index}`}
                          className={
                            "text-wrap px-2 py-2 rounded-3 hover-bg-1 pointer" +
                            msgStyles[index]
                          }
                          onClick={() => handleReadMsg(item)}
                        >
                          {item.name}
                        </div>
                      ))
                    ) : (
                      <span className="ms-3">{TEXT.noNotification}</span>
                    )}
                  </div>
                </div>
                <div className="dropdown pt-1">
                  <AppImage
                    src={candidate?.avatar}
                    fallbackVariant="avatar"
                    alt="candidate_avatar"
                    width="40"
                    height="40"
                    className="rounded-pill border border-2"
                    style={{ objectFit: "cover" }}
                  />
                  &nbsp;
                  <span
                    style={{ fontSize: "16px", cursor: "pointer" }}
                    className="dropdown-toggle"
                    data-bs-toggle="dropdown"
                  >
                    {candidateName}
                  </span>
                  <ul className="dropdown-menu">
                    <li>
                      <Link className="dropdown-item" to="/candidate">
                        {TEXT.account}
                      </Link>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="dropdown-item"
                        onClick={handleLogout}
                      >
                        {TEXT.logout}
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="page-body">
        {!isAuth && <Login />}
        {props.children}
      </main>
      <footer className="site-footer">
        <div className="app-shell">
          <div className="site-footer__wrap">
            <div className="row g-4">
              <div className="col-md-4">
                <div className="site-footer__brand">
                  <div className="site-brand text-white mb-3">
                    Recruit<span className="text-white">ment</span>
                  </div>
                  <p className="site-footer__text">{TEXT.footerIntro}</p>
                </div>
              </div>
              <div className="col-md-4">
                <h5 className="site-footer__title">{TEXT.contact}</h5>
                <p className="site-footer__text">
                  Email: phantrungkien123456.you@gmail.com
                </p>
                <p className="site-footer__text">
                  {TEXT.phone}: 0983-574-245
                </p>
                <p className="site-footer__text">
                  {TEXT.footerAddressLine1}
                  <br />
                  {TEXT.footerAddressLine2}
                </p>
              </div>
              <div className="col-md-4">
                <h5 className="site-footer__title">{TEXT.explore}</h5>
                <div className="d-flex flex-column gap-2">
                  <Link to="/" className="site-footer__link">
                    {TEXT.home}
                  </Link>
                  <Link to="/jobs" className="site-footer__link">
                    {TEXT.jobList}
                  </Link>
                  <Link to="/companies" className="site-footer__link">
                    {TEXT.companyList}
                  </Link>
                  <a href="/employer/login" className="site-footer__link">
                    {TEXT.employerZone}
                  </a>
                </div>
              </div>
            </div>
            <div className="site-footer__bottom">{TEXT.copyright}</div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Layout;
