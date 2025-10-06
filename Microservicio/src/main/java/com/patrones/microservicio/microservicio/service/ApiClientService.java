package com.patrones.microservicio.microservicio.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class ApiClientService {

    private final WebClient webClient;
    private final KeycloakService keycloakService;

    @Value("${api.protected-url}")
    private String apiUrl;

    public ApiClientService(WebClient.Builder webClientBuilder, KeycloakService keycloakService) {
        this.webClient = webClientBuilder.build();
        this.keycloakService = keycloakService;
    }

    public String getProtectedData() {
        System.out.println("🌐 [ApiClientService] Solicitando datos protegidos desde: " + apiUrl);

        try {
            // Obtener token de Keycloak
            String tokenResponse = keycloakService.getAccessToken();
            System.out.println("🔑 [ApiClientService] Token recibido: " + tokenResponse);

            String result = webClient.get()
                    .uri(apiUrl)
                    .header("Authorization", "Bearer " + extractAccessToken(tokenResponse))
                    .retrieve()
                    .bodyToMono(String.class)
                    .doOnNext(resp -> System.out.println("✅ [ApiClientService] Respuesta completa de la API: " + resp))
                    .block();

            return result;

        } catch (Exception e) {
            System.err.println("❌ [ApiClientService] Error accediendo a la API: " + e.getMessage());
            e.printStackTrace();
            return "Error accediendo a la API";
        }
    }

    private String extractAccessToken(String jsonResponse) {
        try {
            int start = jsonResponse.indexOf("\"access_token\":\"") + 16;
            int end = jsonResponse.indexOf("\"", start);
            return jsonResponse.substring(start, end);
        } catch (Exception e) {
            System.err.println("⚠️ [ApiClientService] No se pudo extraer el access_token del JSON");
            return null;
        }
    }
}
