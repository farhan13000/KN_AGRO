// Imported from the specific hook files rather than each feature's barrel:
// the districts barrel pulls in components that import back from
// `features/employees`, and going through it would make the module graph
// circular (employees -> districts -> employees).
import { useDistrictList } from "../../districts/hooks/useDistrictQueries";
import { useRegionList } from "../../regions/hooks/useRegionQueries";

const PAGE_LIMIT = 100; // both list endpoints cap `limit` at 100

/**
 * Region/district reference data for employee screens.
 *
 * The employee serializer returns `region`/`district` as raw ObjectIds
 * (populate is left to each caller — see its own comment), so any screen
 * showing an employee's location has to resolve those ids itself. Also
 * supplies the option lists the create/edit pickers need, with
 * `districtsForRegion` honouring District's `region` ref so the district
 * picker only ever offers districts inside the chosen region.
 */
export const useEmployeeLocations = ({ enabled = true } = {}) => {
  const regionsState = useRegionList({ page: 1, limit: PAGE_LIMIT, status: "ACTIVE" }, { enabled });
  const districtsState = useDistrictList({ page: 1, limit: PAGE_LIMIT, status: "ACTIVE" }, { enabled });

  const regions = regionsState.data?.regions || [];
  const districts = districtsState.data?.districts || [];

  const regionName = (regionId) => {
    if (!regionId) return "";
    const id = typeof regionId === "object" ? regionId?._id : regionId;
    return regions.find((region) => String(region._id) === String(id))?.name || "";
  };

  const districtName = (districtId) => {
    if (!districtId) return "";
    const id = typeof districtId === "object" ? districtId?._id : districtId;
    return districts.find((district) => String(district._id) === String(id))?.name || "";
  };

  const districtsForRegion = (regionId) => {
    if (!regionId) return districts;
    return districts.filter((district) => String(district.region?._id || district.region) === String(regionId));
  };

  return {
    districts,
    districtsForRegion,
    districtName,
    isError: regionsState.isError || districtsState.isError,
    isLoading: regionsState.isLoading || districtsState.isLoading,
    regionName,
    regions,
  };
};
