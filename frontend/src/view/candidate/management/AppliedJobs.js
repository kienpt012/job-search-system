import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  BsArrowRight,
  BsBriefcase,
  BsBuilding,
  BsCalendarEvent,
  BsClockHistory,
  BsFileEarmarkText,
  BsInbox,
  BsShieldCheck,
} from "react-icons/bs";
import candidateApi from "../../../api/candidate";

const TEXT = {
  title: "Vi\u1ec7c l\u00e0m \u0111\u00e3 n\u1ed9p",
  subtitle:
    "Theo d\u00f5i ti\u1ebfn tr\u00ecnh \u1ee9ng tuy\u1ec3n, xem l\u1ea1i CV \u0111\u00e3 g\u1eedi v\u00e0 quay l\u1ea1i tin tuy\u1ec3n d\u1ee5ng khi c\u1ea7n.",
  total: "T\u1ed5ng h\u1ed3 s\u01a1",
  waiting: "\u0110ang x\u1eed l\u00fd",
  passed: "\u0110\u00e3 qua",
  company: "C\u00f4ng ty",
  submittedAt: "Ng\u00e0y n\u1ed9p",
  viewJob: "Xem tin",
  viewCv: "Xem CV",
  noCv: "Ch\u01b0a c\u00f3 CV",
  notUpdated: "Ch\u01b0a c\u1eadp nh\u1eadt",
  loading: "\u0110ang t\u1ea3i danh s\u00e1ch h\u1ed3 s\u01a1 \u0111\u00e3 n\u1ed9p...",
  errorTitle: "Ch\u01b0a th\u1ec3 t\u1ea3i vi\u1ec7c \u0111\u00e3 n\u1ed9p",
  errorDescription:
    "Vui l\u00f2ng th\u1eed l\u1ea1i sau ho\u1eb7c ki\u1ec3m tra phi\u00ean \u0111\u0103ng nh\u1eadp c\u1ee7a b\u1ea1n.",
  emptyTitle: "B\u1ea1n ch\u01b0a \u1ee9ng tuy\u1ec3n vi\u1ec7c l\u00e0m n\u00e0o",
  emptyDescription:
    "Khi t\u00ecm th\u1ea5y c\u01a1 h\u1ed9i ph\u00f9 h\u1ee3p, h\u00e3y chu\u1ea9n b\u1ecb CV v\u00e0 n\u1ed9p tr\u1ef1c ti\u1ebfp tr\u00ean trang chi ti\u1ebft.",
  safetyTitle: "Theo d\u00f5i sau khi n\u1ed9p",
  safetyDescription:
    "Ch\u1ec9 trao \u0111\u1ed5i qua k\u00eanh ch\u00ednh th\u1ee9c, ki\u1ec3m tra email/tin nh\u1eafn ph\u1ea3n h\u1ed3i v\u00e0 c\u1ea3nh gi\u00e1c l\u1eddi m\u1eddi \u0111\u00f3ng ph\u00ed.",
};

const STATUS_META = {
  WAITING: {
    label: "\u0110ang ch\u1edd duy\u1ec7t",
    tone: "is-pending",
  },
  BROWSING_RESUME: {
    label: "\u0110ang duy\u1ec7t h\u1ed3 s\u01a1",
    tone: "is-reviewing",
  },
  RESUME_FAILED: {
    label: "T\u1eeb ch\u1ed1i h\u1ed3 s\u01a1",
    tone: "is-failed",
  },
  BROWSING_INTERVIEW: {
    label: "\u0110ang duy\u1ec7t ph\u1ecfng v\u1ea5n",
    tone: "is-reviewing",
  },
  INTERVIEW_FAILED: {
    label: "Ph\u1ecfng v\u1ea5n ch\u01b0a \u0111\u1ea1t",
    tone: "is-failed",
  },
  PASSED: {
    label: "\u0110\u01b0\u1ee3c nh\u1eadn",
    tone: "is-passed",
  },
};

const getStatusMeta = (status) =>
  STATUS_META[status] || {
    label: TEXT.notUpdated,
    tone: "is-neutral",
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

function AccountEmptyState({ icon, title, description }) {
  return (
    <div className="account-empty-state">
      {icon}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function AppliedJobs() {
  const nav = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const user = useSelector((state) => state.candAuth.current);
  const isAuth = useSelector((state) => state.candAuth.isAuth);
  const candidateId = user?.id;

  const getAppliedJobs = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await candidateApi.getAppliedJobs(candidateId);
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

    getAppliedJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateId, isAuth]);

  const waitingJobs = useMemo(
    () =>
      jobs.filter((item) =>
        ["WAITING", "BROWSING_RESUME", "BROWSING_INTERVIEW"].includes(item.status)
      ).length,
    [jobs]
  );
  const passedJobs = useMemo(
    () => jobs.filter((item) => item.status === "PASSED").length,
    [jobs]
  );

  return (
    <div className="account-workspace">
      <section className="account-page-hero">
        <div>
          <span className="account-page-hero__eyebrow">
            <BsClockHistory />
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
            <strong>{waitingJobs}</strong>
            <span>{TEXT.waiting}</span>
          </div>
          <div>
            <strong>{passedJobs}</strong>
            <span>{TEXT.passed}</span>
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
              const status = getStatusMeta(item.status);

              return (
                <article className="account-job-card" key={`applied-job-${item.id}`}>
                  <div className="account-job-card__main">
                    <span className="account-job-card__icon">
                      <BsBriefcase />
                    </span>
                    <div className="account-job-card__body">
                      <div className="account-job-card__badges">
                        <span className={status.tone}>{status.label}</span>
                      </div>
                      <button
                        type="button"
                        className="account-job-card__title account-job-card__title--button"
                        onClick={() => nav(`/jobs/${item.id}`)}
                      >
                        {item.jname || TEXT.notUpdated}
                      </button>
                      <div className="account-job-card__company">
                        <BsBuilding />
                        {item.name || item.employer?.name || TEXT.notUpdated}
                      </div>
                      <div className="account-job-card__meta">
                        <span>
                          <BsCalendarEvent />
                          {item.postDate || item.created_at || TEXT.notUpdated}
                        </span>
                        <span>
                          <BsFileEarmarkText />
                          {item.cv_link ? TEXT.viewCv : TEXT.noCv}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="account-job-card__actions">
                    <button
                      type="button"
                      className="account-button account-button--primary"
                      onClick={() => nav(`/jobs/${item.id}`)}
                    >
                      {TEXT.viewJob}
                      <BsArrowRight />
                    </button>
                    {item.cv_link ? (
                      <a
                        className="account-button account-button--ghost"
                        href={item.cv_link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {TEXT.viewCv}
                      </a>
                    ) : (
                      <button className="account-button account-button--disabled" disabled>
                        {TEXT.noCv}
                      </button>
                    )}
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
          />
        )}
      </section>
    </div>
  );
}

export default AppliedJobs;
