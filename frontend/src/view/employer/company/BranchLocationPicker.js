import { useCallback, useEffect, useRef, useState } from "react";
import { BsCursor, BsGeoAlt, BsLink45Deg, BsSearch, BsXCircle } from "react-icons/bs";
import { toast } from "react-toastify";
import employerApi from "../../../api/employer";

const LEAFLET_JS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const LEAFLET_CSS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const DEFAULT_CENTER = [16.047079, 108.20623];
const DEFAULT_ZOOM = 6;
const FOCUS_ZOOM = 16;

const hasValidPoint = (value) => {
  if (
    value?.map_lat === undefined ||
    value?.map_lat === null ||
    value?.map_lat === "" ||
    value?.map_lng === undefined ||
    value?.map_lng === null ||
    value?.map_lng === ""
  ) {
    return false;
  }

  const lat = Number(value?.map_lat);
  const lng = Number(value?.map_lng);
  return Number.isFinite(lat) && Number.isFinite(lng);
};

const formatPoint = (lat, lng) => `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`;

const ensureLeaflet = () =>
  new Promise((resolve, reject) => {
    if (window.L) {
      resolve(window.L);
      return;
    }

    const existingCss = document.querySelector(`link[href="${LEAFLET_CSS_URL}"]`);
    if (!existingCss) {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = LEAFLET_CSS_URL;
      document.head.appendChild(css);
    }

    const existingScript = document.querySelector(`script[src="${LEAFLET_JS_URL}"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.L), { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = LEAFLET_JS_URL;
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.body.appendChild(script);
  });

const extractCoordinatesFromUrl = (url) => {
  const decoded = decodeURIComponent(url || "").replace(/&amp;/g, "&");
  const signed = "([+-]?\\d+(?:\\.\\d+)?)";
  const patterns = [
    new RegExp(`!8m2!3d${signed}!4d${signed}`, "i"),
    new RegExp(`!4m2!3d${signed}!4d${signed}`, "i"),
    new RegExp(`!3d${signed}!4d${signed}`, "i"),
    new RegExp(`/maps/search/${signed}\\s*,\\s*${signed}`, "i"),
    new RegExp(`[?&](?:query|q|destination|center|ll|sll)=${signed}\\s*,\\s*${signed}`, "i"),
    new RegExp(`@${signed},${signed},`, "i"),
  ];

  for (const pattern of patterns) {
    const match = decoded.match(pattern);
    if (match) {
      const lat = Number(match[1]);
      const lng = Number(match[2]);
      if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
        return { lat, lng };
      }
    }
  }

  return null;
};

const reverseGeocode = async (lat, lng) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
    lat
  )}&lon=${encodeURIComponent(lng)}&accept-language=vi`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const payload = await response.json();
  return payload?.display_name || null;
};

const searchAddress = async (keyword) => {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=vn&accept-language=vi&q=${encodeURIComponent(
    keyword
  )}`;
  const response = await fetch(url);
  if (!response.ok) return [];
  return response.json();
};

export default function BranchLocationPicker({ value, onChange, disabled = false }) {
  const mapNodeRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [results, setResults] = useState([]);

  const updateValue = useCallback(
    (patch) => {
      onChange({ ...value, ...patch });
    },
    [onChange, value]
  );

  const setLocation = useCallback(
    async ({ lat, lng, address }) => {
      const nextAddress = address || (await reverseGeocode(lat, lng).catch(() => null)) || value.address || "";
      updateValue({
        address: nextAddress,
        map_lat: String(lat),
        map_lng: String(lng),
      });
    },
    [updateValue, value.address]
  );

  useEffect(() => {
    let cancelled = false;

    ensureLeaflet()
      .then((L) => {
        if (cancelled || !mapNodeRef.current || mapRef.current) return;

        const center = hasValidPoint(value)
          ? [Number(value.map_lat), Number(value.map_lng)]
          : DEFAULT_CENTER;
        const zoom = hasValidPoint(value) ? FOCUS_ZOOM : DEFAULT_ZOOM;
        const map = L.map(mapNodeRef.current, {
          scrollWheelZoom: true,
        }).setView(center, zoom);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap",
        }).addTo(map);

        map.on("click", (event) => {
          if (disabled) return;
          setLocation({ lat: event.latlng.lat, lng: event.latlng.lng });
        });

        mapRef.current = map;
        setIsReady(true);
      })
      .catch(() => toast.error("Không thể tải bản đồ. Vui lòng kiểm tra kết nối mạng."));

    return () => {
      cancelled = true;
    };
  }, [disabled, setLocation, value]);

  useEffect(() => {
    if (!isReady || !mapRef.current || !window.L) return;

    if (!hasValidPoint(value)) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    const lat = Number(value.map_lat);
    const lng = Number(value.map_lng);
    const point = [lat, lng];

    if (!markerRef.current) {
      markerRef.current = window.L.marker(point, { draggable: !disabled }).addTo(mapRef.current);
      markerRef.current.on("dragend", (event) => {
        if (disabled) return;
        const next = event.target.getLatLng();
        setLocation({ lat: next.lat, lng: next.lng });
      });
    } else {
      markerRef.current.setLatLng(point);
      if (disabled) markerRef.current.dragging.disable();
      else markerRef.current.dragging.enable();
    }

    mapRef.current.setView(point, FOCUS_ZOOM);
  }, [disabled, isReady, setLocation, value]);

  const handleSearch = async (event) => {
    event.preventDefault();
    if (!searchKeyword.trim()) return;

    setIsResolving(true);
    try {
      const list = await searchAddress(searchKeyword.trim());
      setResults(list);
      if (list.length === 0) toast.info("Không tìm thấy địa chỉ phù hợp.");
    } catch (error) {
      toast.error("Không thể tìm kiếm địa chỉ.");
    } finally {
      setIsResolving(false);
    }
  };

  const selectSearchResult = (result) => {
    setResults([]);
    setSearchKeyword(result.display_name || "");
    setLocation({
      lat: Number(result.lat),
      lng: Number(result.lon),
      address: result.display_name,
    });
  };

  const resolveMapLink = async () => {
    const rawUrl = mapLink.trim();
    if (!rawUrl) return;

    setIsResolving(true);
    try {
      const localPoint = extractCoordinatesFromUrl(rawUrl);
      if (localPoint) {
        await setLocation(localPoint);
        return;
      }

      const resolved = await employerApi.resolveSharedMapLink({ url: rawUrl });
      if (!Number.isFinite(Number(resolved?.lat)) || !Number.isFinite(Number(resolved?.lng))) {
        throw new Error("Cannot resolve map link");
      }
      await setLocation({ lat: resolved.lat, lng: resolved.lng });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể đọc tọa độ từ link Google Maps.");
    } finally {
      setIsResolving(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ lấy vị trí hiện tại.");
      return;
    }

    setIsResolving(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }).finally(() => setIsResolving(false));
      },
      () => {
        setIsResolving(false);
        toast.error("Không thể lấy vị trí hiện tại.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const clearLocation = () => {
    updateValue({ map_lat: "", map_lng: "" });
  };

  return (
    <div className="branch-map-picker">
      <div className="branch-map-picker__tools">
        <form className="branch-map-picker__search" onSubmit={handleSearch}>
          <BsSearch />
          <input
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            placeholder="Tìm địa chỉ trên bản đồ"
            disabled={disabled || isResolving}
          />
          <button type="submit" disabled={disabled || isResolving}>
            Tìm
          </button>
        </form>
        <div className="branch-map-picker__link">
          <BsLink45Deg />
          <input
            value={mapLink}
            onChange={(event) => setMapLink(event.target.value)}
            placeholder="Dán link Google Maps"
            disabled={disabled || isResolving}
          />
          <button type="button" onClick={resolveMapLink} disabled={disabled || isResolving}>
            Lấy tọa độ
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="branch-map-picker__results">
          {results.map((result) => (
            <button key={`${result.lat}_${result.lon}`} type="button" onClick={() => selectSearchResult(result)}>
              <BsGeoAlt />
              <span>{result.display_name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="branch-map-picker__map" ref={mapNodeRef}>
        {!isReady && <span>Đang tải bản đồ...</span>}
      </div>

      <div className="branch-map-picker__footer">
        <div>
          <strong>Tọa độ</strong>
          <span>{hasValidPoint(value) ? formatPoint(value.map_lat, value.map_lng) : "Chưa chọn vị trí"}</span>
        </div>
        <div className="branch-map-picker__actions">
          <button type="button" onClick={useCurrentLocation} disabled={disabled || isResolving}>
            <BsCursor />
            Vị trí hiện tại
          </button>
          <button type="button" onClick={clearLocation} disabled={disabled || isResolving || !hasValidPoint(value)}>
            <BsXCircle />
            Xóa marker
          </button>
        </div>
      </div>
    </div>
  );
}
