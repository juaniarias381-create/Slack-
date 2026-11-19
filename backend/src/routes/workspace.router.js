import express from 'express'
import authMiddleware from '../middlewares/auth.middleware.js'
import workspaceMiddleware from '../middlewares/workspace.middleware.js'
import channel_router from './channels.router.js'
import {
    getUserWorkspaces,
    createWorkspace,
    getWorkspaceById,
    getWorkspaceMembers,
    deleteWorkspace,
    updateWorkspace
} from '../controllers/workspace.controller.js'

const workspace_router = express.Router()


/*
(Authentified) GET /api/workspace
    Traer la lista de espacios de trabajo asocidadas a ese usuario (basicamente sus membresias), con el rol de membresia en cada espacio de trabajo
*/
/**
 * @openapi
 * /api/workspaces:
 *   get:
 *     tags: [Workspaces]
 *     summary: Lista los workspaces del usuario autenticado
 *     description: |
 *       Devuelve todos los espacios de trabajo donde el usuario tiene membresia,
 *       cada uno con su lista completa de miembros (nombre y rol).
 *
 *       Requiere header "Authorization: Bearer <jwt>".
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Workspaces del usuario (puede ser una lista vacia).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkspacesListResponse'
 *             example:
 *               ok: true
 *               status: 200
 *               message: "Obtenidos todos los datos"
 *               data:
 *                 workspaces:
 *                   - _id: "674a1b2c3d4e5f6a7b8c9d0e"
 *                     nombre: "Equipo Frontend"
 *                     fecha_creacion: "2026-01-15T10:30:00.000Z"
 *                     members:
 *                       - member_id: "674a1b2c3d4e5f6a7b8c9d0f"
 *                         nombre: "Ana"
 *                         rol: "owner"
 *                       - member_id: "674a1b2c3d4e5f6a7b8c9d10"
 *                         nombre: "Luis"
 *                         rol: "user"
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
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
workspace_router.get(
    '/',
    authMiddleware,
    getUserWorkspaces
)

/**
 * @openapi
 * /api/workspaces:
 *   post:
 *     tags: [Workspaces]
 *     summary: Crea un workspace
 *     description: |
 *       Crea un espacio de trabajo y asigna al usuario autenticado una membresia
 *       con rol "owner".
 *
 *       Requiere header "Authorization: Bearer <jwt>".
 *
 *       Nota: el backend NO valida que "name" venga presente (Mongoose lo rechaza
 *       con error 500 si falta, porque es required en el schema).
 *     security:
 *       - bearerAuth: []
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
 *                 description: Nombre del workspace (mapea al campo "nombre" del modelo, max 30 caracteres)
 *                 example: "Equipo Frontend"
 *               description:
 *                 type: string
 *                 maxLength: 200
 *                 description: Descripcion opcional del workspace
 *                 example: "Workspace del equipo de frontend"
 *     responses:
 *       201:
 *         description: Workspace creado con el usuario como owner.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkspaceCreatedResponse'
 *             example:
 *               ok: true
 *               status: 201
 *               message: "Por ahora todo bien"
 *               data:
 *                 workspace_created:
 *                   _id: "674a1b2c3d4e5f6a7b8c9d0e"
 *                   nombre: "Equipo Frontend"
 *                   description: "Workspace del equipo de frontend"
 *                   fecha_creacion: "2026-01-15T10:30:00.000Z"
 *                   __v: 0
 *                 owner_membership:
 *                   _id: "674a1b2c3d4e5f6a7b8c9d0f"
 *                   fk_id_usuario: "674a1b2c3d4e5f6a7b8c9d11"
 *                   fk_id_espacio_trabajo: "674a1b2c3d4e5f6a7b8c9d0e"
 *                   rol: "owner"
 *                   fecha_creacion: "2026-01-15T10:30:00.000Z"
 *                   activo: true
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
 *       500:
 *         description: 'Error inesperado (por ejemplo, name ausente: el modelo lo requiere).'
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
workspace_router.post(
    '/',
    authMiddleware,
    createWorkspace
)

/**
 * @openapi
 * /api/workspaces/{workspace_id}:
 *   get:
 *     tags: [Workspaces]
 *     summary: Obtiene el detalle de un workspace
 *     description: |
 *       Devuelve el workspace si el usuario autenticado es miembro.
 *
 *       Requiere header "Authorization: Bearer <jwt>".
 *
 *       Errores posibles:
 *       - 404 "Workspace no encontrado" si el id no existe
 *       - 403 "No eres miembro de este espacio de trabajo" si no tiene membresia
 *       - 500 si el id no es un ObjectId valido de MongoDB (CastError de Mongoose)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceId'
 *     responses:
 *       200:
 *         description: Workspace encontrado y usuario miembro.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkspaceDetailResponse'
 *             example:
 *               ok: true
 *               status: 200
 *               message: "Workspace obtenido correctamente"
 *               data:
 *                 workspace_selected:
 *                   _id: "674a1b2c3d4e5f6a7b8c9d0e"
 *                   nombre: "Equipo Frontend"
 *                   description: "Workspace del equipo de frontend"
 *                   fecha_creacion: "2026-01-15T10:30:00.000Z"
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
workspace_router.get(
    '/:workspace_id',
    authMiddleware,
    workspaceMiddleware([]),
    getWorkspaceById
)

/*
(Todos los miembros) GET /api/workspaces/:workspace_id/members
    Traer la lista de miembros del espacio de trabajo
*/

