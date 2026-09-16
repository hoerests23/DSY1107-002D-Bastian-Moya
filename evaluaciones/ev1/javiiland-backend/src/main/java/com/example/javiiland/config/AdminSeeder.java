package com.example.javiiland.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.javiiland.model.Role;
import com.example.javiiland.model.Usuario;
import com.example.javiiland.repository.UsuarioRepository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class AdminSeeder implements ApplicationRunner {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private final String adminUsername;
    private final String adminPassword;
    private final String adminEmail;

    public AdminSeeder(
            UsuarioRepository usuarioRepository,
            @Value("${javiiland.admin.username}") String adminUsername,
            @Value("${javiiland.admin.password}") String adminPassword,
            @Value("${javiiland.admin.email}") String adminEmail) {
        this.usuarioRepository = usuarioRepository;
        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
        this.adminEmail = adminEmail;
    }

    @Override
    public void run(ApplicationArguments args) {
        boolean existeAdmin = usuarioRepository.findAll().stream()
                .anyMatch(usuario -> usuario.getRole() == Role.ADMIN);
        if (existeAdmin) {
            return;
        }

        Usuario admin = Usuario.builder()
                .username(adminUsername)
                .password(passwordEncoder.encode(adminPassword))
                .email(adminEmail)
                .nombre("Javiiland")
                .role(Role.ADMIN)
                .build();
        usuarioRepository.save(admin);
        log.warn("usuario ADMIN por defecto creado",
                adminUsername);
    }
}
