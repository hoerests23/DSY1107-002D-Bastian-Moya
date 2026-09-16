package com.example.javiiland.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.javiiland.model.dto.CalendarioDto;
import com.example.javiiland.model.dto.ReservaAdminRequestDto;
import com.example.javiiland.model.dto.ReservaRequestDto;
import com.example.javiiland.model.dto.ReservaResponseDto;
import com.example.javiiland.model.dto.ReservaUpdateDto;
import com.example.javiiland.service.ReservaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {
    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    /**
     * Autoservicio del cliente: el usuario dueño de la reserva SIEMPRE sale
     * del JWT, nunca de un parámetro que el propio cliente pudiera manipular
     * para reservar "a nombre" de otra persona.
     */
    @PostMapping
    public ResponseEntity<ReservaResponseDto> crear(@AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ReservaRequestDto request) {
        Long usuarioId = jwt.getClaim("userId");
        return ResponseEntity.status(HttpStatus.CREATED).body(reservaService.crear(usuarioId, request));
    }

    /**
     * Solo ADMIN: crear una reserva a nombre de un cliente real (ej. reserva
     * tomada por teléfono) o bloquear un día sin cliente asociado.
     */
    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReservaResponseDto> crearComoAdmin(@AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ReservaAdminRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reservaService.crearComoAdmin(null, request));
    }

    /** Listado completo: solo tiene sentido en el panel de admin. */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<ReservaResponseDto> listar() {
        return reservaService.listar();
    }

    /** Un cliente solo puede ver sus propias reservas; el admin puede ver las de cualquiera. */
    @GetMapping("/usuario/{usuarioId}")
    @PreAuthorize("hasRole('ADMIN') or #usuarioId == authentication.principal.claims['userId']")
    public List<ReservaResponseDto> listarPorUsuario(@PathVariable Long usuarioId) {
        return reservaService.listarPorUsuario(usuarioId);
    }

    /** Público: no expone nombre de evento ni dueño, solo disponibilidad. */
    @GetMapping("/calendario")
    public List<CalendarioDto> calendario(@RequestParam LocalDate inicio, @RequestParam LocalDate fin) {
        return reservaService.calendario(inicio, fin);
    }

    /** Detalle completo (incluye datos del cliente): solo panel de admin. */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ReservaResponseDto buscarPorId(@PathVariable Long id) {
        return reservaService.buscarPorId(id);
    }

    /** Editar fecha/evento/estado de cualquier reserva: solo ADMIN (ver ReservaUpdateDto). */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ReservaResponseDto actualizar(@PathVariable Long id, @Valid @RequestBody ReservaUpdateDto request) {
        return reservaService.actualizar(id, request);
    }

    /** Cancelación (soft-delete): libera la fecha pero conserva el historial. Solo ADMIN. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ReservaResponseDto cancelar(@PathVariable Long id) {
        return reservaService.cancelar(id);
    }

    /** Borrado real: para limpiar bloqueos vencidos o registros creados por error. Solo ADMIN. */
    @DeleteMapping("/{id}/definitivo")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminarDefinitivo(@PathVariable Long id) {
        reservaService.eliminarDefinitivo(id);
        return ResponseEntity.noContent().build();
    }
}
