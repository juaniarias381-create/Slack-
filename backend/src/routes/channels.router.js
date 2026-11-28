import express from 'express'
import authMiddleware from '../middlewares/auth.middleware.js'
import workspaceMiddleware from '../middlewares/workspace.middleware.js'
import channelMiddleware from '../middlewares/channel.middleware.js'
import {
    getChannels,
    createChannel,
    getChannelById,
    getMessages,
    sendMessage,
    updateChannel,
    deleteChannel
} from '../controllers/channel.controller.js'

const channel_router = express.Router({ mergeParams: true })

/*
GET /api/workspaces/:workspace_id/channels
*/

/**
 * @openapi
 * /api/workspaces/{workspace_id}/channels:
 *   get:
 *     tags: [Channels]
 *     summary: Lista los canales de un workspace
 *     description: |
 *       Devuelve todos los canales del workspace. Accesible para cualquier miembro.
 *
 *       Requiere header "Authorization: Bearer <jwt>".
 *
 *       Errores posibles:
 *       - 404 "Workspace no encontrado" si el id no existe
 *       - 403 "No eres miembro de este espacio de trabajo" si no tiene membresia
 *       - 400 si el id no es un ObjectId valido de MongoDB
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceId'
 *     responses:
 *       200:
 *         description: Lista de canales obtenida (puede ser vacia).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChannelsListResponse'
 *             example:
 *               ok: true
 *               status: 200
 *               message: "Canales obtenidos correctamente"
 *               data:
 *                 channels:
 *                   - _id: "674a1b2c3d4e5f6a7b8c9d0c"
 *                     nombre: "general"
 *                     descripcion: "Canal para anuncios generales"
 *                     fk_id_espacio_trabajo: "674a1b2c3d4e5f6a7b8c9d0e"
 *                     fecha_creacion: "2026-01-15T10:30:00.000Z"
 *                     __v: 0
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
 *       403:
 *         description: El usuario no es miembro del workspace.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               ok: false
 *               status: 403
 *               message: "No eres miembro de este espacio de trabajo"
 *       404:
 *         description: Workspace inexistente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               ok: false
 *               status: 404
 *               message: "Workspace no encontrado"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
channel_router.get(
    '/',
    authMiddleware,
    workspaceMiddleware([]),
    getChannels
)

/*
POST /api/workspaces/:workspace_id/channels
Solo owner y admin
*/

/**
 * @openapi
 * /api/workspaces/{workspace_id}/channels:
 *   post:
 *     tags: [Channels]
 *     summary: Crea un canal en el workspace (owner o admin)
 *     description: |
 *       Crea un canal dentro del workspace. La descripcion es opcional.
 *
 *       Requiere header "Authorization: Bearer <jwt>" y rol "owner" o "admin".
 *
 *       Errores posibles (400):
 *       - "El nombre del canal es requerido" si falta el nombre o esta vacio
 *       - "El nombre del canal no puede superar los 30 caracteres"
 *       - "El id del canal no es valido" (ObjectId invalido, viene del middleware)
 *       - 409 "Ya existe un canal con ese nombre en este espacio de trabajo"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 30
 *                 description: Nombre del canal (se recorta con trim, max 30 caracteres)
 *                 example: "general"
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Descripcion opcional del canal (mapea a "descripcion")
 *                 example: "Canal para anuncios generales"
 *     responses:
 *       201:
 *         description: Canal creado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChannelCreatedResponse'
 *             example:
 *               ok: true
 *               status: 201
 *               message: "Canal creado correctamente"
 *               data:
 *                 channel_created:
 *                   _id: "674a1b2c3d4e5f6a7b8c9d0c"
 *                   nombre: "general"
 *                   descripcion: "Canal para anuncios generales"
 *                   fk_id_espacio_trabajo: "674a1b2c3d4e5f6a7b8c9d0e"
 *                   fecha_creacion: "2026-01-15T10:30:00.000Z"
 *                   __v: 0
 *       400:
 *         description: Nombre de canal invalido, header Authorization invalido o ObjectId invalido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             examples:
 *               nombre_faltante:
 *                 summary: Falta el nombre del canal
 *                 value: { ok: false, status: 400, message: "El nombre del canal es requerido" }
 *               nombre_largo:
 *                 summary: Nombre de mas de 30 caracteres
 *                 value: { ok: false, status: 400, message: "El nombre del canal no puede superar los 30 caracteres" }
 *               header_faltante:
 *                 summary: Sin header Authorization
 *                 value: { ok: false, status: 400, message: "Auth header is requered" }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Sin membresia o rol distinto de "owner"/"admin".
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             examples:
 *               sin_membresia:
 *                 summary: No es miembro del workspace
 *                 value: { ok: false, status: 403, message: "No eres miembro de este espacio de trabajo" }
 *               rol_insuficiente:
 *                 summary: Es miembro pero con rol "user"
 *                 value: { ok: false, status: 403, message: "No tienes permisos suficientes para hacer esta operacion" }
 *       404:
 *         description: Workspace inexistente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               ok: false
 *               status: 404
 *               message: "Workspace no encontrado"
 *       409:
 *         description: Ya existe un canal con ese nombre en el workspace.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               ok: false
 *               status: 409
 *               message: "Ya existe un canal con ese nombre en este espacio de trabajo"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
channel_router.post(
    '/',
    authMiddleware,
    workspaceMiddleware(['owner', 'admin']),
    createChannel
)

/*
GET /api/workspaces/:workspace_id/channels/:channel_id
Traer los datos del canal
*/

