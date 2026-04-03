import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import Button from "react-bootstrap/Button";
import RequiredMark from "../../../../../../components/form/requiredMark/RequiredMark";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "react-bootstrap/Modal";
import { FaUser } from "react-icons/fa";
import {
  BsArrowClockwise,
  BsArrowUpRight,
  BsFillGeoAltFill,
  BsPinMapFill,
  BsSearch,
  BsTrashFill,
  BsZoomIn,
} from "react-icons/bs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import candidateApi from "../../../../../../api/candidate";

const LEAFLET_JS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const LEAFLET_CSS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const DEFAULT_CENTER = [21.028511, 105.804817];
const DEFAULT_ZOOM = 6;
const FOCUS_ZOOM = 16;
const AVATAR_VIEWPORT_SIZE = 280;
const AVATAR_OUTPUT_SIZE = 640;

const TEXT = {
  emptyRequired: "Kh\u00f4ng \u0111\u01b0\u1ee3c \u0111\u1ec3 tr\u1ed1ng",
  invalidPhone: "Sai \u0111\u1ecbnh d\u1ea1ng s\u1ed1 \u0111i\u1ec7n tho\u1ea1i",
  invalidEmail: "Sai \u0111\u1ecbnh d\u1ea1ng email",
  invalidUrl: "Sai \u0111\u1ecbnh d\u1ea1ng URL",
  noCoordinates: "Ch\u01b0a c\u00f3 t\u1ecda \u0111\u1ed9",
  reverseGeocodeFailed: "Kh\u00f4ng th\u1ec3 l\u1ea5y \u0111\u1ecba ch\u1ec9 t\u1eeb b\u1ea3n \u0111\u1ed3.",
  searchFailed: "Kh\u00f4ng th\u1ec3 t\u00ecm ki\u1ebfm \u0111\u1ecba \u0111i\u1ec3m.",
  selectedAddressFailed: "Kh\u00f4ng th\u1ec3 l\u1ea5y \u0111\u1ecba ch\u1ec9 t\u1eeb v\u1ecb tr\u00ed \u0111\u00e3 ch\u1ecdn.",
  sharedMapMissing: "H\u00e3y nh\u1eadp li\u00ean k\u1ebft chia s\u1ebb Google Maps.",
  sharedMapCoordinateFailed: "Kh\u00f4ng \u0111\u1ecdc \u0111\u01b0\u1ee3c t\u1ecda \u0111\u1ed9 t\u1eeb li\u00ean k\u1ebft Google Maps.",
  sharedMapFailed: "Kh\u00f4ng th\u1ec3 x\u1eed l\u00fd li\u00ean k\u1ebft Google Maps.",
  sharedMapSuccess: "\u0110\u00e3 l\u1ea5y v\u1ecb tr\u00ed t\u1eeb li\u00ean k\u1ebft Google Maps.",
  gpsUnsupported: "Tr\u00ecnh duy\u1ec7t hi\u1ec7n t\u1ea1i kh\u00f4ng h\u1ed7 tr\u1ee3 GPS.",
  gpsDenied: "B\u1ea1n \u0111\u00e3 t\u1eeb ch\u1ed1i quy\u1ec1n truy c\u1eadp v\u1ecb tr\u00ed.",
  gpsUnavailable: "Kh\u00f4ng x\u00e1c \u0111\u1ecbnh \u0111\u01b0\u1ee3c v\u1ecb tr\u00ed hi\u1ec7n t\u1ea1i.",
  gpsTimeout: "Y\u00eau c\u1ea7u l\u1ea5y v\u1ecb tr\u00ed \u0111\u00e3 h\u1ebft th\u1eddi gian.",
  gpsFailed: "Kh\u00f4ng th\u1ec3 l\u1ea5y v\u1ecb tr\u00ed hi\u1ec7n t\u1ea1i.",
  gpsSuccess: "\u0110\u00e3 l\u1ea5y v\u1ecb tr\u00ed hi\u1ec7n t\u1ea1i.",
  updateSuccess: "C\u1eadp nh\u1eadt th\u00f4ng tin c\u00e1 nh\u00e2n th\u00e0nh c\u00f4ng.",
  updateFailed: "Kh\u00f4ng th\u1ec3 c\u1eadp nh\u1eadt th\u00f4ng tin c\u00e1 nh\u00e2n.",
  loadMapFailed: "Kh\u00f4ng th\u1ec3 t\u1ea3i b\u1ea3n \u0111\u1ed3. H\u00e3y ki\u1ec3m tra k\u1ebft n\u1ed1i m\u1ea1ng.",
  personalInfo: "Th\u00f4ng tin c\u00e1 nh\u00e2n",
  uploadImage: "T\u1ea3i \u1ea3nh l\u00ean",
  deleteImage: "X\u00f3a \u1ea3nh",
  avatarEditor: "Ch\u1ec9nh \u1ea3nh \u0111\u1ea1i di\u1ec7n",
  avatarEditorSub: "K\u00e9o \u1ea3nh trong khung tr\u00f2n v\u00e0 d\u00f9ng thanh zoom \u0111\u1ec3 canh t\u1ef7 l\u1ec7 hi\u1ec3n th\u1ecb.",
  avatarZoom: "Thu ph\u00f3ng",
  avatarPreview: "Xem nhanh",
  avatarChooseHint: "Ch\u1ecdn \u1ea3nh PNG/JPG/WEBP \u0111\u1ec3 c\u1eadp nh\u1eadt avatar.",
  fullName: "H\u1ecd v\u00e0 t\u00ean",
  lastName: "H\u1ecd",
  firstName: "T\u00ean",
  fullNameRequired: "Vui l\u00f2ng nh\u1eadp \u0111\u1ee7 h\u1ecd v\u00e0 t\u00ean",
  gender: "Gi\u1edbi t\u00ednh",
  male: "Nam",
  female: "N\u1eef",
  dob: "Ng\u00e0y sinh",
  phone: "S\u1ed1 \u0111i\u1ec7n tho\u1ea1i",
  email: "Email",
  displayAddress: "\u0110\u1ecba ch\u1ec9 hi\u1ec3n th\u1ecb",
  displayAddressPlaceholder: "Ch\u1ecdn \u0111\u1ecba ch\u1ec9 t\u1eeb b\u1ea3n \u0111\u1ed3 b\u00ean d\u01b0\u1edbi",
  link: "Li\u00ean k\u1ebft",
  homeMapTitle: "V\u1ecb tr\u00ed n\u01a1i \u1edf tr\u00ean b\u1ea3n \u0111\u1ed3",
  homeMapSub: "T\u00ecm \u0111\u1ecba \u0111i\u1ec3m, d\u00e1n link Google Maps ho\u1eb7c d\u00f9ng GPS \u0111\u1ec3 ghim n\u01a1i \u1edf c\u1ee7a b\u1ea1n.",
  openLargeMap: "M\u1edf b\u1ea3n \u0111\u1ed3 l\u1edbn",
  searchPlaceholder: "T\u00ecm t\u00ean \u0111\u01b0\u1eddng, qu\u1eadn, th\u00e0nh ph\u1ed1...",
  searching: "\u0110ang t\u00ecm...",
  search: "T\u00ecm",
  clearLocation: "X\u00f3a v\u1ecb tr\u00ed",
  sharedMapPlaceholder: "D\u00e1n link chia s\u1ebb Google Maps, v\u00ed d\u1ee5 https://maps.app.goo.gl/...",
  resolvingLink: "\u0110ang \u0111\u1ecdc link...",
  useGoogleMapsLink: "D\u00f9ng link Google Maps",
  locatingGps: "\u0110ang l\u1ea5y GPS...",
  useCurrentLocation: "D\u00f9ng v\u1ecb tr\u00ed hi\u1ec7n t\u1ea1i",
  displayAddressCard: "\u0110\u1ecba ch\u1ec9 hi\u1ec3n th\u1ecb",
  loadingAddress: "\u0110ang l\u1ea5y \u0111\u1ecba ch\u1ec9...",
  noLocationSelected: "Ch\u01b0a ch\u1ecdn v\u1ecb tr\u00ed",
  coordinates: "T\u1ecda \u0111\u1ed9",
  objective: "M\u1ee5c ti\u00eau ngh\u1ec1 nghi\u1ec7p",
  save: "L\u01b0u",
  cancel: "H\u1ee7y",
  currentLocationLabel: "V\u1ecb tr\u00ed hi\u1ec7n t\u1ea1i",
};

