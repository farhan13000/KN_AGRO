import { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Button from "../../../../shared/components/Button";
import SEO from "../../../../shared/components/SEO";
import TextInput from "../../../../shared/forms/TextInput";
import { ROUTES } from "../../../../shared/constants";
import { useToast } from "../../../../shared/feedback/ToastContext";
import { accountApi } from "../api/accountApi";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import AddressFields, { emptyAddress, validateAddress } from "../components/AddressFields";

const TABS = [
  { id: "enquiries", label: "My Enquiries" },
  { id: "orders", label: "My Orders" },
  { id: "profile", label: "Profile" },
];

const formatDate = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toLocaleDateString("en-IN");
};

const formatMoney = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

function Panel({ children, title }) {
  return (
    <div className="rounded-[2rem] border border-forest/10 bg-white p-6 shadow-soft sm:p-8">
      <h2 className="text-xl font-black text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

/**
 * Everything a website buyer has with KN Agro: what they asked for, what
 * they bought, and the details we hold about them.
 *
 * "Re-order" raises a NEW ENQUIRY rather than an order, because pricing
 * and stock are the sales team's call — see CustomerAccountService.reorder.
 * The button says so, so nobody expects a confirmed order.
 */
export default function MyAccountPage() {
  const { account, isReady, isSignedIn, logout, updateProfile } = useCustomerAuth();
  const [tab, setTab] = useState("enquiries");
  const [enquiries, setEnquiries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reorderingId, setReorderingId] = useState(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [enquiryData, orderData] = await Promise.all([
        accountApi.getMyEnquiries({ limit: 50 }),
        accountApi.getMyOrders({ limit: 50 }),
      ]);
      setEnquiries(enquiryData?.enquiries || []);
      setOrders(orderData?.orders || []);
    } catch (error) {
      setLoadError(error.friendlyMessage || "Unable to load your account right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSignedIn) load();
  }, [isSignedIn, load]);

  if (!isReady) {
    return (
      <section className="section-padding bg-ivory">
        <div className="site-container">
          <p className="text-sm font-semibold text-muted">Loading your account…</p>
        </div>
      </section>
    );
  }

  if (!isSignedIn) {
    return <Navigate replace state={{ from: ROUTES.PUBLIC.ACCOUNT }} to={ROUTES.PUBLIC.ACCOUNT_LOGIN} />;
  }

  const handleReorder = async (order) => {
    setReorderingId(order._id);
    try {
      const result = await accountApi.reorder(order._id);
      showToast(`Repeat request sent (${result?.leadCode}). Our team will contact you.`);
      await load();
      setTab("enquiries");
    } catch (error) {
      showToast(error.friendlyMessage || "Unable to send the repeat request.", "error");
    } finally {
      setReorderingId(null);
    }
  };

  const handleSignOut = async () => {
    await logout();
    showToast("Signed out.");
    navigate(ROUTES.PUBLIC.HOME);
  };

  return (
    <>
      <SEO description="Your KN Agro enquiries and orders." path="/account" title="Customer Portal" />
      <section className="section-padding bg-ivory">
        <div className="site-container">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Customer Portal</p>
              <h1 className="mt-2 text-3xl font-black text-ink">{account?.name}</h1>
              <p className="mt-1 text-sm text-muted">
                {account?.phone}
                {account?.email ? ` · ${account.email}` : ""}
              </p>
            </div>
            <Button onClick={handleSignOut} variant="secondary">
              Sign Out
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2" role="tablist">
            {TABS.map((item) => (
              <button
                aria-selected={tab === item.id}
                className={`inline-flex min-h-11 items-center rounded-xl px-5 py-2 text-sm font-bold transition ${
                  tab === item.id
                    ? "bg-forest text-white shadow-soft"
                    : "bg-white text-forest ring-1 ring-forest/15 hover:bg-mint"
                }`}
                key={item.id}
                onClick={() => setTab(item.id)}
                role="tab"
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>

          {loadError ? (
            <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
              {loadError}
            </p>
          ) : null}

          <div className="mt-6" role="tabpanel">
            {tab === "enquiries" ? (
              <Panel title="My Enquiries">
                {loading ? <p className="text-sm text-muted">Loading…</p> : null}
                {!loading && !enquiries.length ? (
                  <p className="text-sm text-muted">
                    You have not sent an enquiry yet. Anything you send from the enquiry form will appear here.
                  </p>
                ) : null}
                <ul className="grid gap-4">
                  {enquiries.map((enquiry) => (
                    <li className="rounded-2xl border border-forest/10 bg-ivory p-5" key={enquiry._id}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="font-black text-forest">{enquiry.leadCode}</span>
                        <span className="rounded-full bg-mint px-3 py-1 text-xs font-black uppercase text-forest">
                          {enquiry.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-semibold text-muted">{formatDate(enquiry.createdAt)}</p>
                      {enquiry.interestedProducts?.length ? (
                        <p className="mt-2 text-sm font-semibold text-ink">
                          {enquiry.interestedProducts.map((product) => product.name).filter(Boolean).join(", ")}
                        </p>
                      ) : null}
                      {enquiry.message ? (
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted">{enquiry.message}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </Panel>
            ) : null}

            {tab === "orders" ? (
              <Panel title="My Orders">
                {loading ? <p className="text-sm text-muted">Loading…</p> : null}
                {!loading && !orders.length ? (
                  <p className="text-sm text-muted">
                    No orders yet. Once our team confirms an order for you, it appears here with a repeat-order
                    button.
                  </p>
                ) : null}
                <ul className="grid gap-4">
                  {orders.map((order) => (
                    <li className="rounded-2xl border border-forest/10 bg-ivory p-5" key={order._id}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="font-black text-forest">{order.orderNumber}</span>
                        <span className="rounded-full bg-mint px-3 py-1 text-xs font-black uppercase text-forest">
                          {order.orderStatus}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-semibold text-muted">
                        {formatDate(order.orderDate)} · {formatMoney(order.grandTotal)} · {order.paymentStatus}
                      </p>
                      <ul className="mt-3 grid gap-1 text-sm text-ink">
                        {(order.items || []).map((item, index) => (
                          <li key={`${order._id}-${index}`}>
                            {item.productName} — {item.quantity} {item.unit} @ {formatMoney(item.rate)}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4">
                        <Button
                          disabled={reorderingId === order._id}
                          onClick={() => handleReorder(order)}
                          variant="secondary"
                        >
                          {reorderingId === order._id ? "Sending..." : "Order this again"}
                        </Button>
                        <p className="mt-2 text-xs text-muted">
                          This sends a repeat request to our team, who confirm price and stock before the order is
                          placed.
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Panel>
            ) : null}

            {tab === "profile" ? <ProfilePanel account={account} onSave={updateProfile} /> : null}
          </div>
        </div>
      </section>
    </>
  );
}

function ProfilePanel({ account, onSave }) {
  const [name, setName] = useState(account?.name || "");
  const [email, setEmail] = useState(account?.email || "");
  const [address, setAddress] = useState(account?.address || emptyAddress);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateAddress(address);
    if (!name.trim()) nextErrors.name = "Name is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setIsSaving(true);
    try {
      await onSave({ name: name.trim(), email: email.trim(), address });
      showToast("Profile updated.");
    } catch (error) {
      showToast(error.friendlyMessage || "Unable to update your profile.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Panel title="Profile">
      <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
        <TextInput
          error={errors.name}
          id="profile-name"
          label="Full Name"
          onChange={(event) => setName(event.target.value)}
          required
          value={name}
        />
        <TextInput
          id="profile-email"
          label="Email"
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          value={email}
        />
        {/* Phone is the account identifier and is not editable here — it is
            how past enquiries and orders are matched to this account. */}
        <TextInput disabled id="profile-phone" label="Mobile Number" readOnly value={account?.phone || ""} />
        <div className="sm:col-span-2">
          <h3 className="text-lg font-black text-ink">Address</h3>
        </div>
        <AddressFields errors={errors} idPrefix="profile" onChange={setAddress} values={address} />
        <div className="sm:col-span-2">
          <Button className="w-full sm:w-auto" disabled={isSaving} type="submit">
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Panel>
  );
}
