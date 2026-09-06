/**
 * `photo` is a { url, publicId } reference to an asset already uploaded
 * through POST /media/uploads/EMPLOYEE_PHOTO — never a File. On the two
 * update payloads it is sent as `null` rather than omitted when there is
 * no photo, because null is what tells the backend to REMOVE an existing
 * one; omitting it would mean "leave it alone" and make the Remove
 * button do nothing.
 */
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
  photo: values.photo || undefined,
  address: values.address,
  emergencyContact: values.emergencyContact,
});

export const pickUpdateEmployeePayload = (values) => ({
  phone: values.phone,
  department: values.department,
  designation: values.designation,
  dateOfJoining: values.dateOfJoining,
  employmentType: values.employmentType || undefined,
  photo: values.photo || null,
  address: values.address,
  emergencyContact: values.emergencyContact,
});

export const pickSelfUpdatePayload = (values) => ({
  phone: values.phone,
  photo: values.photo || null,
  address: values.address,
  emergencyContact: values.emergencyContact,
});

export const pickApprovalPayload = (values) => ({
  department: values.department || undefined,
  designation: values.designation || undefined,
  manager: values.manager || undefined,
  dateOfJoining: values.dateOfJoining || undefined,
});
