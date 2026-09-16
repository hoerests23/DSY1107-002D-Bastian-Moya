package com.example.javiiland.model;

/**
 * CLIENTE: reserva real hecha por (o a nombre de) un usuario.
 * BLOQUEO: el admin deja un día no disponible sin un cliente detrás
 * (mantención, uso personal, error a corregir, etc.). Ocupa el calendario
 * igual que una reserva CLIENTE, pero se distingue en el panel de admin.
 */
public enum TipoReserva {
    CLIENTE,
    BLOQUEO
}
