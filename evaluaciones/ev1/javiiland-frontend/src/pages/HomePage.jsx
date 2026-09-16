import { useNavigate } from 'react-router-dom'
import CalendarioMensual from '../components/CalendarioMensual'
import { useIsAuthenticated as useMsalAuthenticated } from '@azure/msal-react'
import { useAuth } from '../context/AuthContext'

export default function HomePage() {
  const { isAuthenticated: isAuthLocal } = useAuth()
  const isMsalAuthenticated = useMsalAuthenticated()
  const navigate = useNavigate()

  function handleSelectDay(iso) {
    if (isMsalAuthenticated) {
      navigate('/admin')
      return
    }
    if (isAuthLocal) {
        navigate(`/reservar?fecha=${iso}`)
      } else {
        navigate('/ingresar', { state: { message: 'Ingresa a tu cuenta para reservar una fecha.' } })
      }
  }

  return (
    <div className="page">
      <section className="hero">
        <div className="hero__text">
          <h1>
            Fiestas infantiles,
            <br />
            un día a la vez.
          </h1>
          <p>
            Revisa qué fechas están libres en Javiiland y reserva el espacio para el cumpleaños,
            la posada o el evento escolar que estás organizando. El calendario es público: cualquiera
            puede ver la disponibilidad, pero solo las cuentas registradas pueden apartar un día.
          </p>
          {!isAuthLocal && !isMsalAuthenticated && (
            <div className="hero__cta">
              <button className="btn btn--primary" onClick={() => navigate('/registro')}>
                Crear cuenta
              </button>
              <button className="btn btn--ghost" onClick={() => navigate('/ingresar')}>
                Ya tengo cuenta
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="page__section">
        <CalendarioMensual onSelectDay={handleSelectDay} />
      </section>
    </div>
  )
}
