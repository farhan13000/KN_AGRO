import { useCallback, useEffect, useMemo, useState } from "react";
import { GeoJSON, MapContainer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { ChevronRight, MapPin, Users } from "lucide-react";
import "leaflet/dist/leaflet.css";
import Card from "../../shared/components/Card";
import ErrorState from "../../shared/components/ErrorState";
import PageLoader from "../../shared/components/PageLoader";
import { ROLE_LABELS } from "../../shared/constants";
import { getApiErrorMessage } from "../../core/api";
import { coverageApi } from "./coverageApi";

const BOUNDARIES_URL = "/geo/india-districts.geojson";

// Names differ slightly between lists (Delhi / NCT of Delhi), so places
// are matched on a stripped-down form of the name.
const normalize = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z]/g, "");

// Places with someone on them are filled; the rest stay plain, so the
// map reads as "here is India, and here is where we are".
const COVERED_FILL = "#CFE3D6";
const EMPTY_FILL = "#F1F4F1";

/** A red map pin with the number of people on it. */
const pinIcon = (count) =>
  L.divIcon({
    className: "",
    html: `<span style="position:relative;display:block;width:26px;height:36px">
      <svg viewBox="0 0 24 34" width="26" height="36" aria-hidden="true">
        <path d="M12 0C5.7 0 .6 5.1.6 11.4.6 20 12 34 12 34s11.4-14 11.4-22.6C23.4 5.1 18.3 0 12 0z" fill="#D92D20" stroke="#7A1710" stroke-width="1"/>
        <circle cx="12" cy="11.5" r="8" fill="#ffffff"/>
      </svg>
      <span style="position:absolute;top:3px;left:0;width:26px;text-align:center;font:700 11px/16px system-ui,sans-serif;color:#7A1710">${count}</span>
    </span>`,
    iconSize: [26, 36],
    iconAnchor: [13, 34],
  });

/** Middle of a shape, for placing its pin. */
const centreOf = (coordinates) => {
  let minLat = 90;
  let maxLat = -90;
  let minLng = 180;
  let maxLng = -180;
  const walk = (coords) => {
    if (typeof coords[0] === "number") {
      minLng = Math.min(minLng, coords[0]);
      maxLng = Math.max(maxLng, coords[0]);
      minLat = Math.min(minLat, coords[1]);
      maxLat = Math.max(maxLat, coords[1]);
      return;
    }
    coords.forEach(walk);
  };
  walk(coordinates);
  return { centre: [(minLat + maxLat) / 2, (minLng + maxLng) / 2], bounds: [[minLat, minLng], [maxLat, maxLng]] };
};

function FitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [16, 16] });
  }, [bounds, map]);
  return null;
}

/**
 * Where the team works, on a map of India.
 *
 * Only India is drawn — no world tiles behind it — and a red pin sits on
 * every place someone covers, with the number of people on the pin. The
 * India view pins states; open a state and it pins that state's
 * districts. Clicking a pin (or its area) opens it; the panel lists the
 * people, and clicking a person narrows the map to their districts.
 */