/**
 * @openapi
 * /api/workspaces/{workspace_id}/channels/{channel_id}:
 *   get:
 *     tags: [Channels]
 *     summary: Obtiene el detalle de un canal
 *     description: |
 *       Devuelve el canal si existe y pertenece al workspace de la URL.
 *       Accesible para cualquier miembro.
 *
 *       Requiere header "Authorization: Bearer <jwt>".
 *
 *       Errores posibles:
 *       - 400 "El id del canal no es valido" si el ObjectId es invalido
 *       - 404 "Canal no encontrado" si no existe o pertenece a otro workspace
 *         (mismo mensaje en ambos casos para evitar filtrar informacion)
 *       - 403 si el usuario no es miembro del workspace
 *       - 404 "Workspace no encontrado" si el workspace no existe
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceId'
 *       - $ref: '#/components/parameters/ChannelId'
 *     responses:
 *       200:
 *         description: Canal encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChannelDetailResponse'
 *             example:
 *               ok: true
 *               status: 200
 *               message: "Canal obtenido correctamente"
 *               data:
 *                 channel:
 *                   _id: "674a1b2c3d4e5f6a7b8c9d0c"
 *                   nombre: "general"
 *                   descripcion: "Canal para anuncios generales"
 *                   fk_id_espacio_trabajo: "674a1b2c3d4e5f6a7b8c9d0e"
 *                   fecha_creacion: "2026-01-15T10:30:00.000Z"
 *                   __v: 0
 *       400:
 *         description: ObjectId del canal invalido o header Authorization invalido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             examples:
 *               id_invalido:
 *                 summary: ObjectId del canal invalido
 *                 value: { ok: false, status: 400, message: "El id del canal no es valido" }
 *               header_faltante:
 *                 summary: Sin header Authorization
 *                 value: { ok: false, status: 400, message: "Auth header is requered" }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: El usuario no es miembro del workspace.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               ok: false
 *               status: 403
 *               message: "No eres miembro de este espacio de trabajo"
 *       404:
 *         description: Canal inexistente, de otro workspace, o workspace inexistente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             examples:
 *               canal_inexistente:
 *                 summary: Canal inexistente o de otro workspace
 *                 value: { ok: false, status: 404, message: "Canal no encontrado" }
 *               workspace_inexistente:
 *                 summary: Workspace inexistente
 *                 value: { ok: false, status: 404, message: "Workspace no encontrado" }
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
channel_router.get(
    '/:channel_id',
    authMiddleware,
    workspaceMiddleware([]),
    channelMiddleware,
    getChannelById
)

/*
PUT /api/workspaces/:workspace_id/channels/:channel_id
Solo owner y admin
*/

