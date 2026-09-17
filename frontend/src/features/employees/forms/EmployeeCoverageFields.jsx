import { useEffect, useMemo, useState } from "react";
import { MapPin, Search, X } from "lucide-react";
import SearchableMultiSelect from "../../../shared/forms/SearchableMultiSelect";
import { getApiErrorMessage } from "../../../core/api";
import { geoApi, useIndiaDistricts, useIndiaStates } from "../../geo";

const EMPTY = { states: [], districts: [], posts: [] };
const districtKey = (entry) => `${entry.state}||${entry.district}`;

const Chip = ({ children, onRemove, title }) => (
  <span className="inline-flex items-center gap-1 rounded-lg bg-mint px-2 py-1 text-xs font-semibold text-forest" title={title}>
    {children}
    <button aria-label={`Remove ${title}`} className="rounded-full p-0.5 hover:bg-forest/15" onClick={onRemove} type="button">
      <X className="h-3 w-3" />
    </button>
  </span>
);

/**
 * The places an employee covers, filled in in the order they narrow:
 * states first, then the districts inside those states, then — if wanted
 * — post offices inside those districts.
 *
 * States and districts come from the India list that ships with the app
 * (the same one the Locations map is drawn from). Post offices are
 * searched live from India Post, so the name and PIN stored are real.
 */
export default function EmployeeCoverageFields({ errors = {}, onChange, value }) {
  const coverage = value || EMPTY;
  const statesState = useIndiaStates();
  const districtsState = useIndiaDistricts(coverage.states);

  const [postQuery, setPostQuery] = useState("");
  const [postDistrict, setPostDistrict] = useState("");
  const [postResults, setPostResults] = useState([]);
  const [postError, setPostError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const emit = (next) => onChange({ target: { name: "coverage", value: next } });

  const stateOptions = useMemo(
    () => statesState.states.map((entry) => ({ value: entry.state, label: `${entry.state} (${entry.districtCount} districts)` })),
    [statesState.states],
  );
  const districtOptions = useMemo(
    () => districtsState.districts.map((entry) => ({ value: districtKey(entry), label: `${entry.district} · ${entry.state}` })),
    [districtsState.districts],
  );
  const selectedDistrictKeys = coverage.districts.map(districtKey);

  const setStates = (nextStates) => {
    // Dropping a state drops whatever was picked inside it.
    const districts = coverage.districts.filter((entry) => nextStates.includes(entry.state));
    const kept = new Set(districts.map(districtKey));
    emit({
      states: nextStates,
      districts,
      posts: coverage.posts.filter((post) => kept.has(districtKey(post))),
    });
  };

  const setDistricts = (keys) => {
    const districts = keys.map((key) => {
      const [state, district] = key.split("||");
      return { state, district };
    });
    const kept = new Set(keys);
    emit({ ...coverage, districts, posts: coverage.posts.filter((post) => kept.has(districtKey(post))) });
  };

  const addPost = (office) => {
    const entry = { state: office.state, district: office.district, name: office.name, pincode: office.pincode || "" };
    if (!selectedDistrictKeys.includes(districtKey(entry))) {
      setPostError(`${office.district}, ${office.state} is not in the districts picked above.`);
      return;
    }
    if (coverage.posts.some((post) => post.name === entry.name && districtKey(post) === districtKey(entry))) return;
    setPostError("");
    emit({ ...coverage, posts: [...coverage.posts, entry] });
  };

  // The search runs once typing settles, so every keystroke is not a request.
  useEffect(() => {
    const query = postQuery.trim();
    if (query.length < 3) {
      setPostResults([]);
      setPostError("");
      return undefined;
    }
    let cancelled = false;
    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const [state, district] = postDistrict ? postDistrict.split("||") : [undefined, undefined];
        const data = await geoApi.searchPostOffices({ q: query, state, district });
        if (!cancelled) {
          setPostResults(data.postOffices || []);
          setPostError("");
        }
      } catch (error) {
        if (!cancelled) {
          setPostResults([]);
          setPostError(getApiErrorMessage(error));
        }
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [postQuery, postDistrict]);

  return (
    <section data-employee-coverage>
      <h2 className="text-lg font-black text-ink">
        Locations Covered <span className="text-red-700">*</span>
      </h2>
      <p className="mt-1 text-sm text-muted">Pehle state, phir us state ke districts, phir chaho to post offices.</p>

      <div className="mt-4 grid gap-5">
        <div>
          <SearchableMultiSelect
            id="coverage-states"
            label="States"
            onChange={(event) => setStates(event.target.value)}
            options={stateOptions}
            placeholder={statesState.isLoading ? "Loading states…" : "Search a state…"}
            required
            value={coverage.states}
          />
          {errors.coverageStates ? <p className="form-error mt-1">{errors.coverageStates}</p> : null}
        </div>

        <div>
          <SearchableMultiSelect
            disabled={!coverage.states.length}
            id="coverage-districts"
            label="Districts"
            onChange={(event) => setDistricts(event.target.value)}
            options={districtOptions}
            placeholder={
              !coverage.states.length
                ? "Pick a state first"
                : districtsState.isLoading
                  ? "Loading districts…"
                  : "Search a district…"
            }
            required
            value={selectedDistrictKeys}
          />
          {errors.coverageDistricts ? <p className="form-error mt-1">{errors.coverageDistricts}</p> : null}
        </div>

        <div>
          <span className="form-label">Post offices (optional)</span>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,240px)_1fr]">
            <select
              aria-label="District for the post office search"
              className="form-field"
              disabled={!coverage.districts.length}
              id="coverage-post-district"
              onChange={(event) => setPostDistrict(event.target.value)}
              value={postDistrict}
            >
              <option value="">All picked districts</option>
              {coverage.districts.map((entry) => (
                <option key={districtKey(entry)} value={districtKey(entry)}>
                  {entry.district} · {entry.state}
                </option>
              ))}
            </select>
            <span className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                className="form-field pl-9"
                disabled={!coverage.districts.length}
                id="coverage-post-search"
                onChange={(event) => setPostQuery(event.target.value)}
                placeholder={coverage.districts.length ? "Post office name or 6-digit PIN" : "Pick a district first"}
                value={postQuery}
              />
            </span>
          </div>

          {isSearching ? <p className="mt-2 text-xs text-muted">Searching India Post…</p> : null}
          {postError ? <p className="form-error mt-2">{postError}</p> : null}
          {postResults.length ? (
            <ul className="mt-2 max-h-56 overflow-auto rounded-lg border border-forest/15 bg-white" data-post-results>
              {postResults.map((office) => (
                <li key={`${office.name}-${office.pincode}`}>
                  <button
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-mint"
                    onClick={() => addPost(office)}
                    type="button"
                  >
                    <span>
                      <span className="font-semibold text-ink">{office.name}</span>
                      <span className="block text-xs text-muted">
                        {[office.branchType, office.district, office.state].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    <span className="text-xs font-bold text-forest">{office.pincode}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {coverage.posts.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {coverage.posts.map((post) => (
                <Chip
                  key={`${districtKey(post)}-${post.name}`}
                  onRemove={() =>
                    emit({
                      ...coverage,
                      posts: coverage.posts.filter((item) => !(item.name === post.name && districtKey(item) === districtKey(post))),
                    })
                  }
                  title={`${post.name}, ${post.district}, ${post.state}`}
                >
                  <MapPin className="h-3 w-3" />
                  {post.name}
                  {post.pincode ? ` · ${post.pincode}` : ""}
                </Chip>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
