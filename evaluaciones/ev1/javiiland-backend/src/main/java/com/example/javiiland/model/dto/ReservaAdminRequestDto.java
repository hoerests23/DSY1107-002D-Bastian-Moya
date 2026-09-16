package com.example.javiiland.model.dto;

import java.time.LocalDate;

import com.example.javiiland.model.TipoReserva;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Solo lo usa un ADMIN (ver ReservaController#crearComoAdmin).
 * A diferencia de ReservaRequestDto (autoservicio del cliente), aquí:
 * - usuarioId es opcional: si se omite, la reserva queda a nombre del propio
 *   admin (caso típico: bloquear un día sin un cliente real, mantención, etc.).
 * - no exige fecha futura: el admin puede corregir un registro histórico.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReservaAdminRequestDto {

    @NotNull(message = "La fecha de reserva es obligatoria")
    private LocalDate reservationDate;

    @NotBlank(message = "El nombre del evento es obligatorio")
    private String eventName;

    private String description;

    /** Opcional: reservar a nombre de un cliente real (ej. reserva por teléfono). */
    private Long usuarioId;

    /** Opcional: si se omite, se infiere BLOQUEO sin usuarioId y CLIENTE con usuarioId. */
    private TipoReserva tipo;
}
