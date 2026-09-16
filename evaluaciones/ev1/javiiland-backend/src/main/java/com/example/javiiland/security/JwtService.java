package com.example.javiiland.security;

import java.time.Instant;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.example.javiiland.model.Usuario;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

/**
 * Genera los JWT que consume el frontend tras login/registro.
 * Usa el mismo secreto HMAC que SecurityConfig usa para decodificarlos
 * (perfil local; en producción esto lo emitiría el IdP real: Azure AD/Cognito).
 */
@Component
public class JwtService {

    private final String jwtSecret;
    private final long expirationMinutes;

    public JwtService(
            @Value("${javiiland.security.jwt-secret}") String jwtSecret,
            @Value("${javiiland.security.jwt-expiration-minutes:480}") long expirationMinutes) {
        this.jwtSecret = jwtSecret;
        this.expirationMinutes = expirationMinutes;
    }

    public String generarToken(Usuario usuario) {
        try {
            Instant ahora = Instant.now();
            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .subject(usuario.getUsername())
                    .claim("userId", usuario.getId())
                    .claim("roles", List.of(usuario.getRole().name()))
                    .issueTime(Date.from(ahora))
                    .expirationTime(Date.from(ahora.plusSeconds(expirationMinutes * 60)))
                    .build();

            SignedJWT signedJWT = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claims);
            signedJWT.sign(new MACSigner(jwtSecret.getBytes()));
            return signedJWT.serialize();
        } catch (JOSEException e) {
            throw new IllegalStateException("No se pudo generar el token JWT", e);
        }
    }
}
