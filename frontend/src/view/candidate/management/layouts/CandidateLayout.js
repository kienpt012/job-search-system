import "./layout.css";
import { useNavigate, useLocation } from "react-router-dom";
import { createContext, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import candidateApi from "../../../../api/candidate";
import educationApi from "../../../../api/education";
import experienceApi from "../../../../api/experience";
import projectApi from "../../../../api/project";
import skillApi from "../../../../api/skill";
import certificateApi from "../../../../api/certificate";
import prizeApi from "../../../../api/prize";
import activityApi from "../../../../api/activity";
import otherApi from "../../../../api/other";
import clsx from "clsx";
import { AppContext } from "../../../../App";
import { candAuthActions } from "../../../../redux/slices/candAuthSlice";

export const CandidateContext = createContext();

const TEXT = {
  account: "T\u00e0i kho\u1ea3n c\u1ee7a t\u00f4i",
  dashboard: "Dashboard",
  profile: "Profile c\u00e1 nh\u00e2n",
  appliedJobs: "Vi\u1ec7c l\u00e0m \u0111\u00e3 n\u1ed9p",
  savedJobs: "Vi\u1ec7c l\u00e0m \u0111\u00e3 l\u01b0u",
};

const normalizeCandidatePath = (pathname) => {
  const safePath = pathname.replace(/\/+$/, "") || "/candidate";
  return safePath === "/candidate" ? "/candidate" : safePath;
};

function CandidateLayout(props) {
  const nav = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentPage, setCurrentPage } = useContext(AppContext);
  const isAuth = useSelector((state) => state.candAuth.isAuth);

  const [personal, setPersonal] = useState({});
  const [educations, setEducations] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [activities, setActivities] = useState([]);
  const [others, setOthers] = useState([]);
  const [cvMode, setCvMode] = useState("CREATE_0");

  const getPersonal = async () => {
    const res = await candidateApi.getCurrent();
    setPersonal(res);
    dispatch(candAuthActions.setCurrentCandidate(res));
  };

  const getEducations = async () => {
    const res = await educationApi.getByCurrentCandidateProfile();
    setEducations(res);
  };

  const getExperiences = async () => {
    const res = await experienceApi.getByCurrentCandidateProfile();
    setExperiences(res);
  };

  const getProjects = async () => {
    const res = await projectApi.getByCurrentCandidateProfile();
    setProjects(res);
  };

  const getSkills = async () => {
    const res = await skillApi.getByCurrentCandidateProfile();
    setSkills(res);
  };

  const getCertificates = async () => {
    const res = await certificateApi.getByCurrentCandidateProfile();
    setCertificates(res);
  };

  const getPrizes = async () => {
    const res = await prizeApi.getByCurrentCandidateProfile();
    setPrizes(res);
  };

  const getActivities = async () => {
    const res = await activityApi.getByCurrentCandidateProfile();
    setActivities(res);
  };

  const getOthers = async () => {
    const res = await otherApi.getByCurrentCandidateProfile();
    setOthers(res);
  };

  const getProfileBundle = async () => {
    const res = await candidateApi.getProfileBundle();
    if (res?.personal) {
      setPersonal(res.personal);
      dispatch(candAuthActions.setCurrentCandidate(res.personal));
    }
    setEducations(Array.isArray(res?.educations) ? res.educations : []);
    setExperiences(Array.isArray(res?.experiences) ? res.experiences : []);
    setProjects(Array.isArray(res?.projects) ? res.projects : []);
    setSkills(Array.isArray(res?.skills) ? res.skills : []);
    setCertificates(Array.isArray(res?.certificates) ? res.certificates : []);
    setPrizes(Array.isArray(res?.prizes) ? res.prizes : []);
    setActivities(Array.isArray(res?.activities) ? res.activities : []);
    setOthers(Array.isArray(res?.others) ? res.others : []);
  };

  useEffect(() => {
    if (!isAuth) return;

    const shouldLoadProfileCollections =
      location.pathname.startsWith("/candidate/profile");

    if (shouldLoadProfileCollections) {
      getProfileBundle();
    } else {
      getPersonal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, isAuth, location.pathname]);

  useEffect(() => {
    if (location.pathname.startsWith("/candidate")) {
      setCurrentPage(normalizeCandidatePath(location.pathname));
    }
  }, [location.pathname, setCurrentPage]);

  const handleChangePage = (url) => {
    nav(url);
    setCurrentPage(url);
  };

  return (
    <CandidateContext.Provider
      value={{
        personal,
        setPersonal,
        educations,
        setEducations,
        experiences,
        setExperiences,
        projects,
        setProjects,
        skills,
        setSkills,
        certificates,
        setCertificates,
        prizes,
        setPrizes,
        activities,
        setActivities,
        others,
        setOthers,
        getPersonal,
        getEducations,
        getExperiences,
        getProjects,
        getSkills,
        getCertificates,
        getPrizes,
        getActivities,
        getOthers,
        cvMode,
        setCvMode,
      }}
    >
      <div className="account-layout">
        <div className="account-menu ts-smd fw-500">
          <div className="account-menu__heading text-center ts-lg fw-500">
            {TEXT.account}
          </div>
          <div
            className={clsx(
              "account-menu__item",
              currentPage === "/candidate" && "is-active"
            )}
            onClick={() => handleChangePage("/candidate")}
          >
            {TEXT.dashboard}
          </div>
          <div
            className={clsx(
              "account-menu__item",
              currentPage === "/candidate/profile" && "is-active"
            )}
            onClick={() => handleChangePage("/candidate/profile")}
          >
            {TEXT.profile}
          </div>
          <div
            className={clsx(
              "account-menu__item",
              currentPage === "/candidate/applied-jobs" && "is-active"
            )}
            onClick={() => handleChangePage("/candidate/applied-jobs")}
          >
            {TEXT.appliedJobs}
          </div>
          <div
            className={clsx(
              "account-menu__item",
              currentPage === "/candidate/saved-jobs" && "is-active"
            )}
            onClick={() => handleChangePage("/candidate/saved-jobs")}
          >
            {TEXT.savedJobs}
          </div>
        </div>
        <div className="account-content">{props.children}</div>
      </div>
    </CandidateContext.Provider>
  );
}

export default CandidateLayout;
