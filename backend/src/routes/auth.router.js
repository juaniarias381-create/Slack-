import express from 'express'
import { login, register, verifyEmail, resendVerificationEmail, forgotPassword, resetPassword } from '../controllers/auth.controller.js'

const auth_router = express.Router()

/*
Validacion del email del usuario
*/

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registra un nuevo usuario
 *     description: |
 *       Valida los datos, verifica que el email no este registrado, hashea la contrasena,
 *       crea el usuario y le envia un mail con un link de verificacion (token JWT valido 7 dias).
 *
 *       Errores posibles (400):
 *       - "Email, password and username is required" si falta algun campo
 *       - "Email is incorrect" si el email no cumple el formato
 *       - "Email is already used" si el email ya esta registrado
 *
 *       Nota: el backend NO valida una longitud minima de la contrasena en el registro.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: "Ana"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Debe cumplir el formato de email (validado con regex en el backend)
 *                 example: "ana@example.com"
 *               password:
 *                 type: string
 *                 description: Se guarda hasheada con bcrypt. Sin longitud minima validada en este endpoint
 *                 example: "miPassword123"
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente (aun sin verificar el email). No devuelve datos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SimpleSuccess'
 *             example:
 *               ok: true
 *               status: 201
 *               message: "User registered successfully"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
auth_router.post('/register', register)

/*
Cuando un usuario inicia sesion debemos crear de alguna forma la sesion
*/

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Inicia sesion y devuelve un token JWT
 *     description: |
 *       Valida las credenciales y devuelve un token JWT de sesion (sin expiracion).
 *       Requiere que el email del usuario ya este verificado.
 *
 *       Errores posibles:
 *       - 400 "Email and password are required" si falta algun campo o no son strings
 *       - 400 "Email is incorrect" si el email no cumple el formato
 *       - 401 "Invalid email or password" si el email no existe o la contrasena es incorrecta
 *         (mismo mensaje en ambos casos para no revelar cual fallo)
 *       - 403 "Email no verificado" si la cuenta aun no verifico su email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "ana@example.com"
 *               password:
 *                 type: string
 *                 description: La contrasena en texto plano (se compara contra el hash en DB)
 *                 example: "miPassword123"
 *     responses:
 *       200:
 *         description: Credenciales validas. Devuelve el token de autenticacion.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *             example:
 *               ok: true
 *               status: 200
 *               message: "You have logged in successfully"
 *               data:
 *                 auth_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: Credenciales incorrectas (email inexistente o contrasena invalida).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               ok: false
 *               status: 401
 *               message: "Invalid email or password"
 *       403:
 *         description: El email de la cuenta aun no fue verificado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               ok: false
 *               status: 403
 *               message: "Email no verificado"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
auth_router.post('/login', login)

/*
Reenviar el mail de verificacion con un token nuevo (debe ir antes de :verify_email_token para que no se confunda con ese route)
*/

