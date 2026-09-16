import axios from 'axios'
import { msalInstance } from '../context/AuthProvider'
import { apiScopes } from '../context/msalConfig'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
export const TOKEN_STORAGE_KEY = 'javiiland_token'

export const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})


//Pide token de azure si no hay JWT local
axiosClient.interceptors.request.use(async (config) => {
  const localToken = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (localToken) {
    config.headers.Authorization = `Bearer ${localToken}`
    return config
  }

  // No hay sesión local (usuario público): si hay una cuenta de Azure AD
  // activa (staff/admin), usamos su token en vez del JWT propio.
  const account = msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0]
  if (account) {
    try {
      const result = await msalInstance.acquireTokenSilent({
        account,
        scopes: apiScopes,
      })
      config.headers.Authorization = `Bearer ${result.accessToken}`
    } catch (err) {
      console.error('No se pudo obtener token de Azure AD:', err)
    }
  }

  return config
})

// Si el token expiró o es inválido, el backend responde 401: limpiamos la
// sesión local para que la UI vuelva a pedir login (evita quedar "logueado"
// en la UI con un token muerto).
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    }
    return Promise.reject(error)
  }
)

/**
 * Traduce errores de axios/Spring a un mensaje legible para el usuario.
 * Cubre tanto el formato clásico de Spring Boot (errors[].defaultMessage)
 * como un mensaje simple en el cuerpo.
 */
export function extractErrorMessage(error, fallback = 'Ocurrió un error inesperado. Intenta de nuevo.') {
  if (!error?.response) {
    return 'No se pudo contactar al servidor. Verifica que el backend esté corriendo.'
  }

  const { data } = error.response

  if (!data) return fallback

  if (typeof data === 'string') return data

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors
      .map((e) => e.defaultMessage || e.message || JSON.stringify(e))
      .join(' ')
  }

  if (data.message) return data.message
  if (data.error) return data.error

  return fallback
}
