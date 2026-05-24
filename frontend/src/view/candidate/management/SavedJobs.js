import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BsArrowRight,
  BsBookmarkCheck,
  BsBriefcase,
  BsBuilding,
  BsCalendarEvent,
  BsGeoAlt,
  BsInbox,
  BsShieldCheck,
  BsTrash3,
} from "react-icons/bs";
import { useSelector } from "react-redux";
import SavedJobPopup from "./SavedJobPopup";
import candidateApi from "../../../api/candidate";

const TEXT = {
  title: "Vi\u1ec7c l\u00e0m \u0111\u00e3 l\u01b0u",
  subtitle:
    "Theo d\u00f5i c\u01a1 h\u1ed9i ph\u00f9 h\u1ee3p, ki\u1ec3m tra h\u1ea1n n\u1ed9p v\u00e0 quay l\u1ea1i \u1ee9ng tuy\u1ec3n khi s\u1eb5n s\u00e0ng.",
  total: "\u0110\u00e3 l\u01b0u",
  active: "\u0110ang tuy\u1ec3n",
  closed: "\u0110\u00e3 \u0111\u00f3ng",
  openStatus: "\u0110ang m\u1edf",
  closedStatus: "\u0110\u00e3 \u0111\u00f3ng",
  apply: "\u1ee8ng tuy\u1ec3n",
  view: "Xem chi ti\u1ebft",
  delete: "B\u1ecf l\u01b0u",
  company: "C\u00f4ng ty",
  location: "\u0110\u1ecba \u0111i\u1ec3m",
  deadline: "H\u1ea1n n\u1ed9p",
  notUpdated: "Ch\u01b0a c\u1eadp nh\u1eadt",
  loading: "\u0110ang t\u1ea3i danh s\u00e1ch vi\u1ec7c l\u00e0m \u0111\u00e3 l\u01b0u...",
  errorTitle: "Ch\u01b0a th\u1ec3 t\u1ea3i vi\u1ec7c \u0111\u00e3 l\u01b0u",
  errorDescription:
    "Vui l\u00f2ng th\u1eed l\u1ea1i sau ho\u1eb7c ki\u1ec3m tra phi\u00ean \u0111\u0103ng nh\u1eadp c\u1ee7a b\u1ea1n.",
  emptyTitle: "B\u1ea1n ch\u01b0a l\u01b0u vi\u1ec7c l\u00e0m n\u00e0o",
  emptyDescription:
    "Khi th\u1ea5y m\u1ed9t tin ph\u00f9 h\u1ee3p, h\u00e3y l\u01b0u l\u1ea1i \u0111\u1ec3 so s\u00e1nh tr\u01b0\u1edbc khi \u1ee9ng tuy\u1ec3n.",
  browseJobs: "T\u00ecm vi\u1ec7c ngay",
  safetyTitle: "Nh\u1eafc nhanh an to\u00e0n",
  safetyDescription:
    "Kh\u00f4ng chuy\u1ec3n ph\u00ed, kh\u00f4ng g\u1eedi gi\u1ea5y t\u1edd nh\u1ea1y c\u1ea3m ngo\u00e0i h\u1ec7 th\u1ed1ng khi ch\u01b0a x\u00e1c minh nh\u00e0 tuy\u1ec3n d\u1ee5ng.",
};

const buildLocationText = (job) => {
  if (!Array.isArray(job?.locations) || job.locations.length === 0) {
    return TEXT.notUpdated;
  }

  return job.locations
    .map((location) => location?.name)
    .filter(Boolean)
    .join(", ");
};

function AccountListSkeleton() {
  return (
    <div className="account-job-list" aria-label={TEXT.loading}>
      {[0, 1, 2].map((item) => (
        <div className="account-job-card account-job-card--skeleton" key={item}>
          <span />
          <div>
            <i />
            <i />
            <i />
          </div>
        </div>
      ))}
    </div>
  );
}

