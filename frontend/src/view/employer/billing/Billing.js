import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BsArrowClockwise,
  BsCheck2Circle,
  BsCreditCard2Front,
  BsExclamationTriangle,
  BsLightningCharge,
} from "react-icons/bs";
import { toast } from "react-toastify";
import billingApi from "../../../api/billing";
import "./billing.css";

const money = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const formatDate = (value) => {
  if (!value) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
};

const paymentStatusLabels = {
  PAID: "Đã thanh toán",
  PENDING: "Đang chờ",
  PROCESSING: "Đang xử lý",
  CANCELLED: "Đã hủy",
  FAILED: "Thất bại",
};

function StatusPill({ status }) {
  const normalized = String(status || "PENDING").toLowerCase();
  return (
    <span className={`billing-status billing-status--${normalized}`}>
      {paymentStatusLabels[status] || status || "Đang chờ"}
    </span>
  );
}

function PlanCard({ plan, activePlanKey, activePlanRank, isBusy, onCheckout }) {
  const isActive = activePlanKey === plan.key;
  const isUpgrade = activePlanRank !== null && activePlanRank !== undefined && plan.rank > activePlanRank;

  return (
    <article className={`billing-plan ${isActive ? "is-active" : ""}`}>
      <div className="billing-plan__head">
        <div>
          <h2>{plan.name}</h2>
          <p>Sử dụng trong {plan.duration_days} ngày</p>
        </div>
        {isActive && (
          <span className="billing-active-badge">
            <BsCheck2Circle />
            Đang dùng
          </span>
        )}
      </div>

      <div className="billing-plan__price">{money.format(plan.amount)}</div>

      <div className="billing-plan__quota">
        <span>{plan.job_posts} tin tuyển dụng</span>
        <span>{plan.candidate_search ? "Có tìm ứng viên" : "Không gồm tìm ứng viên"}</span>
      </div>

      <ul className="billing-feature-list">
        {plan.features.map((feature) => (
          <li key={feature}>
            <BsCheck2Circle />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="billing-primary-btn"
        disabled={isBusy}
        onClick={() => onCheckout(plan.key)}
      >
        <BsCreditCard2Front />
        {isBusy ? "Đang tạo link..." : isActive ? "Gia hạn gói" : isUpgrade ? "Nâng cấp gói" : "Thanh toán"}
      </button>
    </article>
  );
}

export default function Billing() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busyPlan, setBusyPlan] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const activePlanKey = summary?.current_subscription?.plan_key;
  const orderCode = searchParams.get("orderCode");

  const returnStatus = useMemo(() => {
    const status = searchParams.get("status");
    const cancelled = searchParams.get("cancel");
    if (!status && !cancelled) return null;
    if (cancelled === "true" || status === "CANCELLED") return "Giao dịch đã hủy.";
    if (status === "PAID") return "Thanh toán thành công, hệ thống đang đồng bộ trạng thái.";
    return "Giao dịch đang được xử lý.";
  }, [searchParams]);

  const loadSummary = async () => {
    setIsLoading(true);
    try {
      setSummary(await billingApi.getSummary());
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể tải thông tin thanh toán.");
    } finally {
      setIsLoading(false);
    }
  };

  const syncPayment = async (code) => {
    if (!code) return;

    setIsSyncing(true);
    try {
      const res = await billingApi.syncPayment(code);
      setSummary(res.summary);
      if (res.payment?.status === "PAID") {
        toast.success("Đã kích hoạt gói dịch vụ.");
      } else {
        toast.info(`Trạng thái giao dịch: ${paymentStatusLabels[res.payment?.status] || res.payment?.status || "Đang chờ"}`);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể đồng bộ giao dịch.");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!orderCode) return;

    syncPayment(orderCode).then(() => {
      setSearchParams({});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderCode]);

  const handleCheckout = async (planKey) => {
    setBusyPlan(planKey);
    try {
      const res = await billingApi.createCheckout(planKey);
      if (res.checkout_url) {
        window.location.href = res.checkout_url;
        return;
      }
      toast.error("payOS không trả về link thanh toán.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể tạo link thanh toán.");
    } finally {
      setBusyPlan("");
    }
  };

  const latestPayment = summary?.latest_payment;
  const subscription = summary?.current_subscription;
  const plans = summary?.plans || [];
  const activePlanRank =
    subscription?.plan_rank ?? plans.find((plan) => plan.key === activePlanKey)?.rank ?? null;
  const visiblePlans =
    activePlanRank === null || activePlanRank === undefined
      ? plans
      : plans.filter((plan) => plan.rank >= activePlanRank);
  const hiddenLowerPlanCount = Math.max(plans.length - visiblePlans.length, 0);

  if (isLoading && !summary) {
    return <div className="billing-page billing-loading">Đang tải thông tin thanh toán...</div>;
  }

  return (
    <div className="billing-page">
      <section className="billing-hero">
        <div>
          <div className="billing-kicker">
            <BsLightningCharge />
            Thanh toán
          </div>
          <h1>Gói dịch vụ nhà tuyển dụng</h1>
          <p>Thanh toán qua payOS để đăng tin tuyển dụng, tìm ứng viên và liên hệ hồ sơ phù hợp.</p>
        </div>

        <div className="billing-summary-card">
          <span>Trạng thái hiện tại</span>
          <strong>{subscription ? subscription.plan_name : "Chưa có gói"}</strong>
          <small>
            {subscription
              ? `Còn ${subscription.remaining_job_posts} tin, hết hạn ${formatDate(subscription.ends_at)}`
              : "Cần thanh toán để mở khóa tính năng nhà tuyển dụng."}
          </small>
        </div>
      </section>

      {returnStatus && <div className="billing-return-note">{returnStatus}</div>}

      {!summary?.payos_configured && (
        <div className="billing-alert">
          <BsExclamationTriangle />
          <span>
            Backend chưa cấu hình payOS. Cần thêm PAYOS_CLIENT_ID, PAYOS_API_KEY,
            PAYOS_CHECKSUM_KEY và FRONTEND_URL trong file .env.
          </span>
        </div>
      )}

      <section className="billing-current">
        <div>
          <h2>Gói đang hoạt động</h2>
          <p>
            {subscription
              ? `${subscription.plan_name} có hiệu lực đến ${formatDate(subscription.ends_at)}.`
              : "Chưa có gói nào được kích hoạt cho tài khoản này."}
          </p>
        </div>
        {latestPayment && (
          <div className="billing-payment-box">
            <div>
              <span>Giao dịch gần nhất</span>
              <strong>#{latestPayment.order_code}</strong>
            </div>
            <StatusPill status={latestPayment.status} />
            {latestPayment.status !== "PAID" && (
              <button
                type="button"
                className="billing-secondary-btn"
                disabled={isSyncing}
                onClick={() => syncPayment(latestPayment.order_code)}
              >
                <BsArrowClockwise />
                {isSyncing ? "Đang đồng bộ..." : "Đồng bộ"}
              </button>
            )}
          </div>
        )}
      </section>

      {hiddenLowerPlanCount > 0 && (
        <div className="billing-plan-note">
          Bạn đang dùng {subscription?.plan_name}; {hiddenLowerPlanCount} gói thấp hơn đã được ẩn để tránh mua nhầm hoặc hạ gói khi gói hiện tại còn hiệu lực.
        </div>
      )}

      <section className={`billing-plans ${visiblePlans.length === 1 ? "billing-plans--single" : ""}`}>
        {visiblePlans.map((plan) => (
          <PlanCard
            key={plan.key}
            plan={plan}
            activePlanKey={activePlanKey}
            activePlanRank={activePlanRank}
            isBusy={busyPlan === plan.key}
            onCheckout={handleCheckout}
          />
        ))}
      </section>
    </div>
  );
}
