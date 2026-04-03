import "./admin.css";
import { useEffect, useMemo, useState } from "react";
import {
  BsEye,
  BsEyeSlash,
  BsGripVertical,
  BsImageFill,
  BsImages,
  BsLink45Deg,
  BsTrashFill,
} from "react-icons/bs";
import { toast } from "react-toastify";
import AppImage from "../../components/AppImage";
import adminApi from "../../api/admin";

const TEXT = {
  hero: "Qu\u1ea3n l\u00fd slider hero trang ch\u1ee7",
  heroDesc:
    "Th\u00eam banner cho khu hero. \u1ea2nh s\u1ebd t\u1ef1 fill full khung, tr\u01b0\u1ee3t m\u01b0\u1ee3t v\u00e0 c\u00f3 th\u1ec3 g\u1eafn \u0111\u00edch \u0111\u1ebfn khi ng\u01b0\u1eddi d\u00f9ng nh\u1ea5n v\u00e0o slide.",
  createTitle: "Th\u00eam slide m\u1edbi",
  createDesc:
    "Ch\u1ecdn \u1ea3nh, c\u1ea5u h\u00ecnh \u0111\u00edch \u0111\u1ebfn v\u00e0 \u0111\u0103ng banner l\u00ean giao di\u1ec7n trang ch\u1ee7.",
  image: "\u1ea2nh slide",
  chooseImage: "Ch\u1ecdn \u1ea3nh PNG/JPG/WEBP",
  targetType: "Ki\u1ec3u \u0111\u00edch \u0111\u1ebfn",
  targetCompany: "Trang c\u00f4ng ty",
  targetJob: "Trang vi\u1ec7c l\u00e0m",
  targetCustom: "Custom link",
  chooseCompany: "Ch\u1ecdn c\u00f4ng ty",
  chooseJob: "Ch\u1ecdn vi\u1ec7c l\u00e0m",
  customLink: "Li\u00ean k\u1ebft custom",
  customLinkPlaceholder: "V\u00ed d\u1ee5 https://example.com ho\u1eb7c /jobs/26",
  save: "Th\u00eam slide",
  saving: "\u0110ang l\u01b0u...",
  loading: "\u0110ang t\u1ea3i slide...",
  listTitle: "Danh s\u00e1ch slide hi\u1ec7n c\u00f3",
  listDesc:
    "K\u00e9o th\u1ea3 \u0111\u1ec3 s\u1eafp x\u1ebfp th\u1ee9 t\u1ef1 hi\u1ec3n th\u1ecb. C\u00f3 th\u1ec3 b\u1eadt/t\u1eaft nhanh t\u1eebng slide.",
  empty: "Ch\u01b0a c\u00f3 slide n\u00e0o. H\u00e3y th\u00eam \u1ea3nh \u0111\u1ea7u ti\u00ean cho trang ch\u1ee7.",
  delete: "X\u00f3a",
  deleting: "\u0110ang x\u00f3a...",
  hide: "\u1ea8n slide",
  show: "Hi\u1ec7n slide",
  updating: "\u0110ang c\u1eadp nh\u1eadt...",
  reorderHint: "K\u00e9o th\u1ea3 \u0111\u1ec3 \u0111\u1ed5i th\u1ee9 t\u1ef1",
  dragHandle: "K\u00e9o \u0111\u1ec3 s\u1eafp x\u1ebfp",
  orderLabel: "Th\u1ee9 t\u1ef1",
  deleteSuccess: "\u0110\u00e3 x\u00f3a slide.",
  createSuccess: "\u0110\u00e3 th\u00eam slide m\u1edbi.",
  orderSuccess: "\u0110\u00e3 c\u1eadp nh\u1eadt th\u1ee9 t\u1ef1 slide.",
  toggleSuccess: "\u0110\u00e3 c\u1eadp nh\u1eadt tr\u1ea1ng th\u00e1i hi\u1ec3n th\u1ecb.",
  loadFailed: "Kh\u00f4ng th\u1ec3 t\u1ea3i danh s\u00e1ch slide.",
  saveFailed: "Kh\u00f4ng th\u1ec3 l\u01b0u slide.",
  deleteFailed: "Kh\u00f4ng th\u1ec3 x\u00f3a slide.",
  reorderFailed: "Kh\u00f4ng th\u1ec3 c\u1eadp nh\u1eadt th\u1ee9 t\u1ef1 slide.",
  toggleFailed: "Kh\u00f4ng th\u1ec3 c\u1eadp nh\u1eadt tr\u1ea1ng th\u00e1i slide.",
  imageRequired: "Vui l\u00f2ng ch\u1ecdn \u1ea3nh slide.",
  companyRequired: "Vui l\u00f2ng ch\u1ecdn c\u00f4ng ty \u0111\u00edch.",
  jobRequired: "Vui l\u00f2ng ch\u1ecdn vi\u1ec7c l\u00e0m \u0111\u00edch.",
  customRequired: "Vui l\u00f2ng nh\u1eadp li\u00ean k\u1ebft custom.",
  publicTarget: "\u0110\u00edch \u0111\u1ebfn",
  uploadedAt: "T\u1ea1o l\u00fac",
  activeState: "\u0110ang hi\u1ec3n th\u1ecb",
  hiddenState: "\u0110ang \u1ea9n",
  slideCountSuffix: "slide \u0111ang c\u1ea5u h\u00ecnh",
  supportText: "H\u1ed7 tr\u1ee3 c\u00f4ng ty, vi\u1ec7c l\u00e0m v\u00e0 custom link",
  noTarget: "Kh\u00f4ng c\u00f3 li\u00ean k\u1ebft",
};

