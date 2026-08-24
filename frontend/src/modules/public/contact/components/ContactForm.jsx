import { useState } from "react";
import Button from "../../../../shared/components/Button";
import TextInput from "../../../../shared/forms/TextInput";
import Textarea from "../../../../shared/forms/Textarea";
import { useToast } from "../../../../shared/feedback/ToastContext";
import { isValidEmail, isValidPhone, validateMinLength, validateRequired } from "../../../../utils/validation";
import { publicEnquiriesApi } from "../../enquiries/api/publicEnquiries.api";

const initialValues = {
  name: "",
  phone: "",
  email: "",
  companyName: "",
  subject: "",
  message: "",
};

const buildContactMessage = (values) =>
  [values.subject ? `Subject: ${values.subject}` : "", values.message].filter(Boolean).join("\n");

export default function ContactForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const updateField = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!validateRequired(values.name)) nextErrors.name = "Name is required.";
    if (!values.phone && !values.email) nextErrors.phone = "Enter a phone number or email address.";
    if (values.phone && !isValidPhone(values.phone)) nextErrors.phone = "Enter a valid phone number.";
    if (!isValidEmail(values.email)) nextErrors.email = "Enter a valid email address.";
    if (!validateMinLength(values.message, 10)) nextErrors.message = "Message must be at least 10 characters.";
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setIsSubmitting(true);
    try {
      await publicEnquiriesApi.submitEnquiry({
        name: values.name,
        phone: values.phone,
        email: values.email,
        companyName: values.companyName,
        message: buildContactMessage(values),
      });
      showToast("Thank you. Your message has been submitted.");
      setValues(initialValues);
    } catch (error) {
      const message =
        error.status === 429
          ? "Too many messages were submitted recently. Please wait a little and try again."
          : error.friendlyMessage || "Unable to submit your message.";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="rounded-[2rem] border border-forest/10 bg-white p-6 shadow-soft sm:p-8" onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput
          error={errors.name}
          id="contact-name"
          label="Name"
          onChange={updateField("name")}
          required
          value={values.name}
        />
        <TextInput
          error={errors.phone}
          id="contact-phone"
          label="Phone"
          onChange={updateField("phone")}
          required
          value={values.phone}
        />
        <TextInput
          error={errors.email}
          id="contact-email"
          label="Email"
          onChange={updateField("email")}
          type="email"
          value={values.email}
        />
        <TextInput
          id="contact-company"
          label="Company / Business"
          onChange={updateField("companyName")}
          value={values.companyName}
        />
        <div className="sm:col-span-2">
          <TextInput
            id="contact-subject"
            label="Subject"
            onChange={updateField("subject")}
            value={values.subject}
          />
        </div>
        <div className="sm:col-span-2">
          <Textarea
            error={errors.message}
            id="contact-message"
            label="Message"
            onChange={updateField("message")}
            required
            value={values.message}
          />
        </div>
      </div>
      <Button className="mt-6 w-full sm:w-auto" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Submitting..." : "Send Message"}
      </Button>
    </form>
  );
}
