package com.example.javiiland.model.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
 
import java.time.LocalDate;
 
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReservaRequestDto {
 
    @NotNull(message = "La fecha de reserva es obligatoria")
    @FutureOrPresent(message = "La fecha debe ser hoy o en el futuro")
    private LocalDate reservationDate;
 
    @NotBlank(message = "El nombre del evento es obligatorio")
    private String eventName;
 
    private String description;
}
 
