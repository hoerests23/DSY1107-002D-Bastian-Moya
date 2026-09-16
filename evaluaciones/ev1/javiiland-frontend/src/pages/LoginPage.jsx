import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { extractErrorMessage } from '../api/axiosClient'
import { useAuth as useMsalAuth } from '../context/useAuth'

export default function LoginPage() {
  const { login } = useAuth()
  const { login: loginStaff } = useMsalAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const infoMessage = location.state?.message
  const redirectTo = location.state?.from?.pathname || '/'

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(form)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(extractErrorMessage(err, 'Usuario o contraseña incorrectos.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page page--narrow">
      <div className="auth-card">
        <h1>Ingresar</h1>
        <p className="auth-card__subtitle">Ingresa con tu cuenta para reservar una fecha.</p>

        {infoMessage && <p className="form-info">{infoMessage}</p>}
        {error && <p className="form-error">{error}</p>}

        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <span>Usuario</span>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </label>

          <label className="field">
            <span>Contraseña</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </label>

          <button className="btn btn--primary btn--block" type="submit" disabled={submitting}>
            {submitting ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <p className="auth-card__footer">
          ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
        </p>
        <p className="auth-card__staff-link">
        <button
          type="button"
          onClick={() => loginStaff()}
          style={{
            background: 'none',
            border: 'none',
            color: '#999',
            fontSize: '0.70rem',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0,
          }}
        >
          Acceso
        </button>
      </p>
      </div>
    </div>
  )
}