const initialForm = {
  target_type: "company",
  target_company_id: "",
  target_job_id: "",
  custom_url: "",
};

const reorderSlides = (slides, sourceId, targetId) => {
  if (sourceId === targetId) {
    return slides;
  }

  const sourceIndex = slides.findIndex((slide) => slide.id === sourceId);
  const targetIndex = slides.findIndex((slide) => slide.id === targetId);

  if (sourceIndex === -1 || targetIndex === -1) {
    return slides;
  }

  const nextSlides = [...slides];
  const [movedSlide] = nextSlides.splice(sourceIndex, 1);
  nextSlides.splice(targetIndex, 0, movedSlide);

  return nextSlides.map((slide, index) => ({
    ...slide,
    sort_order: index + 1,
  }));
};

export default function AdminAppearance() {
  const [slides, setSlides] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [isReordering, setIsReordering] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getHeroSlides();
      setSlides(response?.slides || []);
      setCompanies(response?.companies || []);
      setJobs(response?.jobs || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || TEXT.loadFailed);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const jobOptions = useMemo(
    () =>
      jobs.map((job) => ({
        ...job,
        label: `${job.jname} - ${job.employer_name}`,
      })),
    [jobs]
  );

  const resetForm = () => {
    setForm(initialForm);
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview("");
  };

  const handleChangeForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleChangeTargetType = (event) => {
    const nextType = event.target.value;
    setForm({
      target_type: nextType,
      target_company_id: "",
      target_job_id: "",
      custom_url: "",
    });
  };

  const handleChooseImage = (event) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) {
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(nextFile);
    setImagePreview(URL.createObjectURL(nextFile));
  };

  const validateForm = () => {
    if (!imageFile) {
      toast.error(TEXT.imageRequired);
      return false;
    }

    if (form.target_type === "company" && !form.target_company_id) {
      toast.error(TEXT.companyRequired);
      return false;
    }

    if (form.target_type === "job" && !form.target_job_id) {
      toast.error(TEXT.jobRequired);
      return false;
    }

    if (form.target_type === "custom" && !form.custom_url.trim()) {
      toast.error(TEXT.customRequired);
      return false;
    }

    return true;
  };

  const handleCreateSlide = async () => {
    if (!validateForm()) {
      return;
    }

    const payload = new FormData();
    payload.append("image", imageFile);
    payload.append("target_type", form.target_type);

    if (form.target_type === "company") {
      payload.append("target_company_id", form.target_company_id);
    }

    if (form.target_type === "job") {
      payload.append("target_job_id", form.target_job_id);
    }

    if (form.target_type === "custom") {
      payload.append("custom_url", form.custom_url.trim());
    }

    payload.append("is_active", 1);

    setIsSaving(true);
    try {
      await adminApi.createHeroSlide(payload);
      toast.success(TEXT.createSuccess);
      resetForm();
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || TEXT.saveFailed);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSlide = async (id) => {
    setDeletingId(id);
    try {
      await adminApi.deleteHeroSlide(id);
      toast.success(TEXT.deleteSuccess);
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || TEXT.deleteFailed);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleSlide = async (slide) => {
    setUpdatingId(slide.id);
    const previousSlides = slides;
    setSlides((current) =>
      current.map((item) =>
        item.id === slide.id ? { ...item, is_active: !item.is_active } : item
      )
    );

    try {
      await adminApi.updateHeroSlideStatus(slide.id, {
        is_active: slide.is_active ? 0 : 1,
      });
      toast.success(TEXT.toggleSuccess);
    } catch (error) {
      setSlides(previousSlides);
      toast.error(error?.response?.data?.message || TEXT.toggleFailed);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDragStart = (slideId) => {
    setDraggingId(slideId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  const handleDrop = async (targetId) => {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      return;
    }

    const previousSlides = slides;
    const nextSlides = reorderSlides(slides, draggingId, targetId);
    setSlides(nextSlides);
    setDraggingId(null);
    setIsReordering(true);

    try {
      await adminApi.reorderHeroSlides({
        orders: nextSlides.map((slide, index) => ({
          id: slide.id,
          sort_order: index + 1,
        })),
      });
      toast.success(TEXT.orderSuccess);
    } catch (error) {
      setSlides(previousSlides);
      toast.error(error?.response?.data?.message || TEXT.reorderFailed);
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <div className="system-admin-dashboard">
      <section className="system-admin-hero">
        <div>
          <div className="system-admin-kicker">Appearance control</div>
          <h1>{TEXT.hero}</h1>
          <p>{TEXT.heroDesc}</p>
        </div>
        <div className="system-admin-hero__meta">
          <div className="system-admin-chip">
            <BsImages />
            <span>
              {slides.length} {TEXT.slideCountSuffix}
            </span>
          </div>
          <div className="system-admin-chip">
            <BsLink45Deg />
            <span>{TEXT.supportText}</span>
          </div>
        </div>
      </section>

      <div className="system-admin-chart-grid">
        <section className="system-panel">
          <div className="system-panel__head">
            <div>
              <h2>{TEXT.createTitle}</h2>
              <p>{TEXT.createDesc}</p>
            </div>
          </div>

          <div className="system-appearance-grid">
            <div className="system-appearance-preview">
              <div className="system-appearance-preview__frame">
                {imagePreview ? (
                  <img src={imagePreview} alt="slide_preview" />
                ) : (
                  <div className="system-empty-state system-empty-state--compact">
                    {TEXT.chooseImage}
                  </div>
                )}
              </div>
            </div>

            <div className="system-appearance-form">
              <label>
                <span>{TEXT.image}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleChooseImage}
                />
              </label>

              <label>
                <span>{TEXT.targetType}</span>
                <select value={form.target_type} onChange={handleChangeTargetType}>
                  <option value="company">{TEXT.targetCompany}</option>
                  <option value="job">{TEXT.targetJob}</option>
                  <option value="custom">{TEXT.targetCustom}</option>
                </select>
              </label>

              {form.target_type === "company" && (
                <label>
                  <span>{TEXT.chooseCompany}</span>
                  <select
                    name="target_company_id"
                    value={form.target_company_id}
                    onChange={handleChangeForm}
                  >
                    <option value="">-- {TEXT.chooseCompany} --</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {form.target_type === "job" && (
                <label>
                  <span>{TEXT.chooseJob}</span>
                  <select
                    name="target_job_id"
                    value={form.target_job_id}
                    onChange={handleChangeForm}
                  >
                    <option value="">-- {TEXT.chooseJob} --</option>
                    {jobOptions.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {form.target_type === "custom" && (
                <label>
                  <span>{TEXT.customLink}</span>
                  <input
                    name="custom_url"
                    value={form.custom_url}
                    onChange={handleChangeForm}
                    placeholder={TEXT.customLinkPlaceholder}
                  />
                </label>
              )}

              <button
                type="button"
                className="admin-primary-btn"
                onClick={handleCreateSlide}
                disabled={isSaving}
              >
                <BsImageFill />
                <span>{isSaving ? TEXT.saving : TEXT.save}</span>
              </button>
            </div>
          </div>
        </section>

        <section className="system-panel">
          <div className="system-panel__head">
            <div>
              <h2>{TEXT.listTitle}</h2>
              <p>{TEXT.listDesc}</p>
            </div>
            {isReordering && <span className="app-soft-badge">{TEXT.updating}</span>}
          </div>

          {isLoading ? (
            <div className="system-empty-state">{TEXT.loading}</div>
          ) : slides.length === 0 ? (
            <div className="system-empty-state">{TEXT.empty}</div>
          ) : (
            <div className="system-slide-list">
              {slides.map((slide, index) => (
                <article
                  key={slide.id}
                  className={`system-slide-card ${
                    draggingId === slide.id ? "is-dragging" : ""
                  }`}
                  draggable
                  onDragStart={() => handleDragStart(slide.id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleDrop(slide.id)}
                >
                  <div className="system-slide-card__image">
                    <AppImage
                      src={slide.image}
                      fallbackVariant="cover"
                      alt={`slide_${slide.id}`}
                    />
                  </div>
                  <div className="system-slide-card__body">
                    <div className="system-slide-card__meta">
                      <span className="system-badge system-badge--muted">
                        {slide.target_type}
                      </span>
                      <span
                        className={`system-badge ${
                          slide.is_active ? "is-active" : "is-locked"
                        }`}
                      >
                        {slide.is_active ? TEXT.activeState : TEXT.hiddenState}
                      </span>
                    </div>

                    <div className="system-slide-card__topline">
                      <div className="system-slide-card__title">
                        {slide.target_label || TEXT.publicTarget}
                      </div>
                      <div
                        className="system-slide-card__drag"
                        title={TEXT.dragHandle}
                        aria-label={TEXT.dragHandle}
                      >
                        <BsGripVertical />
                        <span>
                          {TEXT.orderLabel} {index + 1}
                        </span>
                      </div>
                    </div>

                    <div className="system-slide-card__link">
                      {slide.target_url || TEXT.noTarget}
                    </div>
                    <div className="system-slide-card__time">
                      {TEXT.uploadedAt}: {slide.created_at || "-"}
                    </div>
                    <div className="system-slide-card__hint">{TEXT.reorderHint}</div>

                    <div className="system-slide-card__actions">
                      <button
                        type="button"
                        className="admin-secondary-btn"
                        onClick={() => handleToggleSlide(slide)}
                        disabled={updatingId === slide.id}
                      >
                        {slide.is_active ? <BsEyeSlash /> : <BsEye />}
                        <span>
                          {updatingId === slide.id
                            ? TEXT.updating
                            : slide.is_active
                            ? TEXT.hide
                            : TEXT.show}
                        </span>
                      </button>

                      <button
                        type="button"
                        className="admin-danger-btn"
                        onClick={() => handleDeleteSlide(slide.id)}
                        disabled={deletingId === slide.id}
                      >
                        <BsTrashFill />
                        <span>{deletingId === slide.id ? TEXT.deleting : TEXT.delete}</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