/**
 * @openapi
 * /api/auth/verify-email/resend/{email}:
 *   get:
 *     tags: [Auth]
 *     summary: Reenvia el mail de verificacion de un usuario
 *     description: |
 *       Genera un token de verificacion nuevo (valido 7 dias) y lo envia por mail.
 *       El mail SOLO se envia si el usuario existe, esta activo y no esta verificado.
 *       En cualquier caso la respuesta es la misma (mensaje ambiguo) para no revelar
 *       si la cuenta existe o su estado.
 *
 *       Errores posibles (400):
 *       - "Email is incorrect" si el email del path no cumple el formato
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         description: Email de la cuenta que necesita verificar
 *         schema:
 *           type: string
 *           format: email
 *         example: "ana@example.com"
 *     responses:
 *       200:
 *         description: Solicitud procesada. El mail se envio solo si la cuenta era elegible.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResendVerificationResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
auth_router.get('/verify-email/resend/:email', resendVerificationEmail)

/**
 * @openapi
 * /api/auth/verify-email/{verify_email_token}:
 *   get:
 *     tags: [Auth]
 *     summary: Verifica el email de un usuario mediante el token del mail
 *     description: |
 *       Decodifica el token JWT de verificacion (recibido por link en el mail),
 *       valida el estado de la cuenta y marca al usuario como verificado.
 *
 *       Errores posibles:
 *       - 400 "Ya estas verificado" si el usuario ya tenia el email verificado
 *       - 404 "Usuario no encontrado" si el email del token no corresponde a ninguna cuenta
 *       - 403 si el usuario esta desactivado de la plataforma
 *       - 400 con mensaje de token invalido/expirado si el JWT no se puede verificar
 *         (generado por jwt.verify y atrapado por el middleware de errores)
 *     parameters:
 *       - in: path
 *         name: verify_email_token
 *         required: true
 *         description: Token JWT de verificacion recibido por mail (expira en 7 dias)
 *         schema:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Email verificado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SimpleSuccess'
 *             example:
 *               ok: true
 *               status: 200
 *               message: "Usuario verificado exitosamente"
 *       400:
 *         description: Token invalido/expirado o el usuario ya estaba verificado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             examples:
 *               ya_verificado:
 *                 summary: El usuario ya estaba verificado
 *                 value: { ok: false, status: 400, message: "Ya estas verificado" }
 *               token_invalido:
 *                 summary: Token invalido o expirado (JsonWebTokenError / TokenExpiredError)
 *                 value:
 *                   ok: false
 *                   status: 500
 *                   message: "Internal server error"
 *       403:
 *         description: La cuenta esta desactivada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               ok: false
 *               status: 403
 *               message: "Usuario esta desactivado de la plataforma, contactate con soporte si consideras que esto es un error"
 *       404:
 *         description: El email del token no corresponde a ningun usuario.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               ok: false
 *               status: 404
 *               message: "Usuario no encontrado"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
auth_router.get('/verify-email/:verify_email_token',  verifyEmail)

/*
Endpoint de "olvide mi contraseña": el formulario le envia el email y, si el usuario
existe y esta activo, el backend le manda un mail con un token de reseteo
*/

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Envia un mail con el link para restablecer la contrasena
 *     description: |
 *       Si el usuario existe y esta activo, le envia un mail con un token de reseteo
 *       (JWT con purpose "reset_password", valido 1 hora).
 *       En cualquier caso la respuesta es la misma (mensaje ambiguo) para no revelar
 *       si la cuenta existe o esta activa.
 *
 *       Errores posibles (400):
 *       - "Email is required" si falta el email o no es un string
 *       - "Email is incorrect" si el email no cumple el formato
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "ana@example.com"
 *     responses:
 *       200:
 *         description: Solicitud procesada. El mail se envio solo si la cuenta era elegible.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForgotPasswordResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
auth_router.post('/forgot-password', forgotPassword)

/*
Endpoint de restablecer la contraseña: llega desde /reset-password del frontend
con el token (del link del mail) y la password nueva
*/

/**
 * @openapi
 * /api/auth/reset-password/{reset_password_token}:
 *   post:
 *     tags: [Auth]
 *     summary: Restablece la contrasena mediante el token del mail
 *     description: |
 *       Valida el token de reseteo (JWT con purpose "reset_password", expira en 1 hora)
 *       y actualiza la contrasena hasheada del usuario.
 *
 *       Errores posibles:
 *       - 400 "El token y la nueva password son requeridos" si falta el token o la password
 *       - 400 "La password debe tener al menos 8 caracteres"
 *       - 400 "El token de reseteo expiro, solicita uno nuevo" si el JWT expiro
 *       - 400 "Token de reseteo invalido" si el JWT es invalido o no tiene purpose "reset_password"
 *       - 404 "Usuario no encontrado" si el email del token no corresponde a ninguna cuenta
 *       - 403 si el usuario esta desactivado de la plataforma
 *     parameters:
 *       - in: path
 *         name: reset_password_token
 *         required: true
 *         description: Token JWT de reseteo recibido por mail (expira en 1 hora)
 *         schema:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Nueva contrasena en texto plano (minimo 8 caracteres, se guarda hasheada)
 *                 example: "nuevaPassword123"
 *     responses:
 *       200:
 *         description: Contrasena restablecida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SimpleSuccess'
 *             example:
 *               ok: true
 *               status: 200
 *               message: "Contraseña restablecida exitosamente"
 *       400:
 *         description: Token invalido/expirado o password ausente/corta.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             examples:
 *               password_corta:
 *                 summary: Contrasena de menos de 8 caracteres
 *                 value: { ok: false, status: 400, message: "La password debe tener al menos 8 caracteres" }
 *               token_expirado:
 *                 summary: Token de reseteo expirado
 *                 value: { ok: false, status: 400, message: "El token de reseteo expiro, solicita uno nuevo" }
 *               token_invalido:
 *                 summary: Token invalido o con purpose incorrecto
 *                 value: { ok: false, status: 400, message: "Token de reseteo invalido" }
 *               campos_faltantes:
 *                 summary: Faltan token o password
 *                 value: { ok: false, status: 400, message: "El token y la nueva password son requeridos" }
 *       403:
 *         description: La cuenta esta desactivada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               ok: false
 *               status: 403
 *               message: "Usuario esta desactivado de la plataforma, contactate con soporte si consideras que esto es un error"
 *       404:
 *         description: El email del token no corresponde a ningun usuario.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               ok: false
 *               status: 404
 *               message: "Usuario no encontrado"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
auth_router.post('/reset-password/:reset_password_token', resetPassword)

export default auth_router