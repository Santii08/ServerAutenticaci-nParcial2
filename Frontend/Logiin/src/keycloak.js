// src/keycloak.js
import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8081/auth",
  realm: "parcial-realm",
  clientId: "web-client",
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
