# ---- Etapa 1: Build ----
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app

# Copiar el archivo de dependencias y descargar dependencias
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiar el código fuente y compilar
COPY src ./src
RUN mvn clean package -DskipTests

# ---- Etapa 2: Runtime ----
FROM eclipse-temurin:21-jdk-jammy
WORKDIR /app

# 🔐 Copiar el certificado público de la API HTTPS
COPY src/main/resources/certs/api.crt /usr/local/share/ca-certificates/api.crt

# 🧩 Importar el certificado al truststore de Java
RUN keytool -importcert -noprompt \
    -trustcacerts \
    -alias api-cert \
    -file /usr/local/share/ca-certificates/api.crt \
    -keystore $JAVA_HOME/lib/security/cacerts \
    -storepass changeit

# 📦 Copiar el JAR compilado desde la etapa anterior
COPY --from=builder /app/target/*.jar app.jar

# ⚙️ Variables de entorno
ENV SERVER_PORT=8082
ENV KEYCLOAK_TOKEN_URI=http://keycloak:8080/realms/parcial-realm/protocol/openid-connect/token
ENV KEYCLOAK_CLIENT_ID=service-client
ENV KEYCLOAK_CLIENT_SECRET=EK3YHkuGg7c9djjBYopwyddobcAbDgHn
ENV KEYCLOAK_SCOPE=service.read
ENV API_PROTECTED_URL=https://api-server:8443/client/data

# 🔊 Exponer el puerto
EXPOSE 8082

# 🚀 Ejecutar el microservicio
ENTRYPOINT ["java", "-jar", "app.jar"]
