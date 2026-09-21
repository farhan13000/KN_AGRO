import { BACKEND_ROLES, normalizeRoleName } from "../../../shared/constants";

/**
 * Roles that work from the office and so have no vehicle odometer to
 * photograph when they mark attendance. Mirrors the backend's own
 * OFFICE_BASED_ROLES (attendance.constants.js), which is what actually
 * enforces it — this only decides whether to ASK for the two meter
 * fields, so the two lists must say the same thing.
 *
 * The selfie and the location are asked of everyone, office or field.
 */
const OFFICE_BASED_ROLES = [BACKEND_ROLES.OA];

export const requiresMeterReading = (role) => !OFFICE_BASED_ROLES.includes(normalizeRoleName(role));
