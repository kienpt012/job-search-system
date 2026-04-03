import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  BsArrowRight,
  BsBookmarkHeartFill,
  BsBriefcaseFill,
  BsCheck2Circle,
  BsFileEarmarkTextFill,
  BsGeoAltFill,
  BsPinMapFill,
  BsStars,
} from "react-icons/bs";
import candidateApi from "../../../api/candidate";
import AppImage from "../../../components/AppImage";
import { CandidateContext } from "./layouts/CandidateLayout";

const TEXT = {
  heading: "B\u1ea3ng \u0111i\u1ec1u khi\u1ec3n \u1ee9ng vi\u00ean",
  subHeading:
    "Theo d\u00f5i m\u1ee9c \u0111\u1ed9 ho\u00e0n thi\u1ec7n h\u1ed3 s\u01a1, ti\u1ebfn \u0111\u1ed9 \u1ee9ng tuy\u1ec3n v\u00e0 nh\u1eefng c\u00f4ng ty g\u1ea7n n\u01a1i \u1edf c\u1ee7a b\u1ea1n.",
  profileCompletion: "H\u1ed3 s\u01a1 \u0111\u00e3 ho\u00e0n thi\u1ec7n",
  quickActions: "Thao t\u00e1c nhanh",
  editProfile: "C\u1eadp nh\u1eadt profile",
  manageResumes: "Qu\u1ea3n l\u00fd h\u1ed3 s\u01a1",
  viewAppliedJobs: "Xem vi\u1ec7c \u0111\u00e3 n\u1ed9p",
  viewSavedJobs: "Xem vi\u1ec7c \u0111\u00e3 l\u01b0u",
  metricApplied: "Vi\u1ec7c \u0111\u00e3 n\u1ed9p",
  metricSaved: "Vi\u1ec7c \u0111\u00e3 l\u01b0u",
  metricSkills: "K\u1ef9 n\u0103ng",
  metricSections: "M\u1ee5c h\u1ed3 s\u01a1 \u0111\u00e3 c\u00f3",
  nearbyTitle: "C\u00f4ng ty g\u1ea7n n\u01a1i \u1edf",
  nearbySub:
    "H\u1ec7 th\u1ed1ng g\u1ee3i \u00fd doanh nghi\u1ec7p trong b\u00e1n k\u00ednh d\u01b0\u1edbi 10km t\u1eeb v\u1ecb tr\u00ed \u0111\u00e3 ghim.",
  noNearbyPinned:
    "H\u00e3y ghim v\u1ecb tr\u00ed trong profile \u0111\u1ec3 nh\u1eadn g\u1ee3i \u00fd c\u00f4ng ty g\u1ea7n nh\u00e0.",
  noNearbyCompany:
    "Hi\u1ec7n ch\u01b0a c\u00f3 c\u00f4ng ty n\u00e0o ph\u00f9 h\u1ee3p trong b\u00e1n k\u00ednh 10km.",
  locationPinned: "\u0110\u00e3 ghim v\u1ecb tr\u00ed",
  locationMissing: "Ch\u01b0a ghim v\u1ecb tr\u00ed",
  nearbyJobCount: "vi\u1ec7c l\u00e0m",
  completionTip:
    "G\u1ee3i \u00fd: ho\u00e0n thi\u1ec7n \u1ea3nh \u0111\u1ea1i di\u1ec7n, m\u1ee5c ti\u00eau, \u0111\u1ecba ch\u1ec9 v\u00e0 kinh nghi\u1ec7m \u0111\u1ec3 t\u0103ng \u0111i\u1ec3m tin c\u1eady.",
  sectionChecklist: "Ti\u1ebfn \u0111\u1ed9 c\u00e1c m\u1ee5c",
  openCompany: "M\u1edf c\u00f4ng ty",
  objectiveFallback:
    "B\u1ea1n ch\u01b0a th\u00eam m\u1ee5c ti\u00eau ngh\u1ec1 nghi\u1ec7p. H\u00e3y c\u1eadp nh\u1eadt \u0111\u1ec3 nh\u00e0 tuy\u1ec3n d\u1ee5ng hi\u1ec3u b\u1ea1n r\u00f5 h\u01a1n.",
  filled: "\u0110\u00e3 c\u00f3",
  missing: "C\u1ea7n b\u1ed5 sung",
};

