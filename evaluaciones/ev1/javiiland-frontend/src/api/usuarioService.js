import { axiosClient } from './axiosClient'

/**
 * Refleja UsuarioController.java (/api/usuarios)
 */
export const usuarioService = {
  registrar: (registroUsuarioDto) =>
    axiosClient.post('/api/usuarios/registro', registroUsuarioDto).then((res) => res.data),

  login: (loginRequestDto) =>
    axiosClient.post('/api/usuarios/login', loginRequestDto).then((res) => res.data),

  // Fuente de verdad del usuario autenticado: se pide siempre al backend
  // a partir del JWT guardado, nunca se confía en un objeto persistido.
  me: () => axiosClient.get('/api/usuarios/me').then((res) => res.data),

  listar: () => axiosClient.get('/api/usuarios').then((res) => res.data),

  buscarPorId: (id) => axiosClient.get(`/api/usuarios/${id}`).then((res) => res.data),
}
