import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Download, KeyRound, LogOut, Menu, PanelLeftClose, UserCircle, X } from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/KN_AGRO_LOGO.png";
import { useAuth } from "../../core/auth";
import Avatar from "../components/Avatar";
import BackButton from "../components/BackButton";
import { NotificationBell, useNotificationBadges } from "../../features/notifications";
import { PushClickRouter } from "../../features/push";
import { PERMISSIONS, ROLE_LABELS, ROUTES, normalizeRoleName } from "../constants";
import InstallInstructionsDialog from "../components/InstallInstructionsDialog";
import { useInstallPrompt } from "../hooks";

/**
 * A dot, never a number.
 *
 * A number claims something exact — "there are 5 things waiting" — and
 * that claim is only as good as what it counts. This counts unread
 * notifications, which stop being unread the moment someone opens the
 * screen, whether or not the work behind them got done. So the number
 * could read 0 with five approvals still pending, and a badge that
 * can be wrong that way is worse than no badge.
 *
 * A dot only claims "something new is here", which opening the screen
 * genuinely does settle. It does the job the sidebar badge exists for
 * — pointing you at the right screen — and makes no promise it cannot
 * keep. If an exact count is ever wanted, it has to come from the work
 * itself (pending leaves, pending approvals), not from notifications.
 */
function NavBadge({ collapsed, count }) {
  if (!count) return null;

  return (
    <span
      aria-hidden="true"
      className={`shrink-0 rounded-full bg-red-600 ${
        collapsed ? "absolute right-2 top-2 h-2.5 w-2.5 ring-2 ring-white" : "ml-auto h-2.5 w-2.5"
      }`}
    />
  );
}

/**
 * A badge clears when the person reaches the screen the work is on —
 * never when they merely open the bell. Seeing that something exists is
 * not dealing with it, and a badge that disappears on a glance teaches
 * people within a week that badges mean nothing.
 *
 * Only the module whose screen is open is touched; every other badge
 * survives until its own screen is visited. Keyed off the `count` value
 * (a number, not the object it came from) so this settles after one
 * pass instead of re-firing on every poll.
 */
function useMarkModuleReadOnVisit(items) {
  const { pathname } = useLocation();
  const { byModule, markModuleRead } = useNotificationBadges();

  const modules = useMemo(() => {
    const matches = items
      .filter((item) => item.badgeKey && (pathname === item.route || pathname.startsWith(`${item.route}/`)))
      // Longest route wins, so a nested screen doesn't clear its parent's
      // badge by accident.
      .sort((a, b) => b.route.length - a.route.length);
    const key = matches[0]?.badgeKey;
    if (!key) return [];
    return Array.isArray(key) ? key : [key];
  }, [items, pathname]);

  const count = modules.reduce((sum, module) => sum + (byModule[module] ?? 0), 0);
  // A stable primitive to depend on: the array is rebuilt every render,
  // so depending on it directly would re-run this on every poll.
  const moduleKey = modules.join(",");

  useEffect(() => {
    if (!moduleKey || count === 0) return;

    for (const module of moduleKey.split(",")) {
      if (!byModule[module]) continue;
      markModuleRead(module).catch(() => {
        // Clearing a badge is housekeeping — if it fails the count simply
        // stays up and the next visit tries again. Never surface this.
      });
    }
    // `byModule` is read inside but deliberately not a dependency: it is a
    // fresh object on every poll, and `count` already captures the only
    // change that should re-run this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleKey, count, markModuleRead]);
}

function NavigationItems({ collapsed = false, items, onNavigate }) {
  const { hasPermission, role } = useAuth();
  const { countFor } = useNotificationBadges();
  const normalizedRole = normalizeRoleName(role);
  // `permission` answers "may this account do it at all"; the optional
  // `roles` narrows an entry further, for the few screens that a
  // permission alone would put in front of the wrong person — the Office
  // Admin's own DSR is one, since the Super Admin holds the same
  // permission but is who the report goes TO.
  const visibleItems = useMemo(
    () =>
      items.filter(
        (item) =>
          (!item.permission || hasPermission(item.permission)) &&
          (!item.roles || item.roles.includes(normalizedRole)),
      ),
    [hasPermission, items, normalizedRole],
  );

  return (
    <nav className="space-y-1" aria-label="Portal navigation">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const count = countFor(item.badgeKey);
        // The accessible name says exactly what the dot says — no more.
        // Announcing "3 waiting" to a screen reader would reintroduce
        // the same unreliable number the dot exists to avoid.
        const label = count ? `${item.label}, has new activity` : item.label;

        return (
          <NavLink
            aria-label={count ? label : undefined}
            className={({ isActive }) =>
              `relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold transition ${
                isActive ? "bg-forest text-white shadow-soft" : "text-muted hover:bg-mint hover:text-forest"
              }`
            }
            key={item.route}
            onClick={onNavigate}
            to={item.route}
            title={collapsed ? label : undefined}
          >
            {Icon ? <Icon className="h-5 w-5 shrink-0" /> : null}
            <span className={collapsed ? "sr-only" : "truncate"}>{item.label}</span>
            <NavBadge collapsed={collapsed} count={count} />
          </NavLink>
        );
      })}
    </nav>
  );
}