export default function LocationsMap() {
  const [boundaries, setBoundaries] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [state, setState] = useState(null);
  const [stateData, setStateData] = useState(null);
  const [district, setDistrict] = useState(null);
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [geo, counts] = await Promise.all([
          fetch(BOUNDARIES_URL).then((response) => {
            if (!response.ok) throw new Error("Map boundaries could not be loaded");
            return response.json();
          }),
          coverageApi.summary(),
        ]);
        if (!cancelled) {
          setBoundaries(geo);
          setSummary(counts);
        }
      } catch (loadError) {
        if (!cancelled) setError(getApiErrorMessage(loadError));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openState = useCallback(async (stateName) => {
    setState(stateName);
    setDistrict(null);
    setEmployee(null);
    setStateData(null);
    try {
      setStateData(await coverageApi.inState(stateName));
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    }
  }, []);

  const openDistrict = useCallback(
    async (stateName, districtName) => {
      setEmployee(null);
      setDistrict(districtName);
      try {
        const data = await coverageApi.inState(stateName, districtName);
        setStateData((current) => ({ ...current, employees: data.employees, districts: current?.districts ?? [] }));
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      }
    },
    [],
  );

  const stateCounts = useMemo(() => {
    const map = new Map();
    for (const row of summary?.states ?? []) map.set(normalize(row.state), row);
    return map;
  }, [summary]);

  const districtCounts = useMemo(() => {
    const map = new Map();
    for (const row of stateData?.districts ?? []) map.set(normalize(row.district), row.employees);
    return map;
  }, [stateData]);

  // Only the picked person's districts stay filled while they are open.
  const employeeDistricts = useMemo(() => new Set((employee?.districts ?? []).map(normalize)), [employee]);

  const features = useMemo(() => {
    if (!boundaries) return null;
    if (!state) return boundaries;
    return {
      ...boundaries,
      features: boundaries.features.filter((feature) => normalize(feature.properties.st_nm) === normalize(state)),
    };
  }, [boundaries, state]);

  // Where every state and district sits, worked out once from the shapes.
  const geometry = useMemo(() => {
    if (!boundaries) return { states: new Map(), districts: new Map(), india: null };
    const states = new Map();
    const districts = new Map();
    let india = null;
    const merge = (target, bounds) =>
      target
        ? [
            [Math.min(target[0][0], bounds[0][0]), Math.min(target[0][1], bounds[0][1])],
            [Math.max(target[1][0], bounds[1][0]), Math.max(target[1][1], bounds[1][1])],
          ]
        : bounds;

    for (const feature of boundaries.features) {
      const { centre, bounds } = centreOf(feature.geometry.coordinates);
      const stateKey = normalize(feature.properties.st_nm);
      districts.set(`${stateKey}|${normalize(feature.properties.district)}`, { centre, bounds, name: feature.properties.district, state: feature.properties.st_nm });
      const existing = states.get(stateKey);
      states.set(stateKey, { name: feature.properties.st_nm, bounds: merge(existing?.bounds, bounds) });
      india = merge(india, bounds);
    }
    for (const entry of states.values()) {
      entry.centre = [(entry.bounds[0][0] + entry.bounds[1][0]) / 2, (entry.bounds[0][1] + entry.bounds[1][1]) / 2];
    }
    return { states, districts, india };
  }, [boundaries]);

  const bounds = useMemo(() => {
    if (!geometry.india) return null;
    if (!state) return geometry.india;
    return geometry.states.get(normalize(state))?.bounds ?? geometry.india;
  }, [geometry, state]);

  // The red pins: one per covered state, or per covered district inside a state.
  const pins = useMemo(() => {
    if (!geometry.india) return [];
    if (!state) {
      return (summary?.states ?? [])
        .filter((row) => row.employees > 0)
        .map((row) => {
          const place = geometry.states.get(normalize(row.state));
          return place ? { key: row.state, position: place.centre, count: row.employees, label: row.state, onOpen: () => openState(row.state) } : null;
        })
        .filter(Boolean);
    }
    return (stateData?.districts ?? [])
      .filter((row) => row.employees > 0)
      .filter((row) => !employee || employeeDistricts.has(normalize(row.district)))
      .map((row) => {
        const place = geometry.districts.get(`${normalize(state)}|${normalize(row.district)}`);
        return place
          ? { key: `${state}-${row.district}`, position: place.centre, count: row.employees, label: row.district, onOpen: () => openDistrict(state, row.district) }
          : null;
      })
      .filter(Boolean);
  }, [employee, employeeDistricts, geometry, openDistrict, openState, state, stateData, summary]);

  const styleFor = useCallback(
    (feature) => {
      const inState = Boolean(state);
      const key = normalize(inState ? feature.properties.district : feature.properties.st_nm);
      const count = inState ? districtCounts.get(key) ?? 0 : stateCounts.get(key)?.employees ?? 0;
      const dimmed = inState && employee && !employeeDistricts.has(key);
      const active = inState && district && normalize(district) === key;
      return {
        fillColor: count && !dimmed ? COVERED_FILL : EMPTY_FILL,
        fillOpacity: 1,
        color: active ? "#D92D20" : "#9BB3A2",
        weight: active ? 2.5 : inState ? 0.8 : 0.5,
      };
    },
    [district, districtCounts, employee, employeeDistricts, state, stateCounts],
  );

  const onEachFeature = useCallback(
    (feature, layer) => {
      const inState = Boolean(state);
      const name = inState ? feature.properties.district : feature.properties.st_nm;
      const count = inState ? districtCounts.get(normalize(name)) ?? 0 : stateCounts.get(normalize(name))?.employees ?? 0;
      layer.bindTooltip(`${name} — ${count} ${count === 1 ? "employee" : "employees"}`, { sticky: true });
      layer.on("click", () => (inState ? openDistrict(state, name) : openState(feature.properties.st_nm)));
    },
    [districtCounts, openDistrict, openState, state, stateCounts],
  );

  if (isLoading) return <PageLoader message="Loading the map…" />;
  if (error && !boundaries) return <ErrorState message={error} title="Unable to load the map" />;

  const employees = stateData?.employees ?? [];
  const shownEmployees = employee ? employees.filter((row) => row._id === employee._id) : employees;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center gap-1 border-b border-forest/10 px-4 py-3 text-sm" data-locations-breadcrumb>
          <button
            className={`font-bold ${state ? "text-forest hover:underline" : "text-ink"}`}
            onClick={() => {
              setState(null);
              setStateData(null);
              setDistrict(null);
              setEmployee(null);
            }}
            type="button"
          >
            India
          </button>
          {state ? (
            <>
              <ChevronRight className="h-4 w-4 text-muted" />
              <button
                className={`font-bold ${district || employee ? "text-forest hover:underline" : "text-ink"}`}
                onClick={() => openState(state)}
                type="button"
              >
                {state}
              </button>
            </>
          ) : null}
          {district ? (
            <>
              <ChevronRight className="h-4 w-4 text-muted" />
              <span className="font-bold text-ink">{district}</span>
            </>
          ) : null}
          {employee ? (
            <>
              <ChevronRight className="h-4 w-4 text-muted" />
              <span className="font-bold text-ink">{employee.name}</span>
            </>
          ) : null}
        </div>
        <div className="h-[520px] w-full bg-white">
          <MapContainer
            attributionControl={false}
            // No world tiles behind it: the India shapes are the map.
            center={[22.6, 80.9]}
            maxBounds={geometry.india ?? undefined}
            maxBoundsViscosity={1}
            minZoom={3}
            scrollWheelZoom
            style={{ height: "100%", width: "100%", background: "#FFFFFF" }}
            zoom={4}
          >
            {features ? (
              <GeoJSON
                data={features}
                key={`${state || "india"}-${district || ""}-${employee?._id || ""}`}
                onEachFeature={onEachFeature}
                style={styleFor}
              />
            ) : null}
            {pins.map((pin) => (
              <Marker
                eventHandlers={{ click: pin.onOpen }}
                icon={pinIcon(pin.count)}
                key={pin.key}
                position={pin.position}
                title={`${pin.label} — ${pin.count} ${pin.count === 1 ? "employee" : "employees"}`}
              />
            ))}
            <FitBounds bounds={bounds} />
          </MapContainer>
        </div>
      </Card>

      <Card className="p-4" data-locations-panel>
        {!state ? (
          <>
            <h2 className="flex items-center gap-2 text-lg font-black text-ink">
              <MapPin className="h-5 w-5 text-red-600" />
              States covered
            </h2>
            <p className="mt-1 text-sm text-muted">Laal pin ya state par click karo — wahan ke employees dikh jayenge.</p>
            <ul className="mt-3 max-h-[430px] space-y-1 overflow-auto">
              {(summary?.states ?? []).map((row) => (
                <li key={row.state}>
                  <button
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-mint"
                    onClick={() => openState(row.state)}
                    type="button"
                  >
                    <span className="font-semibold text-ink">{row.state}</span>
                    <span className="text-xs text-muted">
                      {row.employees} {row.employees === 1 ? "employee" : "employees"} · {row.districts} districts
                    </span>
                  </button>
                </li>
              ))}
              {!(summary?.states ?? []).length ? (
                <li className="px-3 py-2 text-sm text-muted">Kisi employee ko abhi koi state assign nahi hai.</li>
              ) : null}
            </ul>
          </>
        ) : (
          <>
            <h2 className="flex items-center gap-2 text-lg font-black text-ink">
              <Users className="h-5 w-5 text-forest" />
              {district ? district : state}
            </h2>
            {!stateData ? (
              <p className="mt-3 text-sm text-muted">Loading…</p>
            ) : (
              <>
                {!district && !employee && stateData.districts.length ? (
                  <div className="mt-3">
                    <p className="text-xs font-black uppercase tracking-wide text-muted">Districts</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {stateData.districts.map((row) => (
                        <button
                          className="rounded-lg bg-mint px-2 py-1 text-xs font-semibold text-forest hover:bg-forest hover:text-white"
                          key={row.district}
                          onClick={() => openDistrict(state, row.district)}
                          type="button"
                        >
                          {row.district} · {row.employees}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <ul className="mt-4 max-h-[360px] space-y-1 overflow-auto" data-locations-employees>
                  {shownEmployees.map((row) => (
                    <li key={row._id}>
                      <button
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-mint ${employee?._id === row._id ? "bg-mint" : ""}`}
                        onClick={() => setEmployee(employee?._id === row._id ? null : row)}
                        type="button"
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-ink">{row.name}</span>
                          <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-black text-forest ring-1 ring-forest/15">
                            {ROLE_LABELS[row.role] || String(row.role || "").toUpperCase()}
                          </span>
                        </span>
                        <span className="mt-1 block text-xs text-muted">
                          {row.districts.length ? row.districts.join(", ") : "No district picked in this state"}
                        </span>
                        {employee?._id === row._id && row.posts.length ? (
                          <span className="mt-1 block text-xs text-muted">
                            Posts: {row.posts.map((post) => `${post.name}${post.pincode ? ` (${post.pincode})` : ""}`).join(", ")}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  ))}
                  {!shownEmployees.length ? (
                    <li className="px-3 py-2 text-sm text-muted">Yahan kisi employee ka coverage nahi hai.</li>
                  ) : null}
                </ul>
              </>
            )}
          </>
        )}
        {error ? <p className="mt-3 text-xs font-semibold text-red-700">{error}</p> : null}
      </Card>
    </div>
  );
}
