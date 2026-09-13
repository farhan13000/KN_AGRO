import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../../../../shared/components/Button";
import SEO from "../../../../shared/components/SEO";
import TextInput from "../../../../shared/forms/TextInput";
import { ROUTES } from "../../../../shared/constants";
import { useToast } from "../../../../shared/feedback/ToastContext";
import { useCustomerAuth } from "../context/CustomerAuthContext";

/**
 * Customer sign-in — a different door from /login, which is the staff
 * portal. One field accepts either the phone number or the email, because
 * nobody remembers which one they signed up with.
 */
export default function CustomerLoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useCustomerAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Sent here mid-task (e.g. from the enquiry form)? Go back to it.
  const redirectTo = location.state?.from || ROUTES.PUBLIC.ACCOUNT;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!identifier.trim() || !password) {
      setFormError("Enter your phone/email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(identifier.trim(), password);
      showToast("Signed in.");
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setFormError(error.friendlyMessage || "Unable to sign in. Please check your details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO description="Customer sign in — see your KN Agro enquiries and orders, and re-order." path="/account/login" title="Customer Sign In" />
      <section className="section-padding bg-ivory">
        <div className="site-container max-w-md">
          <div className="rounded-[2rem] border border-forest/10 bg-white p-6 shadow-soft sm:p-8">
            <p className="eyebrow">Customer Portal</p>
            <h1 className="mt-2 text-3xl font-black text-ink">Customer sign in</h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              See your past enquiries and orders, and ask for a repeat order in one tap.
            </p>

            <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
              <TextInput
                id="account-identifier"
                label="Phone or Email"
                onChange={(event) => setIdentifier(event.target.value)}
                required
                value={identifier}
              />
              <TextInput
                id="account-password"
                label="Password"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />

              {formError ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                  {formError}
                </p>
              ) : null}

              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="mt-5 text-sm text-muted">
              New here?{" "}
              <Link className="font-bold text-forest underline" to={ROUTES.PUBLIC.ACCOUNT_REGISTER}>
                Create an account
              </Link>
            </p>
            <p className="mt-2 text-xs text-muted">
              Staff member? Use the{" "}
              <Link className="font-bold text-forest underline" to={ROUTES.AUTH.LOGIN}>
                employee portal
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
