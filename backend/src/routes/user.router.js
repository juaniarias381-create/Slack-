import express from 'express'
import authMiddleware from '../middlewares/auth.middleware.js'
import { getUserById, getUsers } from '../controllers/user.controller.js'

const user_router = express.Router()

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Lista todos los usuarios
 *     description: |
 *       Devuelve la lista completa de usuarios de la plataforma.
 *
 *       ATENCION: los documentos se devuelven tal como estan en la base de datos,
 *       INCLUYENDO el hash de la password de cada usuario.
 *
 *       Requiere header "Authorization: Bearer <jwt>".
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsersListResponse'
 *             example:
 *               ok: true
 *               status: 200
 *               message: "Get users list"
 *               data:
 *                 users:
 *                   - _id: "674a1b2c3d4e5f6a7b8c9d0e"
 *                     nombre: "Ana"
 *                     email: "ana@example.com"
 *                     password: "$2b$10$X7QzY1vE9xK2pLmNoPqRsTuVwXyZ0123456789abcdefghijk"
 *                     fecha_creacion: "2026-01-15T10:30:00.000Z"
 *                     activo: true
 *                     email_verificado: true
 *                     __v: 0
 *       400:
 *         description: Header Authorization faltante o malformado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             examples:
 *               header_faltante:
 *                 summary: Sin header Authorization
 *                 value: { ok: false, status: 400, message: "Auth header is requered" }
 *               header_malformado:
 *                 summary: Header sin token
 *                 value: { ok: false, status: 400, message: "Auth header is malformed" }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
user_router.get(
    '/',
    authMiddleware,
    getUsers
)

/**
 * @openapi
 * /api/users/{user_id}:
 *   get:
 *     tags: [Users]
 *     summary: Obtiene el detalle de un usuario por id
 *     description: |
 *       Devuelve el documento completo del usuario (incluye el hash de la password).
 *
 *       Requiere header "Authorization: Bearer <jwt>".
 *
 *       Errores posibles:
 *       - 400 si falta o esta malformado el header Authorization
 *       - 401 si el token JWT es invalido o expiro
 *       - 404 "User not found" si no existe un usuario con ese id
 *       - 500 si el id no es un ObjectId valido de MongoDB (error de CastError de Mongoose)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         description: Id del usuario (ObjectId de MongoDB)
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         example: "674a1b2c3d4e5f6a7b8c9d0e"
 *     responses:
 *       200:
 *         description: Usuario encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserDetailResponse'
 *             example:
 *               ok: true
 *               status: 200
 *               message: "Get user details successfully"
 *               data:
 *                 user:
 *                   _id: "674a1b2c3d4e5f6a7b8c9d0e"
 *                   nombre: "Ana"
 *                   email: "ana@example.com"
 *                   password: "$2b$10$X7QzY1vE9xK2pLmNoPqRsTuVwXyZ0123456789abcdefghijk"
 *                   fecha_creacion: "2026-01-15T10:30:00.000Z"
 *                   activo: true
 *                   email_verificado: true
 *                   __v: 0
 *       400:
 *         description: Header Authorization faltante o malformado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               ok: false
 *               status: 400
 *               message: "Auth header is requered"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Usuario inexistente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               ok: false
 *               status: 404
 *               message: "User not found"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
user_router.get(
    '/:user_id',
    authMiddleware,
    getUserById
)

export default user_router