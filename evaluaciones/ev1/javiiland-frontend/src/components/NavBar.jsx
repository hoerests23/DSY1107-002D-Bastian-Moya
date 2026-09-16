import { NavLink, useNavigate } from 'react-router-dom'
import { useIsAuthenticated as useMsalAuthenticated, useMsal } from '@azure/msal-react'
import { useAuth } from '../context/AuthContext'

export default function NavBar() {
  const { usuario, isAuthenticated: isAuthLocal, isAdmin: isAdminLocal, logout } = useAuth()
  const { instance, accounts } = useMsal()
  const isMsalAuthenticated = useMsalAuthenticated()
  const navigate = useNavigate()

  const isAuthenticated = isAuthLocal || isMsalAuthenticated
  const isAdmin = isAdminLocal || isMsalAuthenticated
  const displayName = isMsalAuthenticated
    ? accounts[0]?.name || accounts[0]?.username
    : usuario?.fullName || usuario?.username

  function handleLogout() {
    if (isMsalAuthenticated) {
      instance.logoutRedirect()
      return
    }
    logout()
    navigate('/')
  }

  return (
    <header className="nav">
      <div className="nav__inner">
        <NavLink to="/" className="nav__brand">
          <span className="nav__brand-mark" aria-hidden="true">
            <svg viewBox="0 0 48 48" width="28" height="28">
              <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="3" />
              <path d="M14 26c2-8 6-12 10-12s8 4 10 12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <circle cx="24" cy="30" r="2.5" fill="currentColor" />
            </svg>
          </span>
          Javiiland
        </NavLink>

        <nav className="nav__links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav__link nav__link--active' : 'nav__link')}>
            Calendario
          </NavLink>
          {isAuthLocal && (
            <NavLink to="/reservar" className={({ isActive }) => (isActive ? 'nav__link nav__link--active' : 'nav__link')}>
              Reservar
            </NavLink>
          )}
          {isAuthLocal && (
            <NavLink to="/mis-reservas" className={({ isActive }) => (isActive ? 'nav__link nav__link--active' : 'nav__link')}>
              Mis reservas
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => (isActive ? 'nav__link nav__link--active' : 'nav__link')}>
              Panel admin
            </NavLink>
          )}
        </nav>

        <div className="nav__auth">
          {isAuthenticated ? (
            <>
              <span className="nav__user">
                {displayName}
                {isAdmin && <span className="badge badge--admin">admin</span>}
              </span>
              <button className="btn btn--ghost" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <NavLink to="/ingresar" className="btn btn--ghost">
                Ingresar
              </NavLink>
              <NavLink to="/registro" className="btn btn--primary">
                Crear cuenta
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  )
}