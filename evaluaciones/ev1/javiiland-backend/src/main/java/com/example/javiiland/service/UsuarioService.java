package com.example.javiiland.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.javiiland.model.Role;
import com.example.javiiland.model.Usuario;
import com.example.javiiland.model.dto.LoginRequestDto;
import com.example.javiiland.model.dto.LoginResponseDto;
import com.example.javiiland.model.dto.RegistroUsuarioDto;
import com.example.javiiland.model.dto.UsuarioResponseDto;
import com.example.javiiland.repository.UsuarioRepository;
import com.example.javiiland.security.JwtService;

@Service
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UsuarioService(UsuarioRepository usuarioRepository, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.jwtService = jwtService;
    }

    @Transactional
    public LoginResponseDto registrar(RegistroUsuarioDto request) {
        if (usuarioRepository.existsByUsername(request.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El username ya existe");
        }
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El email ya existe");
        }

        Usuario usuario = Usuario.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .nombre(request.getFullName())
                .role(Role.USER)
                .build();
        usuario = usuarioRepository.save(usuario);
        return toLoginResponse(usuario);
    }

    @Transactional(readOnly = true)
    public LoginResponseDto login(LoginRequestDto request) {
        Usuario usuario = usuarioRepository.findByUsername(request.getUsername())
                .filter(found -> passwordEncoder.matches(request.getPassword(), found.getPassword()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas"));
        return toLoginResponse(usuario);
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDto obtenerActual(Long usuarioId) {
        return buscarPorId(usuarioId);
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDto buscarPorId(Long id) {
        return toResponse(usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado")));
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponseDto> listar() {
        return usuarioRepository.findAll().stream().map(this::toResponse).toList();
    }

    private UsuarioResponseDto toResponse(Usuario usuario) {
        return UsuarioResponseDto.builder()
                .id(usuario.getId())
                .username(usuario.getUsername())
                .email(usuario.getEmail())
                .fullName(usuario.getNombre())
                .role(usuario.getRole())
                .build();
    }

    private LoginResponseDto toLoginResponse(Usuario usuario) {
        return LoginResponseDto.builder()
                .token(jwtService.generarToken(usuario))
                .usuario(toResponse(usuario))
                .build();
    }
}