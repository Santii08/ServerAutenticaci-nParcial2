// keycloak.js
import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8080/",
  realm: "parcial-realm",
  clientId: "web-client",
});

export const initKeycloak = () => {
  return keycloak
    .init({
      onLoad: "login-required",
      checkLoginIframe: false,
      redirectUri: "http://localhost:3000/",
    })
    .then((authenticated) => {
      console.log("🔐 Keycloak authenticated:", authenticated);
      return authenticated;
    })
    .catch((error) => {
      console.error("❌ Error al iniciar Keycloak:", error);
      return false;
    });
};

export default keycloak;
