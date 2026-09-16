package com.example.javiiland.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Representa un día del calendario público. No expone datos sensibles
 * de la reserva (ni el nombre del evento ni quién la hizo), solo si
 * el día está disponible.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalendarioDto {
   private LocalDate date;
   private boolean available;
}