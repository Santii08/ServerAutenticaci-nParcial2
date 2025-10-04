import React, { useState, useEffect } from "react";
import keycloak, { initKeycloak } from "./keycloak";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [apiData, setApiData] = useState(null);

  const [counter, setCounter] = useState(0);
  const [customStart, setCustomStart] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  // Inicializar Keycloak al montar
  useEffect(() => {
    initKeycloak().then((authenticated) => {
      if (authenticated) {
        setIsLoggedIn(true);
        setToken(keycloak.token);

        // refrescar token automáticamente
        setInterval(() => {
          keycloak.updateToken(60).then((refreshed) => {
            if (refreshed) {
              setToken(keycloak.token);
            }
          });
        }, 5000);
      } else {
        setIsLoggedIn(false);
      }
    });
  }, []);

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

  // Llamar a la API protegida con el token
  const callApi = () => {
    if (token) {
      fetch("http://localhost:8080/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Error en la llamada a la API");
          return res.json();
        })
        .then((data) => setApiData(data))
        .catch((err) => console.error(err));
    }
  };

  // Si no está logueado → mostrar botón de login de Keycloak
  if (!isLoggedIn) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>Inicia sesión con Keycloak</h2>
        <button onClick={() => keycloak.login()}>Login</button>
      </div>
    );
  }

  // Vista principal si está logueado
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>
        Bienvenido{" "}
        {token ? keycloak.tokenParsed?.preferred_username : "Usuario"} 👋
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

      <div style={{ marginTop: "30px" }}>
        <button onClick={() => keycloak.logout()}>Cerrar sesión</button>
      </div>
    </div>
  );
}

export default App;
