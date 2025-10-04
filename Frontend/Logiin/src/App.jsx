import React, { useState, useEffect } from "react";
import keycloak, { initKeycloak } from "./keycloak";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState({ username: "", password: "" });
  const [apiData, setApiData] = useState(null);

  const [counter, setCounter] = useState(0);
  const [customStart, setCustomStart] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  // Usuario de prueba
  const USERNAME = "admin";
  const PASSWORD = "1234";

  useEffect(() => {
    initKeycloak().then((authenticated) => {
      if (authenticated) {
        setIsLoggedIn(true);
        setToken(keycloak.token);

        // refrescar token automáticamente
        setInterval(() => {
          keycloak.updateToken(60).then((refreshed) => {
            if (refreshed) setToken(keycloak.token);
          });
        }, 5000);
      }
    });
  }, []);

  // Login local para pruebas
  const handleLogin = (e) => {
    e.preventDefault();
    if (user.username === USERNAME && user.password === PASSWORD) {
      setIsLoggedIn(true);
    } else {
      alert("Usuario o contraseña incorrectos");
    }
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const setCustomCounter = () => {
    if (!isNaN(customStart) && customStart > 0) {
      setCounter(Number(customStart));
      setCustomStart("");
      setIsRunning(false);
    }
  };

  // Efecto para la cuenta regresiva
  useEffect(() => {
    let timer;
    if (isRunning && counter > 0) {
      timer = setInterval(() => setCounter((prev) => prev - 1), 1000);
    }
    if (counter === 0) setIsRunning(false);
    return () => clearInterval(timer);
  }, [isRunning, counter]);

  // Función para llamar a la API
  const callApi = () => {
    if (token) {
      // Llamada real con Keycloak
      fetch("http://localhost:8080/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Error en la llamada a la API");
          return res.json();
        })
        .then((data) => setApiData(data))
        .catch((err) => console.error(err));
    } else {
      // Simulación de datos para login local
      setApiData({
        message: "ERROR DE AUTENTICACION",
        username: user.username,
      });
    }
  };

  // Vista login local
  if (!isLoggedIn) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "50px",
        }}
      >
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            name="username"
            placeholder="Usuario"
            value={user.username}
            onChange={handleChange}
          />
          <br />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={user.password}
            onChange={handleChange}
          />
          <br />
          <button type="submit">Entrar</button>
        </form>
      </div>
    );
  }

  // Vista principal con contador y botón de API
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>
        Bienvenido{" "}
        {token ? keycloak.tokenParsed.preferred_username : user.username} 👋
      </h2>
      <h3>Tiempo restante: {counter} s</h3>

      <input
        type="number"
        placeholder="Segundos iniciales"
        value={customStart}
        onChange={(e) => setCustomStart(e.target.value)}
      />
      <button onClick={setCustomCounter}>Configurar</button>
      <br />
      <br />

      {!isRunning ? (
        <button onClick={() => setIsRunning(true)} disabled={counter === 0}>
          ▶️ Iniciar
        </button>
      ) : (
        <button onClick={() => setIsRunning(false)}>⏸️ Pausar</button>
      )}
      <button
        onClick={() => {
          setIsRunning(false);
          setCounter(0);
        }}
      >
        ⏹️ Reset
      </button>

      <div style={{ marginTop: "50px" }}>
        <button onClick={callApi}>Obtener datos de la API</button>
        {apiData && (
          <div style={{ marginTop: "20px" }}>
            <h3>Datos de la API:</h3>
            <pre>{JSON.stringify(apiData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