const hasMapLocation = (profile) =>
  Boolean(
    profile?.map_lat !== null &&
      profile?.map_lat !== undefined &&
      profile?.map_lat !== "" &&
      profile?.map_lng !== null &&
      profile?.map_lng !== undefined &&
      profile?.map_lng !== ""
  );

const completionItemsForProfile = (personal, sections) => [
  {
    label: "\u1ea2nh \u0111\u1ea1i di\u1ec7n",
    done: Boolean(personal?.avatar),
  },
  {
    label: "M\u1ee5c ti\u00eau ngh\u1ec1 nghi\u1ec7p",
    done: Boolean(personal?.objective),
  },
  {
    label: "S\u1ed1 \u0111i\u1ec7n tho\u1ea1i",
    done: Boolean(personal?.phone),
  },
  {
    label: "\u0110\u1ecba ch\u1ec9 hi\u1ec3n th\u1ecb",
    done: Boolean(personal?.address),
  },
  {
    label: "V\u1ecb tr\u00ed b\u1ea3n \u0111\u1ed3",
    done: hasMapLocation(personal),
  },
  {
    label: "H\u1ecdc v\u1ea5n",
    done: sections.educations > 0,
  },
  {
    label: "Kinh nghi\u1ec7m",
    done: sections.experiences > 0,
  },
  {
    label: "D\u1ef1 \u00e1n",
    done: sections.projects > 0,
  },
  {
    label: "K\u1ef9 n\u0103ng",
    done: sections.skills > 0,
  },
  {
    label: "Ch\u1ee9ng ch\u1ec9 / ho\u1ea1t \u0111\u1ed9ng",
    done: sections.certificates + sections.activities + sections.prizes > 0,
  },
];

const initialSummary = {
  applied_jobs_count: 0,
  saved_jobs_count: 0,
  resumes_count: 0,
  section_counts: {
    educations: 0,
    experiences: 0,
    projects: 0,
    skills: 0,
    certificates: 0,
    prizes: 0,
    activities: 0,
    others: 0,
  },
};

