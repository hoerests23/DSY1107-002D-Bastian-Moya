package com.example.javiiland.config;

import java.util.List;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtDecoders;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${javiiland.security.jwt-secret}")
    private String jwtSecret;

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String azureIssuerUri;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http,
            JwtAuthenticationConverter jwtAuthenticationConverter) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/usuarios/registro", "/api/usuarios/login",
                                "/api/reservas/calendario").permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter)));

        return http.build();
    }

    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter localAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        localAuthoritiesConverter.setAuthoritiesClaimName("roles");
        localAuthoritiesConverter.setAuthorityPrefix("ROLE_");
    
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            String issuer = jwt.getIssuer() != null ? jwt.getIssuer().toString() : "";
    
            // Cualquier token válido emitido por Azure AD es de staff interno
            // (nadie más tiene cuenta en ese tenant) -> se trata como ADMIN.
            if (issuer.contains("login.microsoftonline.com") || issuer.contains("sts.windows.net")) {
                return List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
            }
    
            // Token local (HMAC): sigue leyendo el claim "roles" como antes.
            return localAuthoritiesConverter.convert(jwt);
        });
        return converter;
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of(
            "http://localhost:4200", 
            "http://localhost:5173", 
            "http://*.s3-website-*.amazonaws.com", 
            "http://*.s3-website.*.amazonaws.com"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Decoder compuesto: acepta tokens locales (usuarios normales, HMAC/HS256)
     * y tokens de Azure AD (staff/admin, RS256 vía JWKS).
     * Intenta primero el local (más rápido, sin llamada de red); si falla,
     * intenta con Azure.
     */
    @Bean
    JwtDecoder jwtDecoder() {
        SecretKey secretKey = new SecretKeySpec(jwtSecret.getBytes(), "HmacSHA256");
        JwtDecoder localDecoder = NimbusJwtDecoder.withSecretKey(secretKey)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();

        JwtDecoder azureDecoder = JwtDecoders.fromIssuerLocation(azureIssuerUri);

        return token -> {
            try {
                return localDecoder.decode(token);
            } catch (JwtException localEx) {
                try {
                    return azureDecoder.decode(token);
                } catch (JwtException azureEx) {
                    throw azureEx;
                }
            }
        };
    }
}