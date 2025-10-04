import React, { useState, useEffect } from "react";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ username: "", password: "" });

  const [counter, setCounter] = useState(0);
  const [customStart, setCustomStart] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  // Usuario de prueba
  const USERNAME = "admin";
  const PASSWORD = "1234";

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
      setIsRunning(false); // se resetea cuando configuras
    }
  };

  // Efecto para la cuenta regresiva
  useEffect(() => {
    let timer;
    if (isRunning && counter > 0) {
      timer = setInterval(() => {
        setCounter((prev) => prev - 1);
      }, 1000);
    }
    if (counter === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, counter]);

  // Vista Login
  if (!isLoggedIn) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "50px" }}>
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

  // Vista Contador regresivo
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Bienvenido, {USERNAME} 👋</h2>
      <h3>Tiempo restante: {counter} s</h3>

      <input
        type="number"
        placeholder="Segundos iniciales"
        value={customStart}
        onChange={(e) => setCustomStart(e.target.value)}
      />
      <button onClick={setCustomCounter}>Configurar</button>
      <br /><br />

      {!isRunning ? (
        <button onClick={() => setIsRunning(true)} disabled={counter === 0}>
          ▶️ Iniciar
        </button>
      ) : (
        <button onClick={() => setIsRunning(false)}>⏸️ Pausar</button>
      )}
      <button onClick={() => { setIsRunning(false); setCounter(0); }}>
        ⏹️ Reset
      </button>
    </div>
  );
}

export default App;
