import SearchableSelect from "../../shared/forms/SearchableSelect";
import TextInput from "../../shared/forms/TextInput";
import { useIndiaDistricts, useIndiaStates } from "./useGeoQueries";

const EMPTY = { state: "", district: "", post: "" };

/**
 * "Search by location" — the same three-field filter (State, District,
 * optional Post office) everywhere a Super Admin/Office Admin list needs
 * to be narrowed to an area: Leads, Orders, Employees, and the
 * performance rosters derived from them. Each dropdown's own "All ..."
 * option is what "all" means here — clearing a field (or all three)
 * simply removes that narrowing, the same way every other filter in this
 * app works.
 *
 * Deliberately ONE combined `onChange(next)` rather than the native-
 * event-per-field contract most form fields here use: callers already
 * have their own query-param names for these three (Lead's
 * addressState/addressDistrict/addressPostOffice vs Order/Employee's
 * plain state/district/post), so translating a single `{state, district,
 * post}` object is simpler than reconciling three different name
 * conventions inside this component.
 */
export default function LocationFilterFields({ compact = false, onChange, showPost = true, value = EMPTY }) {
  const statesState = useIndiaStates();
  const districtsState = useIndiaDistricts(value.state ? [value.state] : []);

  const stateOptions = [
    { value: "", label: "All states" },
    ...statesState.states.map((entry) => ({ value: entry.state, label: entry.state })),
  ];
  const districtOptions = [
    { value: "", label: value.state ? "All districts" : "Pick a state first" },
    ...districtsState.districts.map((entry) => ({ value: entry.district, label: entry.district })),
  ];

  const setState = (nextState) => {
    // A district only ever belongs to one state, so switching (or
    // clearing) the state drops whatever district was picked under the
    // old one — same rule EmployeeCoverageFields' own state change uses.
    onChange({ ...value, state: nextState, district: "" });
  };

  return (
    <div className={`grid gap-3 ${compact ? "sm:grid-cols-3" : "md:grid-cols-3"}`}>
      <SearchableSelect
        id="location-filter-state"
        label="State"
        onChange={(event) => setState(event.target.value)}
        options={stateOptions}
        placeholder={statesState.isLoading ? "Loading states..." : "Search a state..."}
        value={value.state || ""}
      />
      <SearchableSelect
        disabled={!value.state}
        id="location-filter-district"
        label="District"
        onChange={(event) => onChange({ ...value, district: event.target.value })}
        options={districtOptions}
        placeholder={districtsState.isLoading ? "Loading districts..." : "Search a district..."}
        value={value.district || ""}
      />
      {showPost ? (
        <TextInput
          id="location-filter-post"
          label="Post Office"
          onChange={(event) => onChange({ ...value, post: event.target.value })}
          placeholder="Post office name"
          value={value.post || ""}
        />
      ) : null}
    </div>
  );
}

export { EMPTY as EMPTY_LOCATION_FILTER };