/**
 * @openapi
 * /api/workspaces/{workspace_id}/channels/{channel_id}:
 *   put:
 *     tags: [Channels]
 *     summary: Actualiza nombre y descripcion de un canal (owner o admin)
 *     description: |
 *       Actualiza el nombre y la descripcion de un canal del workspace.
 *       El nombre es obligatorio; si no se manda "description" se conserva la
 *       descripcion actual. Si se manda (aunque sea vacia), se reemplaza.
 *
 *       Requiere header "Authorization: Bearer <jwt>" y rol "owner" o "admin".
 *
 *       Errores posibles (400):
 *       - "El nombre del canal es requerido" si falta el nombre o esta vacio
 *       - "El nombre del canal no puede superar los 30 caracteres"
 *       - "El id del canal no es valido" (ObjectId invalido, viene del middleware)
 *       - 409 "Ya existe un canal con ese nombre en este espacio de trabajo"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceId'
 *       - $ref: '#/components/parameters/ChannelId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 30
 *                 description: Nuevo nombre del canal (se recorta con trim, max 30 caracteres)
 *                 example: "general-v2"
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Nueva descripcion del canal (opcional; se mapea a "descripcion")
 *                 example: "Canal para anuncios generales actualizados"
 *     responses:
 *       200:
 *         description: Canal actualizado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChannelUpdatedResponse'
 *             example:
 *               ok: true
 *               status: 200
 *               message: "Canal actualizado correctamente"
 *               data:
 *                 channel_updated:
 *                   _id: "674a1b2c3d4e5f6a7b8c9d0c"
 *                   nombre: "general-v2"
 *                   descripcion: "Canal para anuncios generales actualizados"
 *                   fk_id_espacio_trabajo: "674a1b2c3d4e5f6a7b8c9d0e"
 *                   fecha_creacion: "2026-01-15T10:30:00.000Z"
 *                   __v: 0
 *       400:
 *         description: Nombre de canal invalido, ObjectId invalido o header Authorization invalido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             examples:
 *               nombre_faltante:
 *                 summary: Falta el nombre del canal
 *                 value: { ok: false, status: 400, message: "El nombre del canal es requerido" }
 *               nombre_largo:
 *                 summary: Nombre de mas de 30 caracteres
 *                 value: { ok: false, status: 400, message: "El nombre del canal no puede superar los 30 caracteres" }
 *               id_invalido:
 *                 summary: ObjectId del canal invalido
 *                 value: { ok: false, status: 400, message: "El id del canal no es valido" }
 *               header_faltante:
 *                 summary: Sin header Authorization
 *                 value: { ok: false, status: 400, message: "Auth header is requered" }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Sin membresia o rol distinto de "owner"/"admin".
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             examples:
 *               sin_membresia:
 *                 summary: No es miembro del workspace
 *                 value: { ok: false, status: 403, message: "No eres miembro de este espacio de trabajo" }
 *               rol_insuficiente:
 *                 summary: Es miembro pero con rol "user"
 *                 value: { ok: false, status: 403, message: "No tienes permisos suficientes para hacer esta operacion" }
 *       404:
 *         description: Canal inexistente, de otro workspace, o workspace inexistente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             examples:
 *               canal_inexistente:
 *                 summary: Canal inexistente o de otro workspace
 *                 value: { ok: false, status: 404, message: "Canal no encontrado" }
 *               workspace_inexistente:
 *                 summary: Workspace inexistente
 *                 value: { ok: false, status: 404, message: "Workspace no encontrado" }
 *       409:
 *         description: Ya existe un canal con ese nombre en el workspace.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               ok: false
 *               status: 409
 *               message: "Ya existe un canal con ese nombre en este espacio de trabajo"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
channel_router.put(
    '/:channel_id',
    authMiddleware,
    workspaceMiddleware(['owner', 'admin']),
    channelMiddleware,
    updateChannel
)

/*
DELETE /api/workspaces/:workspace_id/channels/:channel_id
Solo owner y admin
*/

