package com.example.javiiland.model.dto;

import com.example.javiiland.model.ReservaStatus;
import com.example.javiiland.model.TipoReserva;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
 
import java.time.LocalDate;
import java.time.LocalDateTime;
 
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservaResponseDto {
    private Long id;
    private LocalDate fechaReserva;
    private String nombreEvento;
    private String descripcion;
    private ReservaStatus status;
    private TipoReserva tipo;
    private Long usuarioId;
    private String nombreUsuario;
    private LocalDateTime creadoEn;
    private LocalDateTime actualizadoEn;
}
 