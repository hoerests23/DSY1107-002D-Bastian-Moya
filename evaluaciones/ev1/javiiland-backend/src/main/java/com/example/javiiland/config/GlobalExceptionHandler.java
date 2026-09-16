package com.example.javiiland.config;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import lombok.extern.slf4j.Slf4j;

/**
 * Antes cada excepción se serializaba con el formato por defecto de Spring
 * (inconsistente entre validación, ResponseStatusException y errores de
 * autorización). Este advice centraliza todo en un solo formato:
 * { timestamp, status, error, message, errors? }.
 * El frontend (axiosClient.extractErrorMessage) ya sabe leer "message" y
 * "errors[].defaultMessage", así que no requiere cambios.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatus(ResponseStatusException ex) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        return ResponseEntity.status(status).body(cuerpoBase(status, ex.getReason()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidacion(MethodArgumentNotValidException ex) {
        List<Map<String, String>> errores = ex.getBindingResult().getFieldErrors().stream()
                .map(this::aErrorDeCampo)
                .toList();

        Map<String, Object> body = cuerpoBase(HttpStatus.BAD_REQUEST, "Hay datos inválidos en la solicitud");
        body.put("errors", errores);
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccesoDenegado(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(cuerpoBase(HttpStatus.FORBIDDEN, "No tienes permisos para realizar esta acción"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenerico(Exception ex) {
        log.error("Error inesperado no controlado", ex);
        return ResponseEntity.internalServerError()
                .body(cuerpoBase(HttpStatus.INTERNAL_SERVER_ERROR, "Ocurrió un error inesperado. Intenta de nuevo."));
    }

    private Map<String, String> aErrorDeCampo(FieldError error) {
        Map<String, String> map = new LinkedHashMap<>();
        map.put("field", error.getField());
        map.put("defaultMessage", error.getDefaultMessage());
        return map;
    }

    private Map<String, Object> cuerpoBase(HttpStatus status, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        return body;
    }
}