/**
 * @openapi
 * /api/workspaces/{workspace_id}/channels/{channel_id}:
 *   delete:
 *     tags: [Channels]
 *     summary: Elimina un canal y sus mensajes (owner o admin)
 *     description: |
 *       Elimina el canal del workspace y, en cascada, todos sus mensajes.
 *       Devuelve el canal eliminado.
 *
 *       Requiere header "Authorization: Bearer <jwt>" y rol "owner" o "admin".
 *
 *       Errores posibles:
 *       - 400 "El id del canal no es valido" si el ObjectId es invalido
 *       - 404 "Canal no encontrado" si no existe o pertenece a otro workspace
 *       - 403 si el usuario no es miembro del workspace o su rol no es "owner"/"admin"
 *       - 404 "Workspace no encontrado" si el workspace no existe
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceId'
 *       - $ref: '#/components/parameters/ChannelId'
 *     responses:
 *       200:
 *         description: Canal eliminado (junto con sus mensajes).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChannelDeletedResponse'
 *             example:
 *               ok: true
 *               status: 200
 *               message: "Canal eliminado correctamente"
 *               data:
 *                 channel_deleted:
 *                   _id: "674a1b2c3d4e5f6a7b8c9d0c"
 *                   nombre: "general"
 *                   descripcion: "Canal para anuncios generales"
 *                   fk_id_espacio_trabajo: "674a1b2c3d4e5f6a7b8c9d0e"
 *                   fecha_creacion: "2026-01-15T10:30:00.000Z"
 *                   __v: 0
 *       400:
 *         description: ObjectId del canal invalido o header Authorization invalido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             examples:
 *               id_invalido:
 *                 summary: ObjectId del canal invalido
 *                 value: { ok: false, status: 400, message: "El id del canal no es valido" }
 *               header_faltante:
 *                 summary: Sin header Authorization
 *                 value: { ok: false, status: 400, message: "Auth header is requered" }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Sin membresia o rol distinto de "owner"/"admin".
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             examples:
 *               sin_membresia:
 *                 summary: No es miembro del workspace
 *                 value: { ok: false, status: 403, message: "No eres miembro de este espacio de trabajo" }
 *               rol_insuficiente:
 *                 summary: Es miembro pero con rol "user"
 *                 value: { ok: false, status: 403, message: "No tienes permisos suficientes para hacer esta operacion" }
 *       404:
 *         description: Canal inexistente, de otro workspace, o workspace inexistente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             examples:
 *               canal_inexistente:
 *                 summary: Canal inexistente o de otro workspace
 *                 value: { ok: false, status: 404, message: "Canal no encontrado" }
 *               workspace_inexistente:
 *                 summary: Workspace inexistente
 *                 value: { ok: false, status: 404, message: "Workspace no encontrado" }
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
channel_router.delete(
    '/:channel_id',
    authMiddleware,
    workspaceMiddleware(['owner', 'admin']),
    channelMiddleware,
    deleteChannel
)

/*
GET /api/workspaces/:workspace_id/channels/:channel_id/messages
Traer los mensajes del canal
*/

/**
 * @openapi
 * /api/workspaces/{workspace_id}/channels/{channel_id}/messages:
 *   get:
 *     tags: [Channels]
 *     summary: Lista los mensajes de un canal
 *     description: |
 *       Devuelve los mensajes del canal ordenados por fecha de creacion ascendente,
 *       con el emisor poblado (rol de la membresia y nombre del usuario).
 *       Accesible para cualquier miembro.
 *
 *       Requiere header "Authorization: Bearer <jwt>".
 *
 *       Errores posibles:
 *       - 400 "El id del canal no es valido" si el ObjectId es invalido
 *       - 404 "Canal no encontrado" si no existe o pertenece a otro workspace
 *       - 403 si el usuario no es miembro del workspace
 *       - 404 "Workspace no encontrado" si el workspace no existe
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceId'
 *       - $ref: '#/components/parameters/ChannelId'
 *     responses:
 *       200:
 *         description: Lista de mensajes obtenida (puede ser vacia).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessagesListResponse'
 *             example:
 *               ok: true
 *               status: 200
 *               message: "Mensajes obtenidos correctamente"
 *               data:
 *                 messages:
 *                   - _id: "674a1b2c3d4e5f6a7b8c9d0b"
 *                     contenido: "Hola equipo, este es el primer mensaje"
 *                     fk_id_emisor:
 *                       _id: "674a1b2c3d4e5f6a7b8c9d0f"
 *                       rol: "owner"
 *                       fk_id_usuario:
 *                         _id: "674a1b2c3d4e5f6a7b8c9d11"
 *                         nombre: "Ana"
 *                     fk_id_canal: "674a1b2c3d4e5f6a7b8c9d0c"
 *                     fecha_creacion: "2026-01-15T10:35:00.000Z"
 *                     editado: false
 *                     __v: 0
 *       400:
 *         description: ObjectId del canal invalido o header Authorization invalido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             examples:
 *               id_invalido:
 *                 summary: ObjectId del canal invalido
 *                 value: { ok: false, status: 400, message: "El id del canal no es valido" }
 *               header_faltante:
 *                 summary: Sin header Authorization
 *                 value: { ok: false, status: 400, message: "Auth header is requered" }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: El usuario no es miembro del workspace.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               ok: false
 *               status: 403
 *               message: "No eres miembro de este espacio de trabajo"
 *       404:
 *         description: Canal inexistente, de otro workspace, o workspace inexistente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             examples:
 *               canal_inexistente:
 *                 summary: Canal inexistente o de otro workspace
 *                 value: { ok: false, status: 404, message: "Canal no encontrado" }
 *               workspace_inexistente:
 *                 summary: Workspace inexistente
 *                 value: { ok: false, status: 404, message: "Workspace no encontrado" }
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
channel_router.get(
    '/:channel_id/messages',
    authMiddleware,
    workspaceMiddleware([]),
    channelMiddleware,
    getMessages
)

/*
POST /api/workspaces/:workspace_id/channels/:channel_id/messages
Para poder crear mensajes de prueba (despues lo usamos desde el front)
*/

