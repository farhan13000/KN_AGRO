import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Button from "../../../../shared/components/Button";
import Select from "../../../../shared/forms/Select";
import TextInput from "../../../../shared/forms/TextInput";
import Textarea from "../../../../shared/forms/Textarea";
import { useToast } from "../../../../shared/feedback/ToastContext";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { isValidEmail, isValidPhone, validateRequired } from "../../../../utils/validation";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../../shared/constants";
import { accountApi } from "../../account/api/accountApi";
import { useCustomerAuth } from "../../account/context/CustomerAuthContext";
import AddressFields, { emptyAddress, validateAddress } from "../../account/components/AddressFields";

const initialValues = {
  name: "",
  phone: "",
  email: "",
  companyName: "",
  location: "",
  product: "",
  category: "",
  quantity: "",
  preferredContact: "whatsapp",
  message: "",
};

const objectIdPattern = /^[a-f\d]{24}$/i;

const buildMessage = (values, selectedProduct, selectedCategory) =>
  [
    values.message,
    selectedProduct?.name ? `Product: ${selectedProduct.name}` : "",
    selectedCategory?.name ? `Category: ${selectedCategory.name}` : "",
    values.quantity ? `Quantity: ${values.quantity}` : "",
    values.preferredContact ? `Preferred contact: ${values.preferredContact}` : "",
  ]
    .filter(Boolean)
    .join("\n");

