package com.example.javiiland.model.dto;

import com.example.javiiland.model.ReservaStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
 
import java.time.LocalDate;
 
/**
 * Todos los campos son opcionales: solo se actualiza lo que venga distinto de null.
 * Solo un ADMIN puede usar este DTO (ver ReservationService.updateReservation).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReservaUpdateDto {
    private LocalDate reservationDate;
    private String eventName;
    private String description;
    private ReservaStatus status;
}
 