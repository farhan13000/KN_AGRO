import { formatEmploymentType } from "../utils";

export default function EmploymentTypeText({ employmentType }) {
  return <span>{formatEmploymentType(employmentType)}</span>;
}
