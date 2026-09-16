package com.example.javiiland.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.javiiland.model.dto.LoginRequestDto;
import com.example.javiiland.model.dto.LoginResponseDto;
import com.example.javiiland.model.dto.RegistroUsuarioDto;
import com.example.javiiland.model.dto.UsuarioResponseDto;
import com.example.javiiland.service.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/registro")
    public ResponseEntity<LoginResponseDto> registrar(@Valid @RequestBody RegistroUsuarioDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.registrar(request));
    }

    @PostMapping("/login")
    public LoginResponseDto login(@Valid @RequestBody LoginRequestDto request) {
        return usuarioService.login(request);
    }

    /**
     * Fuente de verdad del usuario autenticado: el frontend SIEMPRE debe
     * pedirlo aquí a partir del JWT en vez de confiar en algo persistido
     * localmente (localStorage, etc.).
     */
    @GetMapping("/me")
    public UsuarioResponseDto usuarioActual(@AuthenticationPrincipal Jwt jwt) {
        Long usuarioId = jwt.getClaim("userId");
        return usuarioService.obtenerActual(usuarioId);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UsuarioResponseDto> listar() {
        return usuarioService.listar();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.claims['userId']")
    public UsuarioResponseDto buscarPorId(@PathVariable Long id) {
        return usuarioService.buscarPorId(id);
    }
}