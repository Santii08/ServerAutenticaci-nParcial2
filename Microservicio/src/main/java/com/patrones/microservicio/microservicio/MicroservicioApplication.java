package com.patrones.microservicio.microservicio;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.patrones.microservicio.microservicio.service.ApiClientService;

import java.time.LocalDateTime;
import java.util.Scanner;

@SpringBootApplication
public class MicroservicioApplication {

    public static void main(String[] args) {
        SpringApplication.run(MicroservicioApplication.class, args);
    }

    @Bean
    CommandLineRunner run(ApiClientService apiClientService) {
        return args -> {
            Scanner scanner = new Scanner(System.in);

            System.out.println("🟢 Microservicio cargado correctamente.");
            System.out.println("📅 " + LocalDateTime.now());
            System.out.println("⚙️  Esperando confirmación del usuario para iniciar el servicio...");
            System.out.println("👉 Presiona [ENTER] para iniciar el flujo del microservicio.");

            // Espera confirmación inicial
            scanner.nextLine();

            System.out.println("\n🚀 Servicio iniciado. Listo para solicitar token y acceder a la API protegida.");

            while (true) {
                System.out.println("\nPresiona [ENTER] para solicitar token o escribe 'exit' para salir:");
                String input = scanner.nextLine().trim();

                if ("exit".equalsIgnoreCase(input)) {
                    System.out.println("👋 Saliendo del microservicio...");
                    break;
                }

                try {
                    System.out.println("\n🔐 Solicitando token y accediendo a la API...");
                    String data = apiClientService.getProtectedData();
                    System.out.println("\n✅ [OK] Respuesta de la API protegida:");
                    System.out.println("────────────────────────────────────────────");
                    System.out.println(data);
                    System.out.println("────────────────────────────────────────────");
                } catch (Exception e) {
                    System.err.println("\n❌ [ERROR] No se pudo acceder a la API: " + e.getMessage());
                    e.printStackTrace(System.err);
                }
            }

            scanner.close();
        };
    }
}