/**
 * @openapi
 * /api/workspaces/{workspace_id}/members:
 *   get:
 *     tags: [Workspaces]
 *     summary: Lista los miembros de un workspace
 *     description: |
 *       Devuelve nombre, email y rol de cada miembro del workspace.
 *       Accesible para cualquier miembro (sin importar el rol).
 *
 *       Requiere header "Authorization: Bearer <jwt>".
 *
 *       Errores posibles:
 *       - 404 "Workspace no encontrado" si el id no existe
 *       - 403 "No eres miembro de este espacio de trabajo" si no tiene membresia
 *       - 500 si el id no es un ObjectId valido de MongoDB (CastError de Mongoose)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceId'
 *     responses:
 *       200:
 *         description: Lista de miembros obtenida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MembersListResponse'
 *             example:
 *               ok: true
 *               status: 200
 *               message: "Miembros obtenidos correctamente"
 *               data:
 *                 members:
 *                   - member_id: "674a1b2c3d4e5f6a7b8c9d0f"
 *                     nombre: "Ana"
 *                     email: "ana@example.com"
 *                     rol: "owner"
 *                   - member_id: "674a1b2c3d4e5f6a7b8c9d10"
 *                     nombre: "Luis"
 *                     email: "luis@example.com"
 *                     rol: "user"
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
workspace_router.get(
    '/:workspace_id/members',
    authMiddleware,
    workspaceMiddleware([]),
    getWorkspaceMembers
)

/**
 * @openapi
 * /api/workspaces/{workspace_id}:
 *   delete:
 *     tags: [Workspaces]
 *     summary: Elimina un workspace (solo owner)
 *     description: |
 *       Elimina el espacio de trabajo y, en cascada, todas sus membresias.
 *       Devuelve el workspace eliminado.
 *
 *       Requiere header "Authorization: Bearer <jwt>" y rol "owner".
 *
 *       Errores posibles:
 *       - 404 "Workspace no encontrado" si el id no existe
 *       - 403 si no es miembro o su rol no es "owner"
 *       - 500 si el id no es un ObjectId valido de MongoDB (CastError de Mongoose)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceId'
 *     responses:
 *       200:
 *         description: Workspace eliminado (junto con sus membresias).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkspaceDeletedResponse'
 *             example:
 *               ok: true
 *               status: 200
 *               message: "Workspace eliminado correctamente"
 *               data:
 *                 workspace_deleted:
 *                   _id: "674a1b2c3d4e5f6a7b8c9d0e"
 *                   nombre: "Equipo Frontend"
 *                   description: "Workspace del equipo de frontend"
 *                   fecha_creacion: "2026-01-15T10:30:00.000Z"
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
 *       403:
 *         description: Sin membresia o rol distinto de "owner".
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             examples:
 *               sin_membresia:
 *                 summary: No es miembro del workspace
 *                 value: { ok: false, status: 403, message: "No eres miembro de este espacio de trabajo" }
 *               rol_insuficiente:
 *                 summary: Es miembro pero no owner
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
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
workspace_router.delete(
    '/:workspace_id',
    authMiddleware,
    workspaceMiddleware(['owner']),
    deleteWorkspace
)

/**
 * @openapi
 * /api/workspaces/{workspace_id}:
 *   put:
 *     tags: [Workspaces]
 *     summary: Actualiza nombre y descripcion de un workspace (owner o admin)
 *     description: |
 *       Actualiza el nombre y la descripcion del espacio de trabajo.
 *       Ambos campos son obligatorios.
 *
 *       Requiere header "Authorization: Bearer <jwt>" y rol "owner" o "admin".
 *
 *       Errores posibles:
 *       - 400 "name y description son campos requeridos" si falta alguno
 *       - 404 "Workspace no encontrado" si el id no existe
 *       - 403 si no es miembro o su rol no es "owner"/"admin"
 *       - 500 si el id no es un ObjectId valido de MongoDB (CastError de Mongoose)
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
 *             required: [name, description]
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 30
 *                 description: Nuevo nombre del workspace (mapea a "nombre")
 *                 example: "Equipo Frontend v2"
 *               description:
 *                 type: string
 *                 maxLength: 200
 *                 example: "Nueva descripcion del workspace"
 *     responses:
 *       200:
 *         description: Workspace actualizado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkspaceUpdatedResponse'
 *             example:
 *               ok: true
 *               status: 200
 *               message: "Workspace actualizado correctamente"
 *               data:
 *                 workspace_updated:
 *                   _id: "674a1b2c3d4e5f6a7b8c9d0e"
 *                   nombre: "Equipo Frontend v2"
 *                   description: "Nueva descripcion del workspace"
 *                   fecha_creacion: "2026-01-15T10:30:00.000Z"
 *                   __v: 0
 *       400:
 *         description: Campos requeridos faltantes o header Authorization invalido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             examples:
 *               campos_faltantes:
 *                 summary: Falta name o description
 *                 value: { ok: false, status: 400, message: "name y description son campos requeridos" }
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
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
workspace_router.put(
    '/:workspace_id',
    authMiddleware,
    workspaceMiddleware(['owner', 'admin']),
    updateWorkspace
)


/*
Crear los endpoints

EJERCITACION PARA AHORA
- (owner) DELETE /api/workspace/:workspace_id => Elimina espacio de trabajo (HECHO)
- (owner, admin) PUT /api/workspace/:workspace_id => Actualizar nombre/descripcion del espacio de trabajo

Tarea:
- (todos) get /api/workspace/:workspace_id/members
- (owner, admin) DELETE /api/workspace/:workspace_id/members/:member_id
- (owner, admin) POST /api/workspace/:workspace_id/members/invite
    body: email (el email del usuario a invitar)
    - Revisar que el rol con el que se crea sea 'admin' o 'user'
    - Revisar que el usuario a invitar exista
    - Revisar que no este ya agregado al workspace (que tenga una membresia)
    - Crear la membresia con una propiedad 'invitacion_aceptada': false
    - Enviar un mail con un link para "aceptar invitacion" (debe tener una expiracion y debe enviar un token)
        - Ese link hara un GET hacia /api/workspace/:workspace_id/members/accept-invite/:invitation_token

- (todos) Unauthentified /api/workspace/:workspace_id/members/accept-invite/:invitation_token
    - Verifica que el invitation_token sea valido y edita la membersia para marcar que lo acepto
*/




workspace_router.use(
    '/:workspace_id/channels',
    channel_router
)

export default workspace_router


/*
/api/workspace/:workspace_id/channels

*/
