# **Parcial segundo corte patrones arquitectonicos avanzados**

**Integrantes:**  
- Juan Andrés Gómez
- Daniel Santiago Ramirez Chinchilla
- Santiago Navarro Cuy

## Video funcionamiento 


[![Ver en YouTube](https://img.youtube.com/vi/qNyS2prJR-Q/hqdefault.jpg)](https://youtu.be/qNyS2prJR-Q)

https://youtu.be/qNyS2prJR-Q


## **Índice**
- 1. Introducción
- 2. Arquitectura General
- 2.1 Diagrama de Arquitectura (PlantUML)
- 3. Servidor de Autenticación (Keycloak)
- 4. Endpoints de la API
- 4.1 /token/service (Client Credentials)
- 4.2 /token/user (Password Grant)
- 4.3 /token/refresh (Refresh Token)
- 5. Flujos de Autenticación
- 5.1 Microservicio (Client Credentials)
- 5.2 Frontend / Usuario (Password Grant)
- 5.3 Renovación de Tokens (Refresh Token)
- 6. Seguridad
- 7. Ejemplos de Uso en Postman



## **1. Introducción**
En este proyecto se implementa un sistema de autenticación y autorización basado en OAuth 2.0, utilizando Keycloak como Authorization Server. Se implementan dos flujos principales: Client Credentials (para comunicación entre servicios) y Password Grant con Refresh Token (para usuarios finales)


### **Guía para ejecutar el proyecto**

Esta guía te explica paso a paso cómo levantar los servicios del proyecto usando Docker Compose y conectarte al microservicio `service-client`.


### **Ubicarse en el directorio del proyecto**
Abre una terminal y navega hasta la carpeta donde se encuentra tu archivo `docker-compose.yml`:

```bash
cd /ruta/del/proyecto
```

**Ejemplo en Windows:**
```bash
cd C:\Users\TuUsuario\Downloads\ServerAutenticaci-nParcial2
```


### **Verificar instalación de Docker y Docker Compose**
Antes de ejecutar los servicios, asegúrate de tener Docker y Docker Compose instalados:

```bash
docker --version
docker compose version   # o docker-compose version
```


### **Levantar los servicios**
Para levantar **todos los servicios** en segundo plano:

```bash
docker compose up -d
```

Si deseas levantar **solo el microservicio `service-client`**:

```bash
docker compose up -d service-client
```

---

### **Comprobar que estén corriendo**
Lista los contenedores activos:

```bash
docker compose ps
```

**Ejemplo de salida:**

| NAME | SERVICE | STATUS |
|------|----------|--------|
| miapp_service-client_1 | service-client | running |


### **Conectarse al microservicio**
Conecta tu terminal al proceso principal del contenedor.

```bash
docker ps    # identifica el nombre del contenedor
docker attach <nombre_o_id_del_contenedor>
```

### **Detener los servicios**
Para detener **todos los servicios**:

```bash
docker compose down
```

O solo el microservicio:

```bash
docker compose stop service-client
```

## **Puertos y URLs de acceso**

| Servicio  | URL de acceso |
|------------|---------------|
| Keycloak   | [http://localhost:8080](http://localhost:8080) |
| API (HTTPS) | [https://localhost:8443](https://localhost:8443) |
| Frontend  | [http://localhost:3000](http://localhost:3000) |


## **2. Arquitectura General**
El sistema está compuesto por: Keycloak (Authorization Server), una API protegida que valida tokens emitidos por Keycloak, un Microservicio cliente que usa Client Credentials, y un Frontend/App donde el usuario final hace login.
### **2.1 Diagrama de Arquitectura (PlantUML)**


<img width="1336" height="625" alt="dPFFYjim4CRlUefXJmvXAVGOSDdKD6K9QSEwkHN284-pwdebTJJQahvM7w4lrh7T90XoA7i9sFh-_F89toL1blpS6t7I4opvHtP2LZ8ZTFgSXRmuYzRz-Ut11W-VzTtZMwZMTBHzm2UOmt9xhxyRPpaauXTdNPWPWrO2movbP1S04-nCr38zZUW5RbOSlAPty0QMCTuCYjM7KdBg-Eg7qi3k5" src="https://github.com/user-attachments/assets/2b2dd1a6-2f6f-45b9-9211-cbbe1fc49843" />


## **3. Servidor de Autenticación (Keycloak)**
Keycloak actúa como Authorization Server. Se registran clientes (ej: service-client, web-client) y usuarios. Keycloak expone el endpoint de token OpenID Connect:\
\
POST https://localhost:8080/realms/parcial-realm/protocol/openid-connect/token\
\
Tipos de tokens:\
\- access\_token: para acceder a APIs protegidas.\
\- refresh\_token: para renovar access\_token sin reautenticación.\
\- id\_token: opcional, contiene información del usuario cuando se usa OIDC.
## **4. Endpoints de la API**
### **4.1 /token/service (Client Credentials)**
Flujo: grant\_type=client\_credentials\
Uso: Permite a un microservicio obtener un access\_token con su propio client\_id y client\_secret.\
\
Ejemplo de request (x-www-form-urlencoded):\
client\_id=service-client\
client\_secret=<secret>\
grant\_type=client\_credentials\
\
Respuesta típica:

{\
`  `"access\_token": "...",\
`  `"expires\_in": 300,\
`  `"token\_type": "Bearer"\
}
### **4.2 /token/user (Password Grant)**
Flujo: grant\_type=password\
Uso: Autenticación de usuario final desde el frontend.\
\
Ejemplo de request (x-www-form-urlencoded):\
client\_id=web-client\
client\_secret=<secret>\
grant\_type=password\
username=<user>\
password=<pass>\
\
Respuesta típica:

{\
`  `"access\_token": "...",\
`  `"refresh\_token": "...",\
`  `"expires\_in": 300\
}
### **4.3 /token/refresh (Refresh Token)**
Flujo: grant\_type=refresh\_token\
Uso: Renovar el access\_token cuando este ha expirado, usando el refresh\_token.\
\
Ejemplo de request (x-www-form-urlencoded):\
client\_id=web-client\
client\_secret=<secret>\
grant\_type=refresh\_token\
refresh\_token=<refresh\_token>\
\
Respuesta típica:

{\
`  `"access\_token": "...",\
`  `"expires\_in": 300,\
`  `"refresh\_token": "..." \
}


## **5. Flujos de Autenticación**
### **5.1 Microservicio (Client Credentials)**
1\. El microservicio solicita token a Keycloak con client\_id + client\_secret.\
2\. Keycloak devuelve un access\_token con scopes específicos (ej: service.read).\
3\. El microservicio incluye Authorization: Bearer <access\_token> en la petición a la API.
### **5.2 Frontend / Usuario (Password Grant)**
1\. El usuario ingresa username + password en el frontend.\
2\. El frontend solicita a Keycloak un token con grant\_type=password.\
3\. Keycloak devuelve access\_token + refresh\_token.\
4\. El frontend consume la API usando Authorization: Bearer <access\_token>.
### **5.3 Renovación de Tokens (Refresh Token Flow)**
1\. Cuando expira el access\_token, el frontend llama al endpoint de token con grant\_type=refresh\_token y el refresh\_token.\
2\. Keycloak devuelve un nuevo access\_token (y, normalmente, un nuevo refresh\_token).\
3\. El frontend actualiza el token almacenado y sigue consumiendo la API.


## **6. Seguridad**
\- Transmitir tokens sólo mediante HTTPS.\
\- Definir scopes separados para servicios y usuarios (service.read, service.write, user.read, user.write).\
\- Evitar exponer client\_secret en frontend público.\
\- Manejar revocación de refresh tokens si se detecta compromiso.
## **7. Ejemplos de Uso en Postman**
Se describen ejemplos de peticiones que puedes ejecutar en Postman:

1. 1) Obtener token (Client Credentials):

POST https://localhost:8080/realms/parcial-realm/protocol/openid-connect/token\
Body (x-www-form-urlencoded): client\_id=service-client, client\_secret=<secret>, grant\_type=client\_credentials

1. 2) Obtener token (Password Grant):

POST https://localhost:8080/realms/parcial-realm/protocol/openid-connect/token\
Body (x-www-form-urlencoded): client\_id=web-client, client\_secret=<secret>, grant\_type=password, username=<user>, password=<pass>

1. 3) Renovar token (Refresh Token):

POST https://localhost/realms/parcial-realm/protocol/openid-connect/token\
Body (x-www-form-urlencoded): client\_id=web-client, client\_secret=<secret>, grant\_type=refresh\_token, refresh\_token=<refresh\_token>