const hasMapLocation = (profile) => Boolean(profile?.map_lat !== null && profile?.map_lat !== undefined && profile?.map_lat !== "" && profile?.map_lng !== null && profile?.map_lng !== undefined && profile?.map_lng !== "");

const buildMapExternalUrl = (lat, lng) => {
  if (!hasMapLocation({ map_lat: lat, map_lng: lng })) return "";
  return `https://www.openstreetmap.org/?mlat=${Number(lat)}&mlon=${Number(lng)}#map=16/${Number(lat)}/${Number(lng)}`;
};

const formatCoordinates = (lat, lng) => {
  if (!hasMapLocation({ map_lat: lat, map_lng: lng })) return TEXT.noCoordinates;
  return `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`;
};

const ensureLeaflet = async () => {
  if (window.L) return window.L;
  if (!document.querySelector(`link[href="${LEAFLET_CSS_URL}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = LEAFLET_CSS_URL;
    document.head.appendChild(link);
  }
  await new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${LEAFLET_JS_URL}"]`);
    if (existing) {
      if (window.L) {
        resolve();
        return;
      }
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = LEAFLET_JS_URL;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
  return window.L;
};

const reverseGeocode = async (lat, lng) => {
  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=vi`);
  if (!res.ok) throw new Error(TEXT.reverseGeocodeFailed);
  const data = await res.json();
  return data.display_name || `${lat}, ${lng}`;
};

const searchLocation = async (query) => {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&accept-language=vi&q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(TEXT.searchFailed);
  return res.json();
};

const loadImageElement = (src) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = reject;
  image.src = src;
});

const getBaseScale = (width, height) => Math.max(AVATAR_VIEWPORT_SIZE / width, AVATAR_VIEWPORT_SIZE / height);

const clampCropPosition = (position, naturalSize, scale) => {
  if (!naturalSize.width || !naturalSize.height || !scale) return { x: 0, y: 0 };
  const displayWidth = naturalSize.width * scale;
  const displayHeight = naturalSize.height * scale;
  const limitX = Math.max(0, (displayWidth - AVATAR_VIEWPORT_SIZE) / 2);
  const limitY = Math.max(0, (displayHeight - AVATAR_VIEWPORT_SIZE) / 2);
  return {
    x: Math.min(limitX, Math.max(-limitX, position.x)),
    y: Math.min(limitY, Math.max(-limitY, position.y)),
  };
};

const buildAvatarCropFile = async ({ imageUrl, file, naturalSize, zoom, position }) => {
  const image = await loadImageElement(imageUrl);
  const mimeType = file?.type && /^image\/(png|jpeg|jpg|webp)$/i.test(file.type) ? (file.type === "image/jpg" ? "image/jpeg" : file.type) : "image/jpeg";
  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_OUTPUT_SIZE;
  canvas.height = AVATAR_OUTPUT_SIZE;
  const baseScale = getBaseScale(naturalSize.width, naturalSize.height);
  const currentScale = baseScale * zoom;
  const sourceSize = AVATAR_VIEWPORT_SIZE / currentScale;
  const displayWidth = naturalSize.width * currentScale;
  const displayHeight = naturalSize.height * currentScale;
  const sourceX = Math.max(0, Math.min(naturalSize.width - sourceSize, ((displayWidth - AVATAR_VIEWPORT_SIZE) / 2 - position.x) / currentScale));
  const sourceY = Math.max(0, Math.min(naturalSize.height - sourceSize, ((displayHeight - AVATAR_VIEWPORT_SIZE) / 2 - position.y) / currentScale));
  const context = canvas.getContext("2d");
  context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, AVATAR_OUTPUT_SIZE, AVATAR_OUTPUT_SIZE);
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((nextBlob) => {
      if (!nextBlob) {
        reject(new Error("crop_failed"));
        return;
      }
      resolve(nextBlob);
    }, mimeType, 0.92);
  });
  const extension = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  const baseName = (file?.name || "avatar").replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}_cropped.${extension}`, { type: mimeType });
};

const CropPreview = ({ imageUrl, naturalSize, zoom, position, size }) => {
  if (!imageUrl || !naturalSize.width || !naturalSize.height) return null;
  const scale = getBaseScale(naturalSize.width, naturalSize.height) * zoom;
  return (
    <div style={{ position: "relative", width: size, height: size, overflow: "hidden", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.9)", boxShadow: "0 18px 34px rgba(15, 23, 42, 0.18)", background: "#0f172a" }}>
      <img
        src={imageUrl}
        alt="avatar_preview"
        draggable={false}
        style={{ position: "absolute", top: "50%", left: "50%", width: naturalSize.width, height: naturalSize.height, transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${scale})`, transformOrigin: "center center", userSelect: "none", pointerEvents: "none" }}
      />
    </div>
  );
};

export default function PersonalInforMapDialog({ isEdit, setIsEdit, personal, setHasImg, getPersonal }) {
  const schema = yup.object({
    lastname: yup.string().required(TEXT.emptyRequired),
    firstname: yup.string().required(TEXT.emptyRequired),
    gender: yup.number().required(TEXT.emptyRequired),
    dob: yup.string().required(TEXT.emptyRequired),
    phone: yup.string().required(TEXT.emptyRequired).matches(/^[0-9]{10}$/, TEXT.invalidPhone),
    email: yup.string().email(TEXT.invalidEmail).required(TEXT.emptyRequired),
    address: yup.string().required(TEXT.emptyRequired),
    link: yup.string().nullable().transform((value) => value || null).url(TEXT.invalidUrl),
  });

  const { register, formState: { errors }, handleSubmit, setValue } = useForm({ resolver: yupResolver(schema) });

  const [isDeleteImg, setIsDeleteImg] = useState(false);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState("");
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [cropNaturalSize, setCropNaturalSize] = useState({ width: 0, height: 0 });
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [sharedMapUrl, setSharedMapUrl] = useState("");
  const [mapSearchResults, setMapSearchResults] = useState([]);
  const [isMapSearching, setIsMapSearching] = useState(false);
  const [isResolvingSharedMapUrl, setIsResolvingSharedMapUrl] = useState(false);
  const [isLocatingCurrentPosition, setIsLocatingCurrentPosition] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [mapError, setMapError] = useState("");
  const [selectedAddress, setSelectedAddress] = useState(personal.address || "");
  const [mapLat, setMapLat] = useState(personal?.map_lat !== null && personal?.map_lat !== undefined ? String(personal.map_lat) : "");
  const [mapLng, setMapLng] = useState(personal?.map_lng !== null && personal?.map_lng !== undefined ? String(personal.map_lng) : "");
  const mapNodeRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const fileInputRef = useRef(null);
  const dragStateRef = useRef(null);
  const cropScale = useMemo(() => cropNaturalSize.width && cropNaturalSize.height ? getBaseScale(cropNaturalSize.width, cropNaturalSize.height) * cropZoom : 0, [cropNaturalSize.height, cropNaturalSize.width, cropZoom]);

  const currentAvatarSrc = useMemo(() => {
    if (selectedAvatarUrl) return selectedAvatarUrl;
    if (isDeleteImg) return "";
    return personal.avatar || "";
  }, [isDeleteImg, personal.avatar, selectedAvatarUrl]);

  const syncMarker = useCallback((lat, lng) => {
    if (!mapRef.current || !window.L || !hasMapLocation({ map_lat: lat, map_lng: lng })) return;
    const point = [Number(lat), Number(lng)];
    if (!markerRef.current) {
      markerRef.current = window.L.marker(point).addTo(mapRef.current);
    } else {
      markerRef.current.setLatLng(point);
    }
    mapRef.current.setView(point, FOCUS_ZOOM);
  }, []);

  const clearMarker = useCallback(() => {
    if (markerRef.current && mapRef.current) {
      mapRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
  }, []);

  const updateLocationFields = useCallback((nextAddress, lat, lng) => {
    const safeAddress = nextAddress ? String(nextAddress).slice(0, 255) : "";
    const nextLat = lat === null || lat === undefined || lat === "" ? "" : String(lat);
    const nextLng = lng === null || lng === undefined || lng === "" ? "" : String(lng);
    setSelectedAddress(safeAddress);
    setMapLat(nextLat);
    setMapLng(nextLng);
    setValue("address", safeAddress, { shouldDirty: true, shouldValidate: true });
  }, [setValue]);

  const handleMapSelection = useCallback(async (lat, lng) => {
    try {
      setMapError("");
      setIsResolvingAddress(true);
      syncMarker(lat, lng);
      const address = await reverseGeocode(lat, lng);
      updateLocationFields(address, lat, lng);
    } catch (error) {
      setMapError(error.message || TEXT.selectedAddressFailed);
      updateLocationFields(selectedAddress || `${lat}, ${lng}`, lat, lng);
    } finally {
      setIsResolvingAddress(false);
    }
  }, [selectedAddress, syncMarker, updateLocationFields]);

  const resetCropState = useCallback(() => {
    setCropZoom(1);
    setCropPosition({ x: 0, y: 0 });
    setCropNaturalSize({ width: 0, height: 0 });
  }, []);

  const handleDisplayImg = async (event) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;
    if (selectedAvatarUrl) {
      URL.revokeObjectURL(selectedAvatarUrl);
    }
    const nextPreview = URL.createObjectURL(nextFile);
    setSelectedAvatarUrl(nextPreview);
    setSelectedAvatarFile(nextFile);
    setHasImg(true);
    setIsDeleteImg(false);
    resetCropState();
    try {
      const image = await loadImageElement(nextPreview);
      setCropNaturalSize({ width: image.naturalWidth || image.width, height: image.naturalHeight || image.height });
    } catch (error) {
      setCropNaturalSize({ width: 0, height: 0 });
    }
  };

  const handleDeleteImg = () => {
    if (selectedAvatarUrl) {
      URL.revokeObjectURL(selectedAvatarUrl);
    }
    setSelectedAvatarUrl("");
    setSelectedAvatarFile(null);
    setHasImg(false);
    setIsDeleteImg(true);
    resetCropState();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSearchMap = async () => {
    if (!mapSearchQuery.trim()) {
      setMapSearchResults([]);
      return;
    }
    try {
      setMapError("");
      setIsMapSearching(true);
      setMapSearchResults(await searchLocation(mapSearchQuery.trim()));
    } catch (error) {
      setMapError(error.message || TEXT.searchFailed);
    } finally {
      setIsMapSearching(false);
    }
  };

  const handleSelectMapResult = (result) => {
    const lat = Number(result.lat);
    const lng = Number(result.lon);
    setMapSearchResults([]);
    setMapSearchQuery(result.display_name || "");
    syncMarker(lat, lng);
    updateLocationFields(result.display_name || `${lat}, ${lng}`, lat, lng);
  };

  const handleClearMapLocation = () => {
    setMapSearchQuery("");
    setSharedMapUrl("");
    setMapSearchResults([]);
    setMapError("");
    clearMarker();
    updateLocationFields("", "", "");
  };

  const handleResolveSharedMapUrl = async () => {
    if (!sharedMapUrl.trim()) {
      setMapError(TEXT.sharedMapMissing);
      return;
    }
    try {
      setMapError("");
      setIsResolvingSharedMapUrl(true);
      const response = await candidateApi.resolveSharedMapLink({ url: sharedMapUrl.trim() });
      const lat = Number(response?.lat);
      const lng = Number(response?.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        throw new Error(TEXT.sharedMapCoordinateFailed);
      }
      setMapSearchResults([]);
      setMapSearchQuery(response?.resolved_url || `${lat}, ${lng}`);
      await handleMapSelection(lat, lng);
      toast.success(TEXT.sharedMapSuccess);
    } catch (error) {
      setMapError(error?.response?.data?.message || error?.message || TEXT.sharedMapFailed);
    } finally {
      setIsResolvingSharedMapUrl(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setMapError(TEXT.gpsUnsupported);
      return;
    }
    try {
      setMapError("");
      setIsLocatingCurrentPosition(true);
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        });
      });
      const lat = Number(position.coords.latitude);
      const lng = Number(position.coords.longitude);
      setMapSearchResults([]);
      setMapSearchQuery(TEXT.currentLocationLabel);
      await handleMapSelection(lat, lng);
      toast.success(TEXT.gpsSuccess);
    } catch (error) {
      if (error?.code === 1) setMapError(TEXT.gpsDenied);
      else if (error?.code === 2) setMapError(TEXT.gpsUnavailable);
      else if (error?.code === 3) setMapError(TEXT.gpsTimeout);
      else setMapError(TEXT.gpsFailed);
    } finally {
      setIsLocatingCurrentPosition(false);
    }
  };

  const handleCropMouseDown = (event) => {
    if (!selectedAvatarUrl || !cropNaturalSize.width || !cropScale) return;
    event.preventDefault();
    dragStateRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      startPosition: cropPosition,
    };
  };
  useEffect(() => {
    const handlePointerMove = (event) => {
      if (!dragStateRef.current) return;
      const deltaX = event.clientX - dragStateRef.current.startX;
      const deltaY = event.clientY - dragStateRef.current.startY;
      const nextPosition = clampCropPosition({ x: dragStateRef.current.startPosition.x + deltaX, y: dragStateRef.current.startPosition.y + deltaY }, cropNaturalSize, cropScale);
      setCropPosition(nextPosition);
    };
    const stopDragging = () => {
      dragStateRef.current = null;
    };
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", stopDragging);
    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", stopDragging);
    };
  }, [cropNaturalSize, cropScale]);

  const handleZoomChange = (event) => {
    const nextZoom = Number(event.target.value);
    setCropZoom(nextZoom);
    setCropPosition((prev) => clampCropPosition(prev, cropNaturalSize, getBaseScale(cropNaturalSize.width, cropNaturalSize.height) * nextZoom));
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("lastname", data.lastname);
    formData.append("firstname", data.firstname);
    formData.append("gender", data.gender);
    formData.append("dob", data.dob);
    formData.append("phone", data.phone);
    formData.append("email", data.email);
    formData.append("address", selectedAddress || "");
    formData.append("map_lat", mapLat || "");
    formData.append("map_lng", mapLng || "");
    formData.append("link", data.link || "");
    formData.append("objective", data.objective || "");
    if (selectedAvatarFile && selectedAvatarUrl && cropNaturalSize.width) {
      const croppedFile = await buildAvatarCropFile({ imageUrl: selectedAvatarUrl, file: selectedAvatarFile, naturalSize: cropNaturalSize, zoom: cropZoom, position: cropPosition });
      formData.append("image", croppedFile);
    }
    if (isDeleteImg) formData.append("delete_img", 1);
    try {
      await candidateApi.update(formData);
      toast.success(TEXT.updateSuccess);
      await getPersonal();
      setIsEdit(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || TEXT.updateFailed);
    }
  };

  useEffect(() => {
    setHasImg(Boolean(personal.avatar));
    setIsDeleteImg(false);
    setSelectedAvatarFile(null);
    setSelectedAvatarUrl("");
    resetCropState();
    setSelectedAddress(personal.address || "");
    setMapLat(personal?.map_lat !== null && personal?.map_lat !== undefined ? String(personal.map_lat) : "");
    setMapLng(personal?.map_lng !== null && personal?.map_lng !== undefined ? String(personal.map_lng) : "");
    setMapSearchQuery("");
    setSharedMapUrl("");
    setMapSearchResults([]);
    setMapError("");
    setValue("address", personal.address || "");
    setValue("lastname", personal.lastname || "");
    setValue("firstname", personal.firstname || "");
    setValue("gender", personal.gender ?? "");
    setValue("dob", personal.dob || "");
    setValue("phone", personal.phone || "");
    setValue("email", personal.email || "");
    setValue("link", personal.link || "");
    setValue("objective", personal.objective || "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [personal, resetCropState, setHasImg, setValue]);

  useEffect(() => () => {
    if (selectedAvatarUrl) {
      URL.revokeObjectURL(selectedAvatarUrl);
    }
  }, [selectedAvatarUrl]);

  useEffect(() => {
    let isMounted = true;
    const bootMap = async () => {
      if (!isEdit) return;
      try {
        const leaflet = await ensureLeaflet();
        if (!isMounted || !mapNodeRef.current || mapRef.current) return;
        const hasLocation = hasMapLocation({ map_lat: mapLat, map_lng: mapLng });
        mapRef.current = leaflet.map(mapNodeRef.current, {
          center: hasLocation ? [Number(mapLat), Number(mapLng)] : DEFAULT_CENTER,
          zoom: hasLocation ? FOCUS_ZOOM : DEFAULT_ZOOM,
        });
        leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap contributors" }).addTo(mapRef.current);
        mapRef.current.on("click", (event) => {
          handleMapSelection(event.latlng.lat, event.latlng.lng);
        });
        if (hasLocation) syncMarker(mapLat, mapLng);
        setTimeout(() => {
          mapRef.current?.invalidateSize();
        }, 120);
      } catch (error) {
        if (isMounted) setMapError(TEXT.loadMapFailed);
      }
    };
    bootMap();
    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerRef.current = null;
    };
  }, [handleMapSelection, isEdit, mapLat, mapLng, syncMarker]);

  useEffect(() => {
    if (hasMapLocation({ map_lat: mapLat, map_lng: mapLng })) syncMarker(mapLat, mapLng);
    else clearMarker();
  }, [clearMarker, mapLat, mapLng, syncMarker]);

  return (
    <Modal show={isEdit} onHide={() => setIsEdit(false)} centered size="xl" fullscreen="md-down">
      <Modal.Header closeButton>
        <Modal.Title>{TEXT.personalInfo}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate onSubmit={handleSubmit(onSubmit)}>
          <div className="row g-4 align-items-start">
            <div className="col-xl-4">
              <div className="border rounded-4 p-4 bg-light-subtle h-100">
                <div className="d-flex flex-column align-items-center text-center">
                  {currentAvatarSrc && cropNaturalSize.width ? (
                    <CropPreview imageUrl={currentAvatarSrc} naturalSize={cropNaturalSize} zoom={selectedAvatarUrl ? cropZoom : 1} position={selectedAvatarUrl ? cropPosition : { x: 0, y: 0 }} size={160} />
                  ) : currentAvatarSrc ? (
                    <img src={currentAvatarSrc} alt="avatar" width="160" height="160" style={{ borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.9)", boxShadow: "0 18px 34px rgba(15, 23, 42, 0.18)" }} />
                  ) : (
                    <FaUser className="rounded-pill text-bg-secondary p-2" style={{ fontSize: "160px" }} />
                  )}
                  <div className="small text-secondary mt-3">{TEXT.avatarChooseHint}</div>
                </div>
                <Form.Group className="mt-4">
                  <Form.Label className="ts-smd fw-semibold">{TEXT.uploadImage}</Form.Label>
                  <Form.Control ref={fileInputRef} id="avatar-upload" type="file" size="sm" accept="image/png,image/jpeg,image/webp" onChange={handleDisplayImg} />
                  <Button variant="outline-danger" size="sm" className="mt-2" onClick={handleDeleteImg}>
                    {TEXT.deleteImage}
                  </Button>
                </Form.Group>
              </div>
            </div>
            <div className="col-xl-8">
              {selectedAvatarUrl && cropNaturalSize.width > 0 && (
                <div className="border rounded-4 p-4 bg-light-subtle mb-4">
                  <div className="d-flex flex-wrap justify-content-between gap-3 mb-3">
                    <div>
                      <div className="fw-bold">{TEXT.avatarEditor}</div>
                      <div className="text-secondary small">{TEXT.avatarEditorSub}</div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <BsZoomIn className="text-main" />
                      <span className="small text-secondary">{TEXT.avatarZoom}</span>
                    </div>
                  </div>
                  <div className="row g-4 align-items-center">
                    <div className="col-lg-8">
                      <div role="presentation" onMouseDown={handleCropMouseDown} style={{ position: "relative", width: AVATAR_VIEWPORT_SIZE, height: AVATAR_VIEWPORT_SIZE, maxWidth: "100%", margin: "0 auto", overflow: "hidden", borderRadius: "28px", border: "1px solid #d6e2ec", background: "linear-gradient(135deg, rgba(15,127,147,0.14), rgba(21,57,91,0.12))", cursor: "grab" }}>
                        <img src={selectedAvatarUrl} alt="avatar_editor" draggable={false} style={{ position: "absolute", top: "50%", left: "50%", width: cropNaturalSize.width, height: cropNaturalSize.height, transform: `translate(calc(-50% + ${cropPosition.x}px), calc(-50% + ${cropPosition.y}px)) scale(${cropScale})`, transformOrigin: "center center", userSelect: "none", pointerEvents: "none" }} />
                        <div style={{ position: "absolute", inset: 18, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.95)", boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.35)", pointerEvents: "none" }} />
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="border rounded-4 bg-white p-3">
                        <div className="small text-secondary mb-3">{TEXT.avatarPreview}</div>
                        <div className="d-flex justify-content-center mb-4">
                          <CropPreview imageUrl={selectedAvatarUrl} naturalSize={cropNaturalSize} zoom={cropZoom} position={cropPosition} size={120} />
                        </div>
                        <Form.Range min={1} max={2.8} step={0.01} value={cropZoom} onChange={handleZoomChange} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <Form.Control type="hidden" {...register("address")} />
              <div className="row row-cols-md-2 row-cols-sm-1">
                <Form.Group className="mt-2">
                  <Form.Label className="fw-600">{TEXT.fullName}</Form.Label>
                  <RequiredMark />
                  <div className="d-flex">
                    <Form.Control size="sm" type="text" className="me-3" placeholder={TEXT.lastName} defaultValue={personal.lastname} {...register("lastname")} isInvalid={errors.lastname} />
                    <Form.Control size="sm" type="text" placeholder={TEXT.firstName} defaultValue={personal.firstname} {...register("firstname")} isInvalid={errors.firstname} />
                  </div>
                  <div className="text-danger mt-1" style={{ fontSize: "0.875em" }}>{errors.lastname || errors.firstname ? TEXT.fullNameRequired : null}</div>
                </Form.Group>
                <Form.Group className="mt-2">
                  <Form.Label className="fw-600">{TEXT.gender}</Form.Label>
                  <RequiredMark /> <br />
                  <Form.Check type="radio" label={TEXT.male} inline value={0} defaultChecked={personal.gender === 0} {...register("gender")} />
                  <Form.Check type="radio" label={TEXT.female} inline value={1} defaultChecked={personal.gender === 1} {...register("gender")} />
                  <Form.Control isInvalid={errors.gender} className="d-none" />
                  <Form.Control.Feedback type="invalid">{TEXT.emptyRequired}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mt-2">
                  <Form.Label className="fw-600">{TEXT.dob}</Form.Label>
                  <RequiredMark />
                  <Form.Control size="sm" type="date" {...register("dob")} defaultValue={personal.dob} isInvalid={errors.dob} />
                  <Form.Control.Feedback type="invalid">{errors.dob?.message}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mt-2">
                  <Form.Label className="fw-600">{TEXT.phone}</Form.Label>
                  <RequiredMark />
                  <Form.Control size="sm" type="text" {...register("phone")} defaultValue={personal.phone} isInvalid={errors.phone} />
                  <Form.Control.Feedback type="invalid">{errors.phone?.message}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mt-2">
                  <Form.Label className="fw-600">{TEXT.email}</Form.Label>
                  <RequiredMark />
                  <Form.Control size="sm" type="text" {...register("email")} defaultValue={personal.email} isInvalid={errors.email} />
                  <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mt-2">
                  <Form.Label className="fw-600">{TEXT.displayAddress}</Form.Label>
                  <RequiredMark />
                  <Form.Control size="sm" type="text" value={selectedAddress} readOnly placeholder={TEXT.displayAddressPlaceholder} isInvalid={Boolean(errors.address)} />
                  <Form.Control.Feedback type="invalid">{errors.address?.message}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mt-2">
                  <Form.Label className="fw-600">{TEXT.link}</Form.Label>
                  <Form.Control size="sm" type="text" {...register("link")} defaultValue={personal.link} isInvalid={errors.link} />
                  <Form.Control.Feedback type="invalid">{errors.link?.message}</Form.Control.Feedback>
                </Form.Group>
              </div>

              <div className="border rounded-4 p-3 mt-3 bg-light-subtle">
                <div className="d-flex flex-wrap justify-content-between gap-3 align-items-start mb-3">
                  <div>
                    <div className="fw-bold">{TEXT.homeMapTitle}</div>
                    <div className="text-secondary small">{TEXT.homeMapSub}</div>
                  </div>
                  {hasMapLocation({ map_lat: mapLat, map_lng: mapLng }) && (
                    <a href={buildMapExternalUrl(mapLat, mapLng)} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary">
                      <BsArrowUpRight className="me-1" />
                      {TEXT.openLargeMap}
                    </a>
                  )}
                </div>
                <div className="d-flex flex-wrap gap-2 mb-2">
                  <div className="input-group flex-fill" style={{ minWidth: "280px" }}>
                    <span className="input-group-text"><BsSearch /></span>
                    <Form.Control value={mapSearchQuery} onChange={(event) => setMapSearchQuery(event.target.value)} placeholder={TEXT.searchPlaceholder} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); handleSearchMap(); } }} />
                  </div>
                  <Button variant="outline-primary" type="button" onClick={handleSearchMap}>{isMapSearching ? <BsArrowClockwise className="spin" /> : <BsSearch />} {isMapSearching ? TEXT.searching : TEXT.search}</Button>
                  <Button variant="outline-danger" type="button" onClick={handleClearMapLocation}><BsTrashFill className="me-1" /> {TEXT.clearLocation}</Button>
                </div>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <div className="input-group flex-fill" style={{ minWidth: "280px" }}>
                    <span className="input-group-text"><BsPinMapFill /></span>
                    <Form.Control value={sharedMapUrl} onChange={(event) => setSharedMapUrl(event.target.value)} placeholder={TEXT.sharedMapPlaceholder} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); handleResolveSharedMapUrl(); } }} />
                  </div>
                  <Button variant="outline-primary" type="button" onClick={handleResolveSharedMapUrl} disabled={isResolvingSharedMapUrl}><BsPinMapFill className="me-1" />{isResolvingSharedMapUrl ? TEXT.resolvingLink : TEXT.useGoogleMapsLink}</Button>
                  <Button type="button" onClick={handleUseCurrentLocation} disabled={isLocatingCurrentPosition}><BsFillGeoAltFill className="me-1" />{isLocatingCurrentPosition ? TEXT.locatingGps : TEXT.useCurrentLocation}</Button>
                </div>
                {mapSearchResults.length > 0 && (
                  <div className="border rounded-4 bg-white p-2 mb-3">
                    {mapSearchResults.map((result) => (
                      <button key={`${result.place_id}_${result.lat}_${result.lon}`} type="button" className="btn btn-light w-100 text-start d-flex align-items-center gap-2 mb-2" onClick={() => handleSelectMapResult(result)}>
                        <BsFillGeoAltFill />
                        <span>{result.display_name}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div ref={mapNodeRef} style={{ height: "280px", borderRadius: "22px", overflow: "hidden", border: "1px solid #d6e2ec", background: "#eef4fa" }} />
                <div className="row g-3 mt-1">
                  <div className="col-md-8">
                    <div className="border rounded-4 bg-white h-100 p-3">
                      <div className="text-secondary text-uppercase small mb-2">{TEXT.displayAddressCard}</div>
                      <div className="fw-semibold">{selectedAddress || (isResolvingAddress ? TEXT.loadingAddress : TEXT.noLocationSelected)}</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="border rounded-4 bg-white h-100 p-3">
                      <div className="text-secondary text-uppercase small mb-2">{TEXT.coordinates}</div>
                      <div className="fw-semibold">{formatCoordinates(mapLat, mapLng)}</div>
                    </div>
                  </div>
                </div>
                {mapError && <div className="text-danger small mt-3">{mapError}</div>}
              </div>

              <Form.Group className="mt-3">
                <Form.Label className="fw-600">{TEXT.objective}</Form.Label>
                <Form.Control as="textarea" rows={5} size="sm" defaultValue={personal.objective} {...register("objective")} />
              </Form.Group>
              <Stack direction="horizontal" gap={3} className="mt-3">
                <Button variant="outline-primary" size="sm" type="submit" className="ms-auto">{TEXT.save}</Button>
                <Button variant="danger" size="sm" type="reset" className="me-3" onClick={() => setIsEdit(false)}>{TEXT.cancel}</Button>
              </Stack>
            </div>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
