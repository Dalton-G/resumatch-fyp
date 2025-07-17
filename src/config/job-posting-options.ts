export const workTypeOptions = [
  { value: "ONSITE", label: "Onsite" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
];
export const baseJobStatusOptions = [
  { value: "URGENTLY_HIRING", label: "Urgently Hiring" },
  { value: "HIRING", label: "Hiring" },
];
export const companyUpdateJobStatusOptions = [
  ...baseJobStatusOptions,
  { value: "CLOSED", label: "Closed" },
];
export const adminUpdateJobStatusOptions = [
  ...companyUpdateJobStatusOptions,
  { value: "CLOSED_BY_ADMIN", label: "Closed by Admin" },
];
