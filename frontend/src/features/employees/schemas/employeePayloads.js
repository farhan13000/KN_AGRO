export const pickCreateEmployeePayload = (values) => ({
  name: values.name,
  email: values.email,
  temporaryPassword: values.temporaryPassword,
  phone: values.phone,
  department: values.department,
  designation: values.designation,
  manager: values.manager || undefined,
  dateOfJoining: values.dateOfJoining,
  employmentType: values.employmentType || undefined,
  address: values.address,
  emergencyContact: values.emergencyContact,
});

export const pickUpdateEmployeePayload = (values) => ({
  phone: values.phone,
  department: values.department,
  designation: values.designation,
  dateOfJoining: values.dateOfJoining,
  employmentType: values.employmentType || undefined,
  address: values.address,
  emergencyContact: values.emergencyContact,
});

export const pickSelfUpdatePayload = (values) => ({
  phone: values.phone,
  address: values.address,
  emergencyContact: values.emergencyContact,
});

export const pickRegistrationPayload = (values) => ({
  name: values.name,
  email: values.email,
  password: values.password,
  phone: values.phone,
  requestedDepartment: values.requestedDepartment || undefined,
  requestedDesignation: values.requestedDesignation || undefined,
});

export const pickApprovalPayload = (values) => ({
  department: values.department || undefined,
  designation: values.designation || undefined,
  manager: values.manager || undefined,
  dateOfJoining: values.dateOfJoining || undefined,
});
