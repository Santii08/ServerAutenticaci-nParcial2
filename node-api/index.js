import express from "express";
import cors from "cors";
import fs from "fs";
import pkg from "express-jwt";
const { expressjwt } = pkg;
import jwksRsa from "jwks-rsa";
import dotenv from "dotenv";
import https from "https";

dotenv.config();

const app = express();
app.use(express.json());

// CORS
app.use(
  cors({
    origin: ["http://localhost:3000"], // frontend
    credentials: true,
  })
);

// HTTPS options
const httpsOptions = {
  key: fs.readFileSync("./certs/localhost-key.pem"),
  cert: fs.readFileSync("./certs/localhost.pem"),
};

// JWT Middleware
app.use(
  expressjwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksUri: `${process.env.KEYCLOAK_ISSUER_URI}/protocol/openid-connect/certs`,
    }),
    audience: "account",
    issuer: process.env.KEYCLOAK_ISSUER_URI,
    algorithms: ["RS256"],
  }).unless({ path: ["/public"] })
);

// Endpoints
app.get("/user/profile", (req, res) => {
  if (!req.auth) return res.status(401).json({ msg: "Token missing" });

  res.json({
    user: req.auth.preferred_username || "Santiago",
    email: req.auth.email || "santiago@example.com",
    roles: req.auth.realm_access?.roles || [],
  });
});

app.get("/public", (req, res) => {
  res.json({ msg: "This route does not need a token" });
});

// Start HTTPS server
const PORT = process.env.PORT || 8443;
https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`API running at https://localhost:${PORT}`);
});
