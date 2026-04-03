import { useContext, useMemo, useState } from "react";
import Button from "react-bootstrap/Button";
import { FaUser } from "react-icons/fa";
import { BsArrowUpRight, BsGeoAltFill, BsPinMapFill } from "react-icons/bs";
import AppImage from "../../../../../../components/AppImage";
import { CandidateContext } from "../../../layouts/CandidateLayout";
import PersonalInforMapDialog from "./PersonalInforMapDialog";

const TEXT = {
  unknown: "Ch\u01b0a c\u1eadp nh\u1eadt",
  noData: "Ch\u01b0a c\u00f3",
  personalInfo: "Th\u00f4ng tin c\u00e1 nh\u00e2n",
  update: "C\u1eadp nh\u1eadt",
  objective: "M\u1ee5c ti\u00eau ngh\u1ec1 nghi\u1ec7p",
  fullName: "H\u1ecd t\u00ean",
  dob: "Ng\u00e0y sinh",
  email: "Email",
  link: "Li\u00ean k\u1ebft",
  gender: "Gi\u1edbi t\u00ednh",
  phone: "S\u1ed1 \u0111i\u1ec7n tho\u1ea1i",
  address: "\u0110\u1ecba ch\u1ec9",
  pinned: "\u0110\u00e3 ghim v\u1ecb tr\u00ed tr\u00ean b\u1ea3n \u0111\u1ed3",
  notPinned: "Ch\u01b0a ghim v\u1ecb tr\u00ed",
  googleMaps: "Xem tr\u00ean Google Maps",
  male: "Nam",
  female: "N\u1eef",
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

const buildGoogleMapsUrl = (lat, lng) => {
  if (!hasMapLocation({ map_lat: lat, map_lng: lng })) {
    return "";
  }

  return `https://www.google.com/maps/search/?api=1&query=${Number(lat)},${Number(lng)}`;
};

const genderLabel = (gender) => {
  if (gender === 0 || gender === "0") return TEXT.male;
  if (gender === 1 || gender === "1") return TEXT.female;
  return TEXT.unknown;
};

const formatDob = (value) => {
  if (!value) return TEXT.unknown;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const Field = ({ label, value, children }) => (
  <div className="mb-3">
    <div className="text-secondary small mb-1">{label}</div>
    <div className="fw-semibold">{value || children || TEXT.unknown}</div>
    {children}
  </div>
);

export default function PersonalInfor() {
  const { personal, getPersonal } = useContext(CandidateContext);
  const [isEdit, setIsEdit] = useState(false);
  const [hasImg, setHasImg] = useState(Boolean(personal?.avatar));

  const hasLocation = hasMapLocation(personal);
  const googleMapsUrl = useMemo(
    () => buildGoogleMapsUrl(personal?.map_lat, personal?.map_lng),
    [personal?.map_lat, personal?.map_lng]
  );

  return (
    <>
      <div className="section-card">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          <h5
            className="d-inline app-section-title mb-0"
            style={{ fontSize: "1.45rem" }}
          >
            {TEXT.personalInfo}
          </h5>
          <Button variant="outline-primary" size="sm" onClick={() => setIsEdit(true)}>
            {TEXT.update}
          </Button>
        </div>

        <hr />

        <div className="row g-4 align-items-start">
          <div className="col-md-3 text-center">
            {personal?.avatar ? (
              <AppImage
                src={personal.avatar}
                fallbackVariant="avatar"
                alt="avatar"
                width="170px"
                height="170px"
                className="rounded-pill mx-auto"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <FaUser
                className="rounded-pill text-bg-secondary p-2"
                style={{ fontSize: "170px" }}
              />
            )}
          </div>

          <div className="col-md-9">
            <div className="mb-4">
              <div className="text-secondary small mb-1">{TEXT.objective}</div>
              <div className="fw-semibold">{personal?.objective || TEXT.noData}</div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Field
                  label={TEXT.fullName}
                  value={
                    `${personal?.lastname || ""} ${personal?.firstname || ""}`.trim() ||
                    TEXT.unknown
                  }
                />
                <Field label={TEXT.dob} value={formatDob(personal?.dob)} />
                <Field label={TEXT.email} value={personal?.email || TEXT.unknown} />
                <Field label={TEXT.link} value={personal?.link || TEXT.noData} />
              </div>
              <div className="col-md-6">
                <Field label={TEXT.gender} value={genderLabel(personal?.gender)} />
                <Field label={TEXT.phone} value={personal?.phone || TEXT.unknown} />
                <div className="mb-3">
                  <div className="text-secondary small mb-1">{TEXT.address}</div>
                  <div className="fw-semibold">{personal?.address || TEXT.unknown}</div>
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    <span
                      className={`badge rounded-pill ${
                        hasLocation ? "text-bg-success" : "text-bg-secondary"
                      }`}
                    >
                      <BsPinMapFill className="me-1" />
                      {hasLocation ? TEXT.pinned : TEXT.notPinned}
                    </span>
                    {googleMapsUrl && (
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline-primary rounded-pill"
                      >
                        <BsArrowUpRight className="me-1" />
                        {TEXT.googleMaps}
                      </a>
                    )}
                  </div>
                </div>
                {hasLocation && (
                  <div className="mb-1 text-secondary small d-flex align-items-center gap-2">
                    <BsGeoAltFill className="text-main" />
                    <span>
                      {Number(personal.map_lat).toFixed(6)},{" "}
                      {Number(personal.map_lng).toFixed(6)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <PersonalInforMapDialog
        isEdit={isEdit}
        setIsEdit={setIsEdit}
        personal={personal}
        hasImg={hasImg}
        setHasImg={setHasImg}
        getPersonal={getPersonal}
      />
    </>
  );
}
