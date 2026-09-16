import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { TOKEN_STORAGE_KEY } from '../api/axiosClient'
import { usuarioService } from '../api/usuarioService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  // Mientras se valida un token existente contra el backend al montar la app.
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!token) {
      setCargando(false)
      return
    }

    // El usuario NUNCA se lee de localStorage: solo se persiste el token,
    // y el usuario siempre se pide fresco al backend (/api/usuarios/me).
    usuarioService
      .me()
      .then(setUsuario)
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        setUsuario(null)
      })
      .finally(() => setCargando(false))
  }, [])

  async function login(loginRequestDto) {
    const { token, usuario: usuarioResponse } = await usuarioService.login(loginRequestDto)
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
    setUsuario(usuarioResponse)
    return usuarioResponse
  }

  async function registrar(registroUsuarioDto) {
    const { token, usuario: usuarioResponse } = await usuarioService.registrar(registroUsuarioDto)
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
    setUsuario(usuarioResponse)
    return usuarioResponse
  }

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setUsuario(null)
  }

  const value = useMemo(
    () => ({
      usuario,
      isAuthenticated: Boolean(usuario),
      isAdmin: usuario?.role === 'ADMIN',
      cargando,
      login,
      registrar,
      logout,
    }),
    [usuario, cargando]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
