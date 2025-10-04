package com.example.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // ✅ Habilitar CORS (usa la configuración de CorsConfig.java)
            .cors()
            .and()
            // ❌ Desactivar CSRF en API REST
            .csrf().disable()
            // Solo HTTPS (redirige HTTP a HTTPS en producción)
            .requiresChannel(channel -> channel.anyRequest().requiresSecure())
            .authorizeHttpRequests(auth -> auth
                // Endpoints públicos o protegidos
                .requestMatchers("/public/**").permitAll() // 👈 acceso libre
                .requestMatchers("/service/**").hasAuthority("SCOPE_service.read")
                .requestMatchers("/user/**").hasAuthority("SCOPE_user.read")
                .anyRequest().authenticated()
            )
            // ✅ Configuración de validación de tokens JWT con Keycloak
            .oauth2ResourceServer(oauth2 -> oauth2.jwt());

        return http.build();
    }
}
