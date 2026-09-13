import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../../../shared/components/Button";
import SEO from "../../../../shared/components/SEO";
import TextInput from "../../../../shared/forms/TextInput";
import { ROUTES } from "../../../../shared/constants";
import { useToast } from "../../../../shared/feedback/ToastContext";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import AddressFields, { emptyAddress, validateAddress } from "../components/AddressFields";

/**
 * Sign-up. Phone is the identifier — these buyers reliably have one, an
 * email address far less so — and the address is collected here rather
 * than later because it is what routes an enquiry to the right territory.
 */
export default function CustomerRegisterPage() {
  const [values, setValues] = useState({ name: "", phone: "", email: "", password: "" });
  const [address, setAddress] = useState(emptyAddress);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useCustomerAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const update = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!values.name.trim()) next.name = "Name is required.";
    if (!/^[6-9]\d{9}$/.test(values.phone.trim())) next.phone = "Enter a 10-digit mobile number.";
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (values.password.length < 6) next.password = "Password must be at least 6 characters.";
    return { ...next, ...validateAddress(address) };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setIsSubmitting(true);
    try {
      await register({
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        password: values.password,
        address,
      });
      showToast("Account created.");
      navigate(ROUTES.PUBLIC.ACCOUNT, { replace: true });
    } catch (error) {
      setFormError(error.friendlyMessage || "Unable to create your account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        description="Create a KN Agro customer account to track your enquiries and orders."
        path="/account/register"
        title="Create Customer Account"
      />
      <section className="section-padding bg-ivory">
        <div className="site-container max-w-2xl">
          <div className="rounded-[2rem] border border-forest/10 bg-white p-6 shadow-soft sm:p-8">
            <p className="eyebrow">Customer Portal</p>
            <h1 className="mt-2 text-3xl font-black text-ink">Create your customer account</h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              Your enquiries and orders stay in one place, and a repeat order takes one tap.
            </p>

            <form className="mt-6 grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
              <TextInput
                error={errors.name}
                id="register-name"
                label="Full Name"
                onChange={update("name")}
                required
                value={values.name}
              />
              <TextInput
                error={errors.phone}
                id="register-phone"
                inputMode="numeric"
                label="Mobile Number"
                onChange={update("phone")}
                required
                value={values.phone}
              />
              <TextInput
                error={errors.email}
                id="register-email"
                label="Email (optional)"
                onChange={update("email")}
                type="email"
                value={values.email}
              />
              <TextInput
                error={errors.password}
                id="register-password"
                label="Password"
                onChange={update("password")}
                required
                type="password"
                value={values.password}
              />

              <div className="sm:col-span-2">
                <h2 className="text-lg font-black text-ink">Your address</h2>
                <p className="mt-1 text-sm text-muted">
                  So our field team knows which area to serve you from.
                </p>
              </div>
              <AddressFields errors={errors} idPrefix="register" onChange={setAddress} values={address} />

              {formError ? (
                <p className="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                  {formError}
                </p>
              ) : null}

              <div className="sm:col-span-2">
                <Button className="w-full sm:w-auto" disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Creating..." : "Create Account"}
                </Button>
              </div>
            </form>

            <p className="mt-5 text-sm text-muted">
              Already have an account?{" "}
              <Link className="font-bold text-forest underline" to={ROUTES.PUBLIC.ACCOUNT_LOGIN}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
