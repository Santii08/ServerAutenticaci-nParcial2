package com.patrones.microservicio.microservicio.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class KeycloakService {

    private final WebClient webClient;

    @Value("${keycloak.token-uri}")
    private String tokenUri;

    @Value("${keycloak.client-id}")
    private String clientId;

    @Value("${keycloak.client-secret}")
    private String clientSecret;

    @Value("${keycloak.scope}")
    private String scope;

    public KeycloakService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String getAccessToken() {
        System.out.println("🔹 [KeycloakService] Solicitando token a: " + tokenUri);
        System.out.println("   -> client_id: " + clientId);
        System.out.println("   -> scope: " + scope);

        try {
            String response = webClient.post()
                    .uri(tokenUri)
                    .body(BodyInserters.fromFormData("grant_type", "client_credentials")
                            .with("client_id", clientId)
                            .with("client_secret", clientSecret)
                            .with("scope", scope))
                    .retrieve()
                    .bodyToMono(String.class)
                    .doOnNext(resp -> System.out.println("✅ [KeycloakService] Respuesta completa de Keycloak: " + resp))
                    .block();

            return response;
        } catch (Exception e) {
            System.err.println("❌ [KeycloakService] Error obteniendo token: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
