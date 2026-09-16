import { Navigate, useLocation } from 'react-router-dom';
import { useIsAuthenticated as useMsalAuthenticated } from '@azure/msal-react';
import { useAuth } from '../context/AuthContext'; // Asegúrate de que esta ruta apunte a tu AuthContext

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  inlineAuthNotice = false,
}) {
  const { isAuthenticated, isAdmin: isAdminLocal, cargando, login } = useAuth();
  const isMsalAuthenticated = useMsalAuthenticated();
  const location = useLocation();

  // Staff/admin puede entrar por Azure AD sin pasar por el AuthContext local.
  const isAdmin = isAdminLocal || isMsalAuthenticated;
  const isAnyAuthenticated = isAuthenticated || isMsalAuthenticated;

  if (cargando) {
    return null;
  }

  if (!isAnyAuthenticated) {
    if (inlineAuthNotice) {
      return (
        <section>
          <p>Debes iniciar sesión para acceder a este contenido.</p>
          <button type="button" onClick={() => login?.()}>
            Iniciar sesión
          </button>
        </section>
      );
    }
    return <Navigate to="/ingresar" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}