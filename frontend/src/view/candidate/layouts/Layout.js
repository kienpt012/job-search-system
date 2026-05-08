import "bootstrap/dist/js/bootstrap.js";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  BsArrowRight,
  BsBell,
  BsEnvelope,
  BsFillCircleFill,
  BsGeoAlt,
  BsStars,
  BsTelephone,
} from "react-icons/bs";
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
import useRevealOnScroll from "../../../hooks/useRevealOnScroll";

const TEXT = {
  home: "Trang chủ",
  companies: "Công ty",
  jobs: "Việc làm",
  login: "Đăng nhập",
  signup: "Đăng ký",
  employerArea: "Đăng tuyển, tìm ứng viên",
  noNotification: "Không có thông báo nào",
  account: "Tài khoản",
  logout: "Đăng xuất",
  topbar: "Nền tảng tuyển dụng rõ ràng hơn cho ứng viên và nhà tuyển dụng.",
  topbarCta: "Khu vực nhà tuyển dụng",
  brandTitle: "Recruitment",
  brandTagline:
    "Kết nối việc làm, công ty và ứng viên theo cách gọn, rõ và dễ dùng hơn.",
  footerHeroEyebrow: "Nền tảng tuyển dụng",
  footerHeroTitle: "Tìm việc nhanh hơn. Đăng tuyển rõ ràng hơn.",
  footerHeroDesc:
    "Tập trung vào trải nghiệm tìm kiếm, xem doanh nghiệp và theo dõi cơ hội theo một hệ thống sạch, sáng và dễ hiểu.",
  footerIntro:
    "Recruitment xây dựng trải nghiệm tuyển dụng cân bằng hơn: bố cục rõ, thông tin dễ quét và hành động chính luôn nổi bật đúng chỗ.",
  contact: "Liên hệ",
  explore: "Khám phá",
  resources: "Tài nguyên",
  company: "Nền tảng",
  phone: "Điện thoại",
  companyList: "Danh sách công ty",
  jobList: "Danh sách việc làm",
  employerZone: "Khu vực nhà tuyển dụng",
  candidateZone: "Không gian ứng viên",
  privacy: "Chính sách bảo mật",
  guide: "Hướng dẫn ứng tuyển",
  support: "Hỗ trợ tài khoản",
  footerAddressLine1: "06 Trần Văn Ơn, Phú Hòa,",
  footerAddressLine2: "Thủ Dầu Một, Bình Dương",
  footerEmail: "phantrungkien123456.you@gmail.com",
  footerPhone: "0983-574-245",
  footerLocation: "Bình Dương, Việt Nam",
  footerStat1Label: "Việc làm nổi bật",
  footerStat2Label: "Doanh nghiệp tuyển dụng",
  footerStat3Label: "Trải nghiệm gọn hơn",
  footerJobsCta: "Tìm việc ngay",
  footerEmployerCta: "Đăng tuyển",
  copyright: "© 2026 Recruitment. All rights reserved.",
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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [curNotification, setCurNotification] = useState({});
  const userMenuRef = useRef(null);
  const { currentPage, setCurrentPage } = useContext(AppContext);

  const dispatch = useDispatch();
  const candidate = useSelector((state) => state.candAuth.current);
  const isAuth = useSelector((state) => state.candAuth.isAuth);

  useRevealOnScroll([location.pathname]);

  const candidateName = useMemo(
    () =>
      [candidate?.lastname, candidate?.firstname]
        .filter(Boolean)
        .join(" ")
        .trim() || "User",
    [candidate]
  );

  const handleLogout = async () => {
    setShowUserMenu(false);
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

  useEffect(() => {
    if (!showUserMenu) return undefined;

    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  return (
    <>
      <BellDialog
        show={showBellDialog}
        setShow={setShowBellDialog}
        current={curNotification}
      />
      <header className="site-header">
        <div className="site-topbar">
          <div className="app-shell site-topbar__inner">
            <div className="site-topbar__note">
              <BsStars />
              <span>{TEXT.topbar}</span>
            </div>
            <a href="/employer/login" className="site-topbar__action">
              <span>{TEXT.topbarCta}</span>
              <BsArrowRight />
            </a>
          </div>
        </div>

        <div className="site-navbar-wrap">
          <div className="app-shell">
            <div className="site-navbar">
              <Link
                className="nav-link site-brand"
                to="/"
                onClick={() => setCurrentPage("home")}
              >
                <span className="site-brand__mark">R</span>
                <span className="site-brand__copy">
                  <strong>{TEXT.brandTitle}</strong>
                  <small>{TEXT.brandTagline}</small>
                </span>
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
                    className="border-0 bg-transparent site-auth-link site-auth-link--button"
                    data-bs-toggle="modal"
                    data-bs-target="#login-box"
                  >
                    {TEXT.login}
                  </button>
                  <Link
                    to="/sign-up"
                    className="text-decoration-none site-auth-link site-auth-link--soft"
                  >
                    {TEXT.signup}
                  </Link>
                  <a href="/employer/login" className="btn app-button-primary site-cta">
                    {TEXT.employerArea}
                  </a>
                </div>
              ) : (
                <div className="site-user-actions">
                  <div
                    className="position-relative"
                    onMouseLeave={() => setShowListMsg(false)}
                  >
                    <button
                      type="button"
                      className="site-icon-button"
                      onClick={() => setShowListMsg(true)}
                    >
                      <BsBell className="fs-5" />
                    </button>
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

                  <div className="dropdown site-user-dropdown" ref={userMenuRef}>
                    <button
                      type="button"
                      className="site-user-chip dropdown-toggle"
                      aria-expanded={showUserMenu}
                      onClick={() => setShowUserMenu((currentValue) => !currentValue)}
                    >
                      <AppImage
                        src={candidate?.avatar}
                        fallbackVariant="avatar"
                        alt="candidate_avatar"
                        width="42"
                        height="42"
                        className="site-user-chip__avatar"
                        style={{ objectFit: "cover" }}
                      />
                      <span className="site-user-chip__name">{candidateName}</span>
                    </button>
                    <ul
                      className={clsx(
                        "dropdown-menu dropdown-menu-end site-user-menu",
                        showUserMenu && "show"
                      )}
                    >
                      <li>
                        <Link
                          className="dropdown-item"
                          to="/candidate"
                          onClick={() => setShowUserMenu(false)}
                        >
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
        </div>
      </header>

      <main className="page-body">
        {!isAuth && <Login />}
        {props.children}
      </main>

      <footer className="site-footer reveal">
        <div className="app-shell">
          <div className="site-footer__hero">
            <div className="site-footer__hero-copy">
              <span className="site-footer__eyebrow">{TEXT.footerHeroEyebrow}</span>
              <h2>{TEXT.footerHeroTitle}</h2>
              <p>{TEXT.footerHeroDesc}</p>
            </div>
            <div className="site-footer__hero-actions">
              <Link to="/jobs" className="btn app-button-primary">
                {TEXT.footerJobsCta}
              </Link>
              <a href="/employer/login" className="site-footer__ghost-link">
                {TEXT.footerEmployerCta}
                <BsArrowRight />
              </a>
            </div>
          </div>

          <div className="site-footer__stats">
            <div className="site-footer__stat-card">
              <strong>24h</strong>
              <span>{TEXT.footerStat1Label}</span>
            </div>
            <div className="site-footer__stat-card">
              <strong>300+</strong>
              <span>{TEXT.footerStat2Label}</span>
            </div>
            <div className="site-footer__stat-card">
              <strong>1 nền tảng</strong>
              <span>{TEXT.footerStat3Label}</span>
            </div>
          </div>

          <div className="site-footer__panel">
            <div className="site-footer__grid">
              <div className="site-footer__col site-footer__col--brand">
                <Link className="site-brand site-brand--footer nav-link" to="/">
                  <span className="site-brand__mark">R</span>
                  <span className="site-brand__copy">
                    <strong>{TEXT.brandTitle}</strong>
                    <small>{TEXT.brandTagline}</small>
                  </span>
                </Link>
                <p className="site-footer__text site-footer__intro">{TEXT.footerIntro}</p>

                <div className="site-footer__contact-stack">
                  <a href={`tel:${TEXT.footerPhone}`} className="site-footer__contact-chip">
                    <BsTelephone />
                    <span>{TEXT.footerPhone}</span>
                  </a>
                  <a
                    href={`mailto:${TEXT.footerEmail}`}
                    className="site-footer__contact-chip"
                  >
                    <BsEnvelope />
                    <span>{TEXT.footerEmail}</span>
                  </a>
                  <div className="site-footer__contact-chip">
                    <BsGeoAlt />
                    <span>{TEXT.footerLocation}</span>
                  </div>
                </div>
              </div>

              <div className="site-footer__col">
                <h5 className="site-footer__title">{TEXT.explore}</h5>
                <div className="site-footer__link-list">
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

              <div className="site-footer__col">
                <h5 className="site-footer__title">{TEXT.resources}</h5>
                <div className="site-footer__link-list">
                  <Link to="/sign-up" className="site-footer__link">
                    {TEXT.candidateZone}
                  </Link>
                  <button
                    type="button"
                    className="site-footer__link site-footer__link--button"
                    data-bs-toggle="modal"
                    data-bs-target="#login-box"
                  >
                    {TEXT.support}
                  </button>
                  <Link to="/jobs" className="site-footer__link">
                    {TEXT.guide}
                  </Link>
                  <Link to="/" className="site-footer__link">
                    {TEXT.privacy}
                  </Link>
                </div>
              </div>

              <div className="site-footer__col">
                <h5 className="site-footer__title">{TEXT.contact}</h5>
                <div className="site-footer__link-list">
                  <span className="site-footer__text">
                    {TEXT.footerAddressLine1}
                    <br />
                    {TEXT.footerAddressLine2}
                  </span>
                  <span className="site-footer__text">
                    {TEXT.phone}: {TEXT.footerPhone}
                  </span>
                  <span className="site-footer__text">{TEXT.footerEmail}</span>
                </div>
              </div>
            </div>

            <div className="site-footer__bottom">
              <div className="site-footer__legal">
                <strong>{TEXT.company}</strong>
                <span>
                  {TEXT.footerAddressLine1} {TEXT.footerAddressLine2}
                </span>
              </div>
              <div className="site-footer__copyright">{TEXT.copyright}</div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Layout;
