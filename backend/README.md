# Documentación de la API — Backend (Clon de Slack)

## 1. Alcance del proyecto

Este backend es una API REST construida con **Node.js + Express 5** que replica la funcionalidad central de Slack a nivel de aprendizaje. Su objetivo es exponer los endpoints necesarios para que un frontend gestione:

- **Autenticación de usuarios**: registro, login (con JWT), verificación de email por mail, reenvío de verificación y recuperación/restablecimiento de contraseña.
- **Usuarios**: consulta de usuarios y detalle por id.
- **Espacios de trabajo (workspaces)**: creación, listado, detalle, actualización y eliminación, con un sistema de **membresías y roles** (`owner`, `admin`, `user`).
- **Canales**: listado y creación de canales dentro de un workspace, detalle de canal y mensajes de canal (listar y enviar).

### Stack técnico

| Tecnología | Uso |
|---|---|
| Express 5 | Framework HTTP |
| Mongoose + MongoDB | Persistencia de usuarios, workspaces, membresías, canales y mensajes |
| jsonwebtoken | Emisión y verificación de tokens de sesión (JWT) |
| bcrypt | Hash de contraseñas |
| nodemailer | Envío de emails (verificación, reseteo de contraseña) |
| cors / dotenv | CORS y variables de entorno |
| mysql2 | Configuración disponible (no usada en los endpoints actuales) |

### Arquitectura

El proyecto sigue una arquitectura en capas:

```
routes/       → define rutas y cadena de middlewares
controllers/  → capa de entrada HTTP (lee body/params, formatea respuesta)
services/     → lógica de negocio
repositories/ → acceso a datos (MongoDB vía Mongoose)
middlewares/  → auth, logging de consultas, autorización por rol, validaciones de workspace/canal, manejo de errores
models/       → esquemas de Mongoose
dto/          → transformación de datos de salida
config/       → conexión a MongoDB, mailer, variables de entorno
utils/        → ServerError, bcrypt, plantillas de email
```

Archivo de entrada: `src/main.js` — inicia el servidor en `ENVIRONMENT.PORT` y monta los routers en `/api/auth`, `/api/users` y `/api/workspaces`.

---

## 2. Middlewares globales

Estos middlewares se aplican a **todos** los endpoints de la API (se registran con `app.use()` en `main.js`):

| Middleware | Finalidad |
|---|---|
| `cors()` | Habilita CORS para cualquier origen |
| `express.json()` | Parsea el body JSON de las requests |
| `loggerMiddleware` | Registra cada consulta en la colección `RequestLog` de MongoDB: fecha, método, URL, endpoint, IP real del cliente (requiere `trust proxy`), status de respuesta, tiempo de ejecución y `user_id` si la ruta requiere autenticación. En `POST`/`PUT`/`DELETE` registra además el **body encriptado** con AES-256-GCM usando `LOGGER_PRIVATE_KEY` (campo `body_encriptado`, formato `iv:tag:data`, se descifra con `decryptRequestBody` de `utils/logger-crypto.util.js`). Las rutas sensibles (`/api/auth/register`, `/api/auth/login`, `/api/auth/forgot-password`, `/api/auth/reset-password/*`) **nunca registran body**. El insert es "fire-and-forget": si MongoDB falla, la respuesta del endpoint no se ve afectada |
| Conexión a MongoDB (inline) | Antes de cada request, intenta conectar a MongoDB; si falla responde `503 {"message": "No se pudo conectar a la base de datos"}` |
| `errorHandlerMiddleware` | Último en la cadena: captura cualquier error lanzado. Si es un `ServerError` (tiene `status`) responde con ese código y mensaje; si es inesperado responde `500 {"ok": false, "message": "Internal server error"}` |

### Middlewares de ruta

