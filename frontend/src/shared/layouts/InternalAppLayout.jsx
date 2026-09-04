import { useMemo, useState } from "react";
import { ChevronDown, KeyRound, LogOut, Menu, PanelLeftClose, UserCircle, X } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import logo from "../../assets/KN_AGRO_LOGO.png";
import { useAuth } from "../../core/auth";
import { NotificationBell } from "../../features/notifications";
import { PERMISSIONS, ROLE_LABELS, ROUTES } from "../constants";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "KN";

function NavigationItems({ collapsed = false, items, onNavigate }) {
  const { hasPermission } = useAuth();
  const visibleItems = useMemo(
    () => items.filter((item) => !item.permission || hasPermission(item.permission)),
    [hasPermission, items],
  );

  return (
    <nav className="space-y-1" aria-label="Portal navigation">
      {visibleItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            className={({ isActive }) =>
              `flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold transition ${
                isActive ? "bg-forest text-white shadow-soft" : "text-muted hover:bg-mint hover:text-forest"
              }`
            }
            key={item.route}
            onClick={onNavigate}
            to={item.route}
            title={collapsed ? item.label : undefined}
          >
            {Icon ? <Icon className="h-5 w-5 shrink-0" /> : null}
            <span className={collapsed ? "sr-only" : ""}>{item.label}</span>
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
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest text-sm font-black text-white">
          {getInitials(displayName)}
        </span>
        <span className="hidden min-w-0 md:block">
          <span className="block max-w-44 truncate text-sm font-bold text-ink">{displayName}</span>
          <span className="block max-w-44 truncate text-xs font-semibold text-muted">{roleLabel}</span>
        </span>
        <ChevronDown className="hidden h-4 w-4 text-soft md:block" />
      </button>

      {open ? (
        <div
          className="absolute right-0 z-40 mt-2 w-72 rounded-2xl border border-forest/10 bg-white p-2 shadow-card"
          role="menu"
        >
          <div className="border-b border-forest/10 px-3 py-3">
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
  const desktopSidebarClass = desktopCollapsed ? "lg:w-24" : "lg:w-72";
  const desktopContentClass = desktopCollapsed ? "lg:pl-24" : "lg:pl-72";

  return (
    <div className="min-h-screen bg-ivory text-ink">
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
