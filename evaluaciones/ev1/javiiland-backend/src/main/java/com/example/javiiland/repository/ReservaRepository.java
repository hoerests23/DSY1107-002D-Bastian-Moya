package com.example.javiiland.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.javiiland.model.Reserva;
import com.example.javiiland.model.ReservaStatus;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {
 
    boolean existsByFechaReservaAndEstatus(LocalDate date, ReservaStatus status);
 
    List<Reserva> findByFechaReservaBetweenAndEstatus(LocalDate start, LocalDate end, ReservaStatus status);
 
    List<Reserva> findByUsuarioId(Long userId);
}
 