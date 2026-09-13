import TextInput from "../../../../shared/forms/TextInput";

/**
 * The one address shape the whole customer flow uses — sign-up, profile
 * and the enquiry form all render this, so a buyer types their address
 * the same way everywhere and the sales team gets one set of fields to
 * filter on.
 *
 * District and State are required because they are what leads are
 * filtered by; village, post office and PIN are how a field officer
 * actually finds the place, which matters but cannot be insisted on.
 */
export const emptyAddress = {
  village: "",
  postOffice: "",
  pincode: "",
  district: "",
  state: "",
};

export const validateAddress = (address = {}) => {
  const errors = {};
  if (!String(address.district || "").trim()) errors.district = "District is required.";
  if (!String(address.state || "").trim()) errors.state = "State is required.";
  if (address.pincode && !/^\d{6}$/.test(String(address.pincode).trim())) {
    errors.pincode = "PIN code must be 6 digits.";
  }
  return errors;
};

export default function AddressFields({ errors = {}, idPrefix = "address", onChange, values = emptyAddress }) {
  const update = (field) => (event) => onChange({ ...values, [field]: event.target.value });

  return (
    <>
      <TextInput
        id={`${idPrefix}-village`}
        label="Village / Town"
        onChange={update("village")}
        value={values.village || ""}
      />
      <TextInput
        id={`${idPrefix}-postOffice`}
        label="Post Office"
        onChange={update("postOffice")}
        value={values.postOffice || ""}
      />
      <TextInput
        error={errors.pincode}
        id={`${idPrefix}-pincode`}
        inputMode="numeric"
        label="PIN Code"
        onChange={update("pincode")}
        placeholder="226001"
        value={values.pincode || ""}
      />
      <TextInput
        error={errors.district}
        id={`${idPrefix}-district`}
        label="District"
        onChange={update("district")}
        required
        value={values.district || ""}
      />
      <TextInput
        error={errors.state}
        id={`${idPrefix}-state`}
        label="State"
        onChange={update("state")}
        required
        value={values.state || ""}
      />
    </>
  );
}