function AccountEmptyState({ icon, title, description, action }) {
  return (
    <div className="account-empty-state">
      {icon}
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

function SavedJobs() {
  const [jobs, setJobs] = useState([]);
  const [curJob, setCurJob] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const user = useSelector((state) => state.candAuth.current);
  const isAuth = useSelector((state) => state.candAuth.isAuth);
  const candidateId = user?.id;

  const getSavedJobs = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await candidateApi.getSavedJobs(candidateId);
      setJobs(Array.isArray(response) ? response : []);
    } catch (err) {
      setJobs([]);
      setError(TEXT.errorDescription);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuth || !candidateId) {
      setIsLoading(false);
      return;
    }

    getSavedJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateId, isAuth]);

  const activeJobs = useMemo(
    () => jobs.filter((item) => item?.is_active === 1).length,
    [jobs]
  );
  const closedJobs = Math.max(jobs.length - activeJobs, 0);

  return (
    <>
      <div className="account-workspace">
        <section className="account-page-hero">
          <div>
            <span className="account-page-hero__eyebrow">
              <BsBookmarkCheck />
              {TEXT.total}
            </span>
            <h1>{TEXT.title}</h1>
            <p>{TEXT.subtitle}</p>
          </div>
          <div className="account-page-hero__stats">
            <div>
              <strong>{jobs.length}</strong>
              <span>{TEXT.total}</span>
            </div>
            <div>
              <strong>{activeJobs}</strong>
              <span>{TEXT.active}</span>
            </div>
            <div>
              <strong>{closedJobs}</strong>
              <span>{TEXT.closed}</span>
            </div>
          </div>
        </section>

        <section className="account-panel account-panel--notice">
          <BsShieldCheck />
          <div>
            <strong>{TEXT.safetyTitle}</strong>
            <p>{TEXT.safetyDescription}</p>
          </div>
        </section>

        <section className="account-panel">
          {isLoading ? (
            <AccountListSkeleton />
          ) : error ? (
            <AccountEmptyState
              icon={<BsInbox />}
              title={TEXT.errorTitle}
              description={error}
            />
          ) : jobs.length > 0 ? (
            <div className="account-job-list">
              {jobs.map((item) => {
                const isActive = item?.is_active === 1;

                return (
                  <article className="account-job-card" key={`saved-job-${item.id}`}>
                    <div className="account-job-card__main">
                      <span className="account-job-card__icon">
                        <BsBriefcase />
                      </span>
                      <div className="account-job-card__body">
                        <div className="account-job-card__badges">
                          <span className={isActive ? "is-open" : "is-closed"}>
                            {isActive ? TEXT.openStatus : TEXT.closedStatus}
                          </span>
                        </div>
                        <Link to={`/jobs/${item.id}`} className="account-job-card__title">
                          {item.jname || TEXT.notUpdated}
                        </Link>
                        <div className="account-job-card__company">
                          <BsBuilding />
                          {item.employer?.name || TEXT.notUpdated}
                        </div>
                        <div className="account-job-card__meta">
                          <span>
                            <BsGeoAlt />
                            {buildLocationText(item)}
                          </span>
                          <span>
                            <BsCalendarEvent />
                            {item.deadline || item.expire_at || TEXT.notUpdated}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="account-job-card__actions">
                      {isActive ? (
                        <Link to={`/jobs/${item.id}`} className="account-button account-button--primary">
                          {TEXT.apply}
                          <BsArrowRight />
                        </Link>
                      ) : (
                        <button className="account-button account-button--disabled" disabled>
                          {TEXT.closedStatus}
                        </button>
                      )}
                      <button
                        type="button"
                        className="account-icon-button account-icon-button--danger"
                        title={TEXT.delete}
                        aria-label={TEXT.delete}
                        data-bs-toggle="modal"
                        data-bs-target="#jobDeletingModal"
                        onClick={() => setCurJob(item)}
                      >
                        <BsTrash3 />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <AccountEmptyState
              icon={<BsInbox />}
              title={TEXT.emptyTitle}
              description={TEXT.emptyDescription}
              action={
                <Link to="/jobs" className="account-button account-button--primary">
                  {TEXT.browseJobs}
                  <BsArrowRight />
                </Link>
              }
            />
          )}
        </section>
      </div>
      <SavedJobPopup job_id={curJob.id} onDeleted={getSavedJobs} />
    </>
  );
}

export default SavedJobs;
