import { useAuth } from "./useAuth";

export default function PermissionGuard({
  permission,
  children,
  fallback = null,
  loadingFallback = null,
}) {
  const { hasPermission, initializing } = useAuth();

  if (initializing) {
    return loadingFallback;
  }

  if (!hasPermission(permission)) {
    return fallback;
  }

  return children;
}

