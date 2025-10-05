import express from "express";
import https from "https";
import fs from "fs";
import jwt from "express-jwt";
import jwksRsa from "jwks-rsa";
import cors from "cors";

// --- Configuración HTTPS ---
const app = express();
const PORT = 8443;

const httpsOptions = {
  key: fs.readFileSync("./certs/localhost-key.pem"),
  cert: fs.readFileSync("./certs/localhost.pem"),
};

// --- Configuración CORS ---
app.use(cors({
  origin: ["https://localhost:3000"], // frontend
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type"],
  credentials: true
}));

// --- Middleware JWT para validar tokens de Keycloak ---
const jwtCheck = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksUri: "http://localhost:8080/realms/parcial-realm/protocol/openid-connect/certs"
  }),
  audience: "account", // depende de tu cliente Keycloak
  issuer: "http://localhost:8080/realms/parcial-realm",
  algorithms: ["RS256"]
});

// --- Endpoints ---
// Public endpoint
app.get("/public/info", (req, res) => {
  res.json({ message: "Endpoint público, acceso libre" });
});

// Endpoint protegido por JWT (simula /user/**)
app.get("/user/profile", jwtCheck, (req, res) => {
  res.json({ user: "John Doe", email: "john@example.com" });
});

// Endpoint protegido por JWT (simula /service/**)
app.get("/service/data", jwtCheck, (req, res) => {
  res.json({ data: "Datos sensibles de servicios" });
});

// --- Iniciar servidor HTTPS ---
https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`API HTTPS corriendo en https://localhost:${PORT}`);
});