export default function CandidateDashboard() {
  const { personal } = useContext(CandidateContext);
  const currentCandidate = useSelector((state) => state.candAuth.current);
  const isAuth = useSelector((state) => state.candAuth.isAuth);

  const [summary, setSummary] = useState(initialSummary);
  const [nearbyCompanies, setNearbyCompanies] = useState([]);
  const candidateId = currentCandidate?.id || personal?.id;
  const hasPinnedLocation = hasMapLocation({
    map_lat: personal?.map_lat,
    map_lng: personal?.map_lng,
  });

  const sectionCounts = summary.section_counts || initialSummary.section_counts;

  const completionItems = useMemo(
    () => completionItemsForProfile(personal, sectionCounts),
    [personal, sectionCounts]
  );

  const completedSectionCount = completionItems.filter((item) => item.done).length;
  const profileCompletion = Math.round(
    (completedSectionCount / completionItems.length) * 100
  );

  useEffect(() => {
    if (!isAuth || !candidateId) return;

    let isMounted = true;

    const loadMetrics = async () => {
      try {
        const response = await candidateApi.getDashboardSummary();
        if (!isMounted) return;
        setSummary({
          applied_jobs_count: response?.applied_jobs_count || 0,
          saved_jobs_count: response?.saved_jobs_count || 0,
          resumes_count: response?.resumes_count || 0,
          section_counts: {
            ...initialSummary.section_counts,
            ...(response?.section_counts || {}),
          },
        });
      } catch (error) {
        if (!isMounted) return;
        setSummary(initialSummary);
      }
    };

    loadMetrics();
    return () => {
      isMounted = false;
    };
  }, [candidateId, isAuth]);

  useEffect(() => {
    if (!hasPinnedLocation) {
      setNearbyCompanies([]);
      return;
    }

    let isMounted = true;

    const loadNearbyCompanies = async () => {
      try {
        const response = await candidateApi.getNearbyCompanies();
        if (!isMounted) return;
        setNearbyCompanies(
          Array.isArray(response?.data) ? response.data.slice(0, 4) : []
        );
      } catch (error) {
        if (!isMounted) return;
        setNearbyCompanies([]);
      }
    };

    loadNearbyCompanies();
    return () => {
      isMounted = false;
    };
  }, [hasPinnedLocation, personal?.map_lat, personal?.map_lng]);

  return (
    <div className="px-5 pt-4 pb-5">
      <div className="section-card">
        <div className="row g-4 align-items-center">
          <div className="col-xl-7">
            <span className="badge rounded-pill text-bg-light border px-3 py-2 mb-3">
              {TEXT.heading}
            </span>
            <h2
              className="fw-bold mb-3"
              style={{
                color: "var(--app-title)",
                lineHeight: 1.15,
                fontSize: "clamp(2rem, 3vw, 3.2rem)",
                maxWidth: "640px",
                overflowWrap: "anywhere",
              }}
            >
              {personal?.firstname
                ? `${personal.firstname}, h\u1ed3 s\u01a1 c\u1ee7a b\u1ea1n \u0111ang \u1edf m\u1ee9c ${profileCompletion}%`
                : `H\u1ed3 s\u01a1 c\u1ee7a b\u1ea1n \u0111ang \u1edf m\u1ee9c ${profileCompletion}%`}
            </h2>
            <p className="text-secondary mb-3" style={{ maxWidth: "620px" }}>
              {TEXT.subHeading}
            </p>
            <div className="d-flex flex-wrap gap-2 mb-4">
              <Link to="/candidate/profile" className="btn app-button-primary">
                {TEXT.editProfile}
              </Link>
              <Link to="/candidate/resumes" className="btn btn-outline-primary">
                {TEXT.manageResumes}
              </Link>
              <Link to="/candidate/applied-jobs" className="btn btn-outline-secondary">
                {TEXT.viewAppliedJobs}
              </Link>
              <Link to="/candidate/saved-jobs" className="btn btn-outline-secondary">
                {TEXT.viewSavedJobs}
              </Link>
            </div>
            <div className="d-flex flex-wrap gap-3">
              <div className="app-hero-stat">
                <span className="d-block text-secondary small mb-1">
                  {TEXT.profileCompletion}
                </span>
                <strong>{profileCompletion}%</strong>
              </div>
              <div className="app-hero-stat">
                <span className="d-block text-secondary small mb-1">
                  {hasPinnedLocation ? TEXT.locationPinned : TEXT.locationMissing}
                </span>
                <strong>{hasPinnedLocation ? "\u0110\u00e3 c\u00f3" : "Ch\u01b0a"}</strong>
              </div>
            </div>
          </div>
          <div className="col-xl-5">
            <div
              className="h-100 p-4 rounded-4"
              style={{
                background:
                  "linear-gradient(135deg, rgba(15,127,147,0.12), rgba(21,57,91,0.12))",
                border: "1px solid var(--app-border)",
              }}
            >
              <div className="d-flex align-items-center gap-3 mb-3">
                <AppImage
                  src={personal?.avatar}
                  fallbackVariant="avatar"
                  alt="candidate_avatar"
                  width="84"
                  height="84"
                  className="rounded-pill border"
                  style={{ objectFit: "cover" }}
                />
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div
                    className="fw-bold fs-4"
                    style={{ color: "var(--app-title)", overflowWrap: "anywhere" }}
                  >
                    {`${personal?.lastname || ""} ${personal?.firstname || ""}`.trim() ||
                      "Candidate"}
                  </div>
                  <div
                    className="text-secondary"
                    style={{ overflowWrap: "anywhere" }}
                  >
                    {personal?.email || "-"}
                  </div>
                </div>
              </div>
              <div className="rounded-4 bg-white p-3 border mb-3">
                <div className="small text-secondary mb-2">{TEXT.quickActions}</div>
                <div className="fw-semibold" style={{ overflowWrap: "anywhere" }}>
                  {personal?.objective || TEXT.objectiveFallback}
                </div>
              </div>
              <div className="text-secondary small">
                <div
                  className="rounded-4 border bg-white px-3 py-2"
                  style={{ overflowWrap: "anywhere" }}
                >
                  <BsPinMapFill className="me-1" />
                  {personal?.address || TEXT.locationMissing}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-1">
        <div className="col-xl-3 col-md-6">
          <div className="section-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <BsBriefcaseFill className="fs-3 text-main" />
              <span className="badge rounded-pill text-bg-light">{TEXT.metricApplied}</span>
            </div>
            <div className="fw-bold" style={{ fontSize: "2rem" }}>
              {summary.applied_jobs_count}
            </div>
            <div className="text-secondary small">{TEXT.metricApplied}</div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="section-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <BsBookmarkHeartFill className="fs-3 text-main" />
              <span className="badge rounded-pill text-bg-light">{TEXT.metricSaved}</span>
            </div>
            <div className="fw-bold" style={{ fontSize: "2rem" }}>
              {summary.saved_jobs_count}
            </div>
            <div className="text-secondary small">{TEXT.metricSaved}</div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="section-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <BsStars className="fs-3 text-main" />
              <span className="badge rounded-pill text-bg-light">{TEXT.metricSkills}</span>
            </div>
            <div className="fw-bold" style={{ fontSize: "2rem" }}>
              {sectionCounts.skills}
            </div>
            <div className="text-secondary small">{TEXT.metricSkills}</div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="section-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <BsCheck2Circle className="fs-3 text-main" />
              <span className="badge rounded-pill text-bg-light">{TEXT.metricSections}</span>
            </div>
            <div className="fw-bold" style={{ fontSize: "2rem" }}>
              {completedSectionCount}/{completionItems.length}
            </div>
            <div className="text-secondary small">{TEXT.metricSections}</div>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-1">
        <div className="col-xl-6">
          <div className="section-card h-100">
            <div className="section-card__head">
              <div>
                <h5 className="app-section-title mb-2">{TEXT.sectionChecklist}</h5>
                <p className="text-secondary mb-0">{TEXT.completionTip}</p>
              </div>
            </div>
            <div className="row g-3">
              {completionItems.map((item) => (
                <div className="col-md-6" key={item.label}>
                  <div className="border rounded-4 p-3 h-100 bg-white">
                    <div className="fw-semibold mb-2">{item.label}</div>
                    <span
                      className={`badge rounded-pill ${
                        item.done ? "text-bg-success" : "text-bg-secondary"
                      }`}
                    >
                      {item.done ? TEXT.filled : TEXT.missing}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-xl-6">
          <div className="section-card h-100">
            <div className="section-card__head">
              <div>
                <h5 className="app-section-title mb-2">{TEXT.nearbyTitle}</h5>
                <p className="text-secondary mb-0">{TEXT.nearbySub}</p>
              </div>
            </div>

            {!hasPinnedLocation ? (
              <div className="border rounded-4 p-4 text-secondary text-center">
                {TEXT.noNearbyPinned}
              </div>
            ) : nearbyCompanies.length === 0 ? (
              <div className="border rounded-4 p-4 text-secondary text-center">
                {TEXT.noNearbyCompany}
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {nearbyCompanies.map((company) => (
                  <div
                    key={`nearby_company_${company.id}`}
                    className="border rounded-4 p-3 d-flex gap-3 align-items-start"
                  >
                    <AppImage
                      src={company.logo}
                      fallbackVariant="logo"
                      alt={company.name}
                      width="84"
                      height="84"
                      className="rounded-4 border"
                      style={{ objectFit: "cover" }}
                    />
                    <div className="flex-grow-1">
                      <div className="fw-bold mb-1" style={{ color: "var(--app-title)" }}>
                        {company.name}
                      </div>
                      <div className="text-secondary small mb-2">{company.address}</div>
                      <div className="d-flex flex-wrap gap-2 mb-2">
                        <span className="badge rounded-pill text-bg-light border">
                          <BsGeoAltFill className="me-1" />
                          {`${Number(company.distance_km).toFixed(1)} km`}
                        </span>
                        <span className="badge rounded-pill text-bg-light border">
                          <BsFileEarmarkTextFill className="me-1" />
                          {company.active_jobs_count} {TEXT.nearbyJobCount}
                        </span>
                      </div>
                      <Link
                        to={`/companies/${company.id}`}
                        className="btn btn-sm btn-outline-primary rounded-pill"
                      >
                        {TEXT.openCompany}
                        <BsArrowRight className="ms-1" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