| Middleware | Finalidad |
|---|---|
| `authMiddleware` | Valida el header `Authorization: Bearer <jwt>`, verifica el token con `JWT_SECRET_KEY` e inyecta `request.user = { id, name, email }`. Sin header → `400`; token inválido/expirado → `401` |
| `workspaceMiddleware(valid_roles)` | Fábrica de middleware: valida que el workspace exista (`404`), que el usuario autenticado tenga membresía (`403`) y, si `valid_roles` no está vacío, que su rol esté en la lista (`403`). Inyecta `request.workspace` |
| `channelMiddleware` | Se usa **después** de `workspaceMiddleware`. Valida que `channel_id` sea un ObjectId válido (`400`), que el canal exista (`404`) y que pertenezca al workspace de la URL (`404`, evita leer canales de otro workspace). Inyecta `request.channel` |

---

## 3. Rutas y endpoints

### 3.1. `/api/auth` — Autenticación (público, sin authMiddleware)

| Método | Endpoint | Middlewares | Finalidad |
|---|---|---|---|
| POST | `/api/auth/register` | globales | Registra un usuario con `username`, `email` y `password` (body). Hashea la contraseña y envía un mail de verificación con token. Responde `201` |
| POST | `/api/auth/login` | globales | Inicia sesión con `email` y `password` (body). Si las credenciales son válidas y el email está verificado, devuelve un `auth_token` (JWT) para usar en el header `Authorization`. Responde `200` |
| GET | `/api/auth/verify-email/resend/:email` | globales | Reenvía el mail de verificación generando un token nuevo (se declara antes de `:verify_email_token` para no colisionar con esa ruta). Responde `200` |
| GET | `/api/auth/verify-email/:verify_email_token` | globales | Verifica el email del usuario consumiendo el token recibido por email (link). Responde `200` |
| POST | `/api/auth/forgot-password` | globales | "Olvidé mi contraseña": recibe `email` (body) y, si el usuario existe y está activo, le envía un mail con un link/token de reseteo. Responde siempre lo mismo para no revelar si la cuenta existe. Responde `200` |
| POST | `/api/auth/reset-password/:reset_password_token` | globales | Restablece la contraseña: recibe el token por params (viene del link del mail) y la `password` nueva por body. Responde `200` |

### 3.2. `/api/users` — Usuarios (requieren autenticación)

| Método | Endpoint | Middlewares | Finalidad |
|---|---|---|---|
| GET | `/api/users` | `authMiddleware` | Devuelve la lista de todos los usuarios. Responde `200` con `data.users` |
| GET | `/api/users/:user_id` | `authMiddleware` | Devuelve el detalle de un usuario por id. Responde `200` con `data.user`, o `404` si no existe |

> Estos endpoints requieren el header `Authorization: Bearer <jwt>`; sin token responden `400`/`401`.

### 3.3. `/api/workspaces` — Espacios de trabajo

| Método | Endpoint | Middlewares (orden) | Finalidad |
|---|---|---|---|
| GET | `/api/workspaces` | `authMiddleware` | Devuelve los workspaces del usuario autenticado (sus membresías), incluyendo el rol en cada uno. Responde `200` con `data.workspaces` |
| POST | `/api/workspaces` | `authMiddleware` | Crea un workspace con `name` y `description` (body); el usuario autenticado queda como `owner` mediante una membresía. Responde `201` con `workspace_created` y `owner_membership` |
| GET | `/api/workspaces/:workspace_id` | `authMiddleware` → `workspaceMiddleware([])` | Devuelve el detalle del workspace. Requiere ser miembro (cualquier rol). Responde `200` con `workspace_selected` |
| GET | `/api/workspaces/:workspace_id/members` | `authMiddleware` → `workspaceMiddleware([])` | Devuelve la lista de miembros (nombre, email y rol) del workspace. Requiere ser miembro. Responde `200` con `data.members` |
| POST | `/api/workspaces/:workspace_id/members` | `authMiddleware` → `workspaceMiddleware(['owner'])` | Agrega un miembro con `email` y `rol` (`admin`/`user`) en el body. Si el email no existe o está desactivado no crea nada, pero responde lo mismo (`200` y mensaje ambiguo) para no revelar el estado de la cuenta. |
| PUT | `/api/workspaces/:workspace_id` | `authMiddleware` → `workspaceMiddleware(['owner', 'admin'])` | Actualiza `name`/`description` del workspace (body). Solo `owner` y `admin`. Responde `200` |
| DELETE | `/api/workspaces/:workspace_id` | `authMiddleware` → `workspaceMiddleware(['owner'])` | Elimina el workspace y sus membresías. Solo `owner`. Responde `200` |

