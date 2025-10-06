import React, { useState, useEffect } from "react";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [expiresIn, setExpiresIn] = useState(0); // ⏳ segundos restantes
  const [apiData, setApiData] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // 🔐 Login con grant_type=password
  async function loginWithPassword() {
    const params = new URLSearchParams();
    params.append("grant_type", "password");
    params.append("client_id", "web-client");
    params.append("username", username);
    params.append("password", password);
    params.append("scope", "openid profile email user.read");

    const response = await fetch(
      "http://localhost:8080/realms/parcial-realm/protocol/openid-connect/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      }
    );

    if (!response.ok) {
      alert("Error en el login. Verifica las credenciales.");
      return;
    }

    const data = await response.json();
    console.log("🔑 Access Token:", data.access_token);
    console.log("🔄 Refresh Token:", data.refresh_token);

    setToken(data.access_token);
    setRefreshToken(data.refresh_token);
    setExpiresIn(data.expires_in); // segundos hasta expirar
    setIsLoggedIn(true);
  }

  async function refreshAccessToken() {
    if (!refreshToken) return alert("No hay refresh token disponible.");

    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("client_id", "web-client"); // ✅ CORREGIDO
    params.append("refresh_token", refreshToken);

    const response = await fetch(
      "http://localhost:8080/realms/parcial-realm/protocol/openid-connect/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("Error refresh token:", err);
      alert("Error al refrescar el token. Inicia sesión nuevamente.");
      setIsLoggedIn(false);
      setToken(null);
      setRefreshToken(null);
      setExpiresIn(0);
      return;
    }

    const data = await response.json();
    setToken(data.access_token);
    setRefreshToken(data.refresh_token);
    setExpiresIn(data.expires_in);
    console.log("✅ Nuevo Access Token:", data.access_token);
  }

  // ⏳ Contador del tiempo de vida del token
  useEffect(() => {
    if (!isLoggedIn) return;
    const timer = setInterval(() => {
      setExpiresIn((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isLoggedIn]);

  // 🌐 Llamada protegida a la API
  const callApi = () => {
    if (!token) {
      console.warn("⚠️ No hay token disponible");
      return;
    }

    // 🧹 Limpia antes de la nueva solicitud
    setApiData(null);

    fetch("https://localhost:8443/user/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error en la llamada a la API: ${res.status}`);
        }
        return res.text(); // o .json() si tu API devuelve JSON
      })
      .then((data) => {
        // 🕒 Pequeño delay visual opcional para mostrar “cargando...”
        setTimeout(() => setApiData(data), 200);
      })
      .catch((err) => {
        console.error("❌ Error API:", err);
        setApiData(`Error al obtener datos: ${err.message}`);
      });
  };

  // 🔒 Pantalla de login
  if (!isLoggedIn) {
    return (
      <div style={{ textAlign: "center", marginTop: "80px" }}>
        <h2>🔐 Login con Keycloak (grant_type=password)</h2>
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button onClick={loginWithPassword}>Iniciar sesión</button>
      </div>
    );
  }

  // 🧭 Vista principal
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Bienvenido 👋</h2>

      <h3>
        ⏳ Tiempo restante del token:{" "}
        {expiresIn > 0 ? `${expiresIn}s` : "Expirado"}
      </h3>

      <button onClick={refreshAccessToken}>🔁 Renovar Token</button>

      <div style={{ marginTop: "30px" }}>
        <button onClick={callApi}>📡 Obtener datos de la API</button>
        <div style={{ marginTop: "20px", minHeight: "60px" }}>
          {apiData === null ? (
            <p style={{ color: "#999" }}>Esperando respuesta...</p>
          ) : (
            <>
              <h3>📦 Datos de la API:</h3>
              <pre>{apiData}</pre>
            </>
          )}
        </div>
      </div>

      <div style={{ marginTop: "30px" }}>
        <button
          onClick={() => {
            setIsLoggedIn(false);
            setToken(null);
            setRefreshToken(null);
            setExpiresIn(0);
            setApiData(null);
          }}
        >
          🚪 Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default App;