function ProfileMenu() {
  const navigate = useNavigate();
  const { logout, role, user } = useAuth();
  const [open, setOpen] = useState(false);
  const displayName = user?.name || user?.email || "K N Agro User";
  const roleLabel = ROLE_LABELS[role] || role || "Portal User";

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.AUTH.LOGIN, { replace: true });
  };

  return (
    <div className="relative">
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex min-h-11 items-center gap-3 rounded-xl px-2 py-1.5 text-left transition hover:bg-mint"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <Avatar className="h-9 w-9 text-sm" name={displayName} src={user?.photo?.url || ""} />
        <span className="hidden min-w-0 md:block">
          <span className="block max-w-44 truncate text-sm font-bold text-ink">{displayName}</span>
          <span className="block max-w-44 truncate text-xs font-semibold text-muted">{roleLabel}</span>
        </span>
        <ChevronDown className="hidden h-4 w-4 text-soft md:block" />
      </button>

      {open ? (
        // Capped to the screen on a phone for the same reason the
        // notifications panel is: a fixed width anchored to a button can
        // reach past the edge of a narrow screen.
        <div
          className="absolute right-0 z-40 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-forest/10 bg-white p-2 shadow-card"
          role="menu"
        >
          <div className="border-b border-forest/10 px-3 py-3">
            <Avatar className="mb-2" name={displayName} size="lg" src={user?.photo?.url || ""} />
            <p className="truncate text-sm font-black text-ink">{displayName}</p>
            <p className="mt-1 truncate text-xs font-semibold text-muted">{user?.email || "No email available"}</p>
            <p className="mt-2 inline-flex rounded-full bg-mint px-2.5 py-1 text-xs font-bold text-forest">
              {roleLabel}
            </p>
          </div>
          <Link
            className="mt-2 flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-muted transition hover:bg-mint hover:text-forest"
            onClick={() => setOpen(false)}
            role="menuitem"
            to={ROUTES.AUTH.CHANGE_PASSWORD}
          >
            <KeyRound className="h-4 w-4" />
            Change Password
          </Link>
          <button
            className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold text-red-700 transition hover:bg-red-50"
            onClick={handleLogout}
            role="menuitem"
            type="button"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function InternalAppLayout({ navigationItems, portalLabel }) {
  const { hasPermission } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  // True when the browser can install the app, or on Apple devices (where
  // the button shows the Add-to-Home-Screen steps instead) — never once
  // the app is already running installed. See useInstallPrompt.
  const { canInstall, installMode, promptInstall } = useInstallPrompt();
  const [showInstallSteps, setShowInstallSteps] = useState(false);
  const handleInstall = async () => {
    if ((await promptInstall()) === "manual") setShowInstallSteps(true);
  };
  // The screens the sidebar reaches directly: Back hides itself on these.
  const rootPaths = useMemo(() => navigationItems.map((item) => item.route), [navigationItems]);
  useMarkModuleReadOnVisit(navigationItems);
  const desktopSidebarClass = desktopCollapsed ? "lg:w-24" : "lg:w-72";
  const desktopContentClass = desktopCollapsed ? "lg:pl-24" : "lg:pl-72";

  return (
    <div className="min-h-screen bg-ivory text-ink">
      {/* Renders nothing. Mounted here because it must be inside the
          router and alive on every signed-in screen — a notification can
          be tapped while the person is anywhere in the app. */}
      <PushClickRouter />

      {/* Outside the sidebar: its translate transform would otherwise trap
          the dialog's fixed overlay inside the sidebar. */}
      <InstallInstructionsDialog
        isOpen={showInstallSteps}
        onClose={() => setShowInstallSteps(false)}
        platform={installMode}
      />

      {sidebarOpen ? (
        <div className="fixed inset-0 z-40 bg-ink/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-forest/10 bg-white px-4 py-5 shadow-card transition-all lg:translate-x-0 print:hidden ${desktopSidebarClass} ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <Link className="flex items-center gap-3" to={ROUTES.PUBLIC.HOME}>
            <img alt="K N Agro" className="h-11 w-11 rounded-xl object-contain ring-1 ring-forest/10" src={logo} />
            <span className={desktopCollapsed ? "lg:sr-only" : ""}>
              <span className="block text-sm font-black text-forest">K N Agro</span>
              <span className="block text-xs font-semibold text-muted">{portalLabel}</span>
            </span>
          </Link>
          <button
            aria-label="Close navigation"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:bg-mint hover:text-forest lg:hidden"
            onClick={() => setSidebarOpen(false)}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Absent entirely once the app is installed, and on browsers that
            never offer an install — a control that cannot do anything is
            worse than no control. */}
        {canInstall ? (
          <button
            className={`mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl bg-mint/70 px-3 py-2 text-xs font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint ${
              desktopCollapsed ? "lg:justify-center lg:px-0" : ""
            }`}
            onClick={handleInstall}
            title="Install KN Agro as an app"
            type="button"
          >
            <Download aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span className={desktopCollapsed ? "lg:sr-only" : ""}>Install app</span>
          </button>
        ) : null}

        <div className="mt-8 flex-1 overflow-y-auto">
          <NavigationItems
            collapsed={desktopCollapsed}
            items={navigationItems}
            onNavigate={() => setSidebarOpen(false)}
          />
        </div>
      </aside>

      <div className={`transition-all print:pl-0 ${desktopContentClass}`}>
        <header className="sticky top-0 z-30 border-b border-forest/10 bg-ivory/95 px-4 py-3 backdrop-blur sm:px-6 print:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                aria-label="Open navigation"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-forest shadow-sm ring-1 ring-forest/10 transition hover:bg-mint lg:hidden"
                onClick={() => setSidebarOpen(true)}
                type="button"
              >
                <Menu className="h-5 w-5" />
              </button>
              <button
                aria-label="Collapse navigation"
                className="hidden h-11 w-11 items-center justify-center rounded-xl bg-white text-forest shadow-sm ring-1 ring-forest/10 lg:inline-flex"
                onClick={() => setDesktopCollapsed((current) => !current)}
                type="button"
              >
                <PanelLeftClose className="h-5 w-5" />
              </button>
              {/* Shown on every screen except the ones the sidebar links
                  straight to — those have nothing above them. */}
              <BackButton rootPaths={rootPaths} />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-agriculture">{portalLabel}</p>
                <p className="text-sm font-semibold text-muted">Dashboard workspace</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasPermission(PERMISSIONS.NOTIFICATIONS_READ) ? <NotificationBell /> : null}
              <ProfileMenu />
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 print:p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
