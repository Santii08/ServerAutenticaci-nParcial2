// src/keycloak.js
import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8080", // URL base del Keycloak
  realm: "parcial-realm", // tu realm
  clientId: "web-client", // el client que creaste en Keycloak
});

let initialized = false;

export const initKeycloak = () => {
  if (!initialized) {
    initialized = true;
    return keycloak.init({ onLoad: "login-required", pkceMethod: "S256" });
  }
  return Promise.resolve(false); // ya inicializado
};

export default keycloak;