> El router de canales se monta con `workspace_router.use('/:workspace_id/channels', channel_router)`, por lo que todas las rutas de canales requieren un `workspace_id` en la URL.

### 3.4. `/api/workspaces/:workspace_id/channels` — Canales y mensajes

Router con `mergeParams: true` para acceder a `workspace_id`.

| Método | Endpoint | Middlewares (orden) | Finalidad |
|---|---|---|---|
| GET | `/api/workspaces/:workspace_id/channels` | `authMiddleware` → `workspaceMiddleware([])` | Devuelve todos los canales del workspace. Requiere ser miembro. Responde `200` con `data.channels` |
| POST | `/api/workspaces/:workspace_id/channels` | `authMiddleware` → `workspaceMiddleware(['owner', 'admin'])` | Crea un canal con `name` y `description` (body). Valida que `name` exista y no supere 30 caracteres (`400`). Solo `owner` y `admin`. Responde `201` |
| GET | `/api/workspaces/:workspace_id/channels/:channel_id` | `authMiddleware` → `workspaceMiddleware([])` → `channelMiddleware` | Devuelve el detalle del canal. Responde `200` con `data.channel` |
| GET | `/api/workspaces/:workspace_id/channels/:channel_id/messages` | `authMiddleware` → `workspaceMiddleware([])` → `channelMiddleware` | Devuelve los mensajes del canal. Responde `200` con `data.messages` |
| POST | `/api/workspaces/:workspace_id/channels/:channel_id/messages` | `authMiddleware` → `workspaceMiddleware([])` → `channelMiddleware` | Envía un mensaje al canal: valida `content` (requerido, máximo 2000 caracteres, `400`), busca la membresía del usuario y crea el mensaje asociado a esa membresía y al canal. Responde `201` |

---

## 4. Formato de respuesta

Todas las respuestas (exitosas y de error) siguen un formato uniforme:

```json
{
  "ok": true | false,
  "status": 200,
  "message": "Descripción del resultado",
  "data": { }
}
```

`data` solo está presente cuando el endpoint devuelve información.

### Códigos de estado más comunes

| Código | Causa |
|---|---|
| 200 | Operación exitosa |
| 201 | Recurso creado (usuario, workspace, canal, mensaje) |
| 400 | Falta el header de auth, datos inválidos (nombre/cotenido vacío o muy largo) o token JWT malformado |
| 401 | Token JWT inválido o expirado |
| 403 | El usuario no es miembro del workspace o no tiene el rol requerido |
| 404 | Workspace, usuario o canal no encontrado (incluye canales de otro workspace) |
| 500 | Error inesperado del servidor |
| 503 | MongoDB no disponible al momento de la request |

---

## 5. Ejemplo de flujo completo

1. `POST /api/auth/register` → registra y envía mail de verificación.
2. `GET /api/auth/verify-email/:token` → activa la cuenta.
3. `POST /api/auth/login` → obtiene el `auth_token`.
4. `POST /api/workspaces` con header `Authorization: Bearer <token>` → crea un workspace (queda como `owner`).
5. `POST /api/workspaces/:workspace_id/channels` → crea un canal (owner/admin).
6. `POST /api/workspaces/:workspace_id/channels/:channel_id/messages` → envía mensajes al canal.
