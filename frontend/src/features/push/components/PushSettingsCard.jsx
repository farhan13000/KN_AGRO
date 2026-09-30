import { Bell, BellOff, Send, Smartphone } from "lucide-react";
import Card from "../../../shared/components/Card";
import { usePushNotifications } from "../hooks";
import { PUSH_MODULE_LABELS, PUSH_MODULE_ORDER } from "../constants";

function Toggle({ checked, disabled, label, hint, onChange }) {
  return (
    <label
      className={`flex items-start justify-between gap-3 rounded-xl px-3 py-2.5 transition ${
        disabled ? "opacity-50" : "hover:bg-mint/50"
      }`}
    >
      <span className="min-w-0">
        <span className="block text-sm font-bold text-ink">{label}</span>
        {hint ? <span className="block text-xs font-semibold text-muted">{hint}</span> : null}
      </span>
      <input
        checked={checked}
        className="mt-0.5 h-5 w-5 shrink-0 accent-forest"
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
    </label>
  );
}

/**
 * ONE SCREEN FOR THE WHOLE THING, and it separates the two questions
 * people conflate:
 *
 *   "Should this phone buzz at all?"  — per DEVICE, the big button. A
 *   browser subscription belongs to one browser on one machine, so this
 *   genuinely has to be answered again on each.
 *
 *   "What is worth buzzing about?"    — per PERSON, the module list.
 *   Silencing attendance is a statement about you, not about your phone,
 *   so it follows you to every device you sign in on.
 *
 * The module list stays visible and usable even when this device is off,
 * greyed but not hidden: someone setting up a second phone should be able
 * to see what they will get before they turn it on.
 */
export default function PushSettingsCard() {
  const {
    disable,
    enable,
    error,
    isBusy,
    message,
    permission,
    preferences,
    sendTest,
    setEnabled,
    setModule,
    subscribed,
    support,
  } = usePushNotifications();

  const blocked = permission === "denied";
  const masterOff = preferences?.enabled === false;

  return (
    <Card className="p-5" data-push-settings>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-ink">Notifications on this device</h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-muted">
            Get told on your phone when something needs you — even when the app is closed.
          </p>
        </div>
        {support.supported ? (
          <button
            className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition disabled:opacity-60 ${
              subscribed
                ? "bg-white text-forest ring-1 ring-forest/15 hover:bg-mint"
                : "bg-forest text-white hover:bg-agriculture"
            }`}
            data-push-toggle
            disabled={isBusy || blocked}
            onClick={() => (subscribed ? disable() : enable())}
            type="button"
          >
            {subscribed ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            {subscribed ? "Turn off here" : "Turn on"}
          </button>
        ) : null}
      </div>

      {/* The iPhone case has its own wording — "not supported" would be
          wrong, since installing the app is exactly what makes it work. */}
      {!support.supported ? (
        <p
          className={`mt-4 rounded-lg border px-3 py-2 text-sm font-semibold ${
            support.needsInstall
              ? "border-amber-200 bg-amber-50 text-amber-900"
              : "border-forest/15 bg-mint/40 text-muted"
          }`}
          data-push-unsupported
        >
          {support.reason}
        </p>
      ) : null}

      {blocked ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
          Notifications are blocked for this site in your browser. Open the padlock next to the address, allow
          notifications, then reload this page.
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-800">
          {message}
        </p>
      ) : null}

      {subscribed ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1 text-xs font-bold text-forest">
            <Smartphone className="h-3.5 w-3.5" />
            This device is on
            {preferences?.deviceCount > 1 ? ` · ${preferences.deviceCount} devices in total` : ""}
          </span>
          {/* The only honest way to answer "is it really working?" —
              permission can read as granted while the subscription is
              stale, and only a delivered banner settles it. */}
          <button
            className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint disabled:opacity-60"
            data-push-test
            disabled={isBusy}
            onClick={sendTest}
            type="button"
          >
            <Send className="h-3.5 w-3.5" />
            Send a test
          </button>
        </div>
      ) : null}

      {preferences ? (
        <div className="mt-5 border-t border-forest/10 pt-4">
          <Toggle
            checked={!masterOff}
            hint="Applies to every device you sign in on"
            label="Send me notifications"
            onChange={(value) => setEnabled(value)}
          />

          <p className="mt-3 px-3 text-xs font-black uppercase tracking-wide text-soft">What to send</p>
          <div className="mt-1" data-push-modules>
            {PUSH_MODULE_ORDER.filter((module) => module in (preferences.modules || {})).map((module) => (
              <Toggle
                checked={Boolean(preferences.modules[module])}
                disabled={masterOff}
                key={module}
                label={PUSH_MODULE_LABELS[module] || module}
                onChange={(value) => setModule(module, value)}
              />
            ))}
          </div>

          <p className="mt-3 px-3 text-xs leading-5 text-muted">
            Everything still appears in the bell inside the app, whatever you switch off here.
          </p>
        </div>
      ) : null}
    </Card>
  );
}