/**
 * @openapi
 * /api/workspaces/{workspace_id}/channels/{channel_id}/messages:
 *   post:
 *     tags: [Channels]
 *     summary: Envia un mensaje a un canal
 *     description: |
 *       Crea un mensaje en el canal asociado a la membresia del usuario autenticado.
 *       Accesible para cualquier miembro.
 *
 *       Requiere header "Authorization: Bearer <jwt>".
 *
 *       Errores posibles (400):
 *       - "El contenido del mensaje es requerido" si falta o esta vacio
 *       - "El mensaje no puede superar los 2000 caracteres"
 *       - "El id del canal no es valido" (ObjectId invalido)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceId'
 *       - $ref: '#/components/parameters/ChannelId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Contenido del mensaje (se recorta con trim, max 2000 caracteres)
 *                 example: "Hola equipo, este es el primer mensaje"
 *     responses:
 *       201:
 *         description: Mensaje enviado correctamente (devuelve el mensaje creado con su autor).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageSentResponse'
 *             example:
 *               ok: true
 *               status: 201
 *               message: "Mensaje enviado correctamente"
 *               data:
 *                 message_created:
 *                   _id: "674a1b2c3d4e5f6a7b8c9d0b"
 *                   contenido: "Hola equipo"
 *                   fk_id_emisor:
 *                     _id: "674a1b2c3d4e5f6a7b8c9d0f"
 *                     rol: "owner"
 *                     fk_id_usuario:
 *                       _id: "674a1b2c3d4e5f6a7b8c9d11"
 *                       nombre: "Ana"
 *                   fk_id_canal: "674a1b2c3d4e5f6a7b8c9d0c"
 *                   fecha_creacion: "2026-01-15T10:35:00.000Z"
 *                   editado: false
 *       400:
 *         description: Contenido invalido, ObjectId invalido o header Authorization invalido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             examples:
 *               contenido_faltante:
 *                 summary: Falta el contenido del mensaje
 *                 value: { ok: false, status: 400, message: "El contenido del mensaje es requerido" }
 *               contenido_largo:
 *                 summary: Mensaje de mas de 2000 caracteres
 *                 value: { ok: false, status: 400, message: "El mensaje no puede superar los 2000 caracteres" }
 *               id_invalido:
 *                 summary: ObjectId del canal invalido
 *                 value: { ok: false, status: 400, message: "El id del canal no es valido" }
 *               header_faltante:
 *                 summary: Sin header Authorization
 *                 value: { ok: false, status: 400, message: "Auth header is requered" }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: El usuario no es miembro del workspace.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               ok: false
 *               status: 403
 *               message: "No eres miembro de este espacio de trabajo"
 *       404:
 *         description: Canal inexistente, de otro workspace, o workspace inexistente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             examples:
 *               canal_inexistente:
 *                 summary: Canal inexistente o de otro workspace
 *                 value: { ok: false, status: 404, message: "Canal no encontrado" }
 *               workspace_inexistente:
 *                 summary: Workspace inexistente
 *                 value: { ok: false, status: 404, message: "Workspace no encontrado" }
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
channel_router.post(
    '/:channel_id/messages',
    authMiddleware,
    workspaceMiddleware([]),
    channelMiddleware,
    sendMessage
)

export default channel_router