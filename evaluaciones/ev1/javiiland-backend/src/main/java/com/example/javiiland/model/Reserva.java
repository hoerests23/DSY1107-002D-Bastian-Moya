package com.example.javiiland.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "reservas")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class Reserva {
   @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    /**
     * OJO: la unicidad de "un evento por día" NO se fuerza a nivel de columna
     * (unique constraint), porque una reserva CANCELLED debe liberar la fecha
     * para que otra pueda tomarla. La regla se valida en ReservationService.
     */
    @Column(name = "fecha_reserva", nullable = false)
    private LocalDate fechaReserva;
 
    @Column(name = "nombre_evento", nullable = false)
    private String nombreEvento;
 
    @Column(length = 500)
    private String descripcion;
 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ReservaStatus estatus = ReservaStatus.CONFIRMED;

    /**
     * CLIENTE (default) para reservas normales, BLOQUEO cuando el admin
     * ocupa el día sin un cliente real detrás (ver TipoReserva).
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TipoReserva tipo = TipoReserva.CLIENTE;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = true)
    private Usuario usuario;
 
    @Column(name = "creada_en", updatable = false)
    private LocalDateTime creadaEn;
 
    @Column(name = "actualizada_en")
    private LocalDateTime actualizadaEn;
 
    @PrePersist
    protected void onCreate() {
        this.creadaEn = LocalDateTime.now();
        this.actualizadaEn = LocalDateTime.now();
    }
 
    @PreUpdate
    protected void onUpdate() {
        this.actualizadaEn = LocalDateTime.now();
    }
}