export default function EnquiryForm({ products = [], categories = [] }) {
  const [searchParams] = useSearchParams();
  const { account, isSignedIn } = useCustomerAuth();
  const [values, setValues] = useState(initialValues);
  const [address, setAddress] = useState(emptyAddress);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { showToast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const productSlug = searchParams.get("product");
    if (!productSlug) return;
    const selectedProduct = products.find((product) => product.slug === productSlug);
    if (selectedProduct) {
      setValues((current) => ({
        ...current,
        product: selectedProduct.slug,
        category: selectedProduct.categorySlug,
        message:
          current.message || t("I would like to know more about {{product}}.", { product: selectedProduct.name }),
      }));
    }
  }, [products, searchParams, t]);

  useEffect(() => {
    if (!account) return;
    setValues((current) => ({
      ...current,
      name: current.name || account.name || "",
      phone: current.phone || account.phone || "",
      email: current.email || account.email || "",
    }));
    setAddress((current) =>
      current.district || current.state ? current : { ...emptyAddress, ...(account.address || {}) },
    );
  }, [account]);

  const productOptions = useMemo(
    () => [
      { label: "Select product", value: "" },
      ...products.map((product) => ({ label: product.name, value: product.slug })),
    ],
    [products],
  );

  const categoryOptions = useMemo(
    () => [
      { label: "Select category", value: "" },
      ...categories.map((category) => ({ label: category.name, value: category.slug })),
    ],
    [categories],
  );

  const updateField = (field) => (event) => {
    const value = event.target.value;
    setValues((current) => {
      const nextValues = { ...current, [field]: value };
      if (field === "product") {
        const selectedProduct = products.find((product) => product.slug === value);
        if (selectedProduct) nextValues.category = selectedProduct.categorySlug;
      }
      return nextValues;
    });
    setErrors((current) => ({ ...current, [field]: "" }));
    setIsComplete(false);
  };

  const validate = () => {
    const nextErrors = {};
    if (!validateRequired(values.name)) nextErrors.name = "Name is required.";
    if (!values.phone && !values.email) nextErrors.phone = "Enter a phone number or email address.";
    if (values.phone && !isValidPhone(values.phone)) nextErrors.phone = "Enter a valid phone number.";
    if (!isValidEmail(values.email)) nextErrors.email = "Enter a valid email address.";
    if (!validateRequired(values.location)) nextErrors.location = "Location is required.";
    if (!validateRequired(values.product) && !validateRequired(values.category)) {
      nextErrors.product = "Select a product or category.";
    }
    // District and state are asked of guests too: they are what routes an
    // enquiry to the right area team, and an enquiry nobody can place on a
    // map is an enquiry nobody can act on.
    return { ...nextErrors, ...validateAddress(address) };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setIsSubmitting(true);
    try {
      const selectedProduct = products.find((product) => product.slug === values.product);
      const selectedCategory = categories.find((category) => category.slug === values.category);
      // Through accountApi, which carries the customer's token when there
      // is one — so a signed-in buyer's enquiry lands in their own
      // history, and a guest's stays anonymous.
      await accountApi.submitEnquiry({
        name: values.name,
        phone: values.phone,
        email: values.email,
        companyName: values.companyName,
        location: values.location,
        address,
        interestedProducts:
          selectedProduct?.id && objectIdPattern.test(selectedProduct.id) ? [selectedProduct.id] : [],
        message: buildMessage(values, selectedProduct, selectedCategory),
      });
      setIsComplete(true);
      showToast("Thank you. Your enquiry has been submitted.");
      setValues(initialValues);
      setAddress(isSignedIn ? { ...emptyAddress, ...(account?.address || {}) } : emptyAddress);
    } catch (error) {
      const message =
        error.status === 429
          ? "Too many enquiries were submitted recently. Please wait a little and try again."
          : error.friendlyMessage || "Unable to submit your enquiry.";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="rounded-[2rem] border border-forest/10 bg-white p-6 shadow-soft sm:p-8" onSubmit={handleSubmit}>
      {isComplete ? (
        <div className="mb-6 rounded-2xl border border-agriculture/20 bg-mint p-5">
          <h2 className="text-xl font-extrabold text-forest">{t("Thank you. Your enquiry has been recorded.")}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            {t("Your request has been submitted. The team will review the enquiry details and respond through your provided contact information.")}
          </p>
        </div>
      ) : null}
      {!isSignedIn ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-forest/10 bg-mint/40 p-4">
          <p className="text-sm font-semibold text-forest">
            {t("Buying from us? Sign in to the customer portal to track this enquiry and re-order later.")}
          </p>
          <span className="flex gap-3 text-sm font-bold">
            <Link className="text-forest underline" to={ROUTES.PUBLIC.ACCOUNT_LOGIN}>
              {t("Customer Sign In")}
            </Link>
            <Link className="text-forest underline" to={ROUTES.PUBLIC.ACCOUNT_REGISTER}>
              {t("Create Customer Account")}
            </Link>
          </span>
        </div>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput
          error={errors.name}
          id="enquiry-name"
          label="Name"
          onChange={updateField("name")}
          required
          value={values.name}
        />
        <TextInput
          error={errors.phone}
          id="enquiry-phone"
          label="Phone"
          onChange={updateField("phone")}
          required
          value={values.phone}
        />
        <TextInput
          error={errors.email}
          id="enquiry-email"
          label="Email"
          onChange={updateField("email")}
          type="email"
          value={values.email}
        />
        <TextInput
          id="enquiry-company"
          label="Company / Business Name"
          onChange={updateField("companyName")}
          value={values.companyName}
        />
        <TextInput
          error={errors.location}
          id="enquiry-location"
          label="Location"
          onChange={updateField("location")}
          required
          value={values.location}
        />
        <TextInput
          id="enquiry-quantity"
          label="Quantity"
          onChange={updateField("quantity")}
          placeholder="Example: 25 bags, 10 cartons"
          value={values.quantity}
        />
        <Select
          error={errors.product}
          id="enquiry-product"
          label="Product"
          onChange={updateField("product")}
          options={productOptions}
          value={values.product}
        />
        <Select
          id="enquiry-category"
          label="Category"
          onChange={updateField("category")}
          options={categoryOptions}
          value={values.category}
        />
        <Select
          id="preferred-contact"
          label="Preferred Contact Method"
          onChange={updateField("preferredContact")}
          options={[
            { label: "WhatsApp", value: "whatsapp" },
            { label: "Phone", value: "phone" },
            { label: "Email", value: "email" },
          ]}
          value={values.preferredContact}
        />
        <div className="sm:col-span-2">
          <h2 className="text-lg font-black text-ink">{t("Where should we reach you?")}</h2>
          <p className="mt-1 text-sm text-muted">
            {t("District and state let us send the right area team.")}
          </p>
        </div>
        <AddressFields errors={errors} idPrefix="enquiry" onChange={setAddress} values={address} />
        <div className="sm:col-span-2">
          <Textarea
            id="enquiry-message"
            label="Message"
            onChange={updateField("message")}
            placeholder="Share crop, product, supply or business requirement details."
            value={values.message}
          />
        </div>
      </div>
      <Button className="mt-6 w-full sm:w-auto" disabled={isSubmitting || isComplete} type="submit">
        {isSubmitting ? "Submitting..." : "Submit Enquiry"}
      </Button>
    </form>
  );
}
