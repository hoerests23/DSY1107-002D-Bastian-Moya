import { axiosClient } from './axiosClient'

/**
 * Refleja ReservaController.java (/api/reservas)
 */
export const reservaService = {
  // Autoservicio: el usuario dueño lo determina el backend a partir del JWT.
  crear: (reservaRequestDto) => axiosClient.post('/api/reservas', reservaRequestDto).then((res) => res.data),

  // Solo ADMIN: crear a nombre de un cliente real o bloquear un día sin cliente.
  crearComoAdmin: (reservaAdminRequestDto) =>
    axiosClient.post('/api/reservas/admin', reservaAdminRequestDto).then((res) => res.data),

  listar: () => axiosClient.get('/api/reservas').then((res) => res.data),

  listarPorUsuario: (usuarioId) =>
    axiosClient.get(`/api/reservas/usuario/${usuarioId}`).then((res) => res.data),

  calendario: (inicio, fin) =>
    axiosClient
      .get('/api/reservas/calendario', { params: { inicio, fin } })
      .then((res) => res.data),

  buscarPorId: (id) => axiosClient.get(`/api/reservas/${id}`).then((res) => res.data),

  actualizar: (id, reservaUpdateDto) =>
    axiosClient.put(`/api/reservas/${id}`, reservaUpdateDto).then((res) => res.data),

  // Soft-delete: libera la fecha pero conserva el historial.
  cancelar: (id) => axiosClient.delete(`/api/reservas/${id}`).then((res) => res.data),

  // Solo ADMIN: borrado real, para limpiar bloqueos vencidos o errores.
  eliminarDefinitivo: (id) => axiosClient.delete(`/api/reservas/${id}/definitivo`),
}

