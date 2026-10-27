import express from 'express'
import workspace_repository from '../repositories/workspace.repository.js'
import member_repository from '../repositories/member.repository.js'
import authMiddleware from '../middlewares/auth.middleware.js'
import channel_router from './channels.router.js'
import ServerError from '../utils/error.util.js'
import workspaceMiddleware from '../middlewares/workspace.middleware.js'
import jwt from 'jsonwebtoken'
import ENVIRONMENT from '../config/environment.config.js'
import mailer_transporter from '../config/mailer.config.js'
import user_repository from '../repositories/user.repository.js'
const workspace_router = express.Router()

workspace_router.get(
    '/',
    authMiddleware,
    async (request, response) => {

        const workspaces_obtenidos = await member_repository.getAllWorkspaceByUserId
        (request.user.id)
        return response.status(200).send({
            ok: true,
            message: "Obtenidos todos los datos",
            status: 200,
            data: {
                workspaces: workspaces_obtenidos
            }
        })
    }
)








/* 
Route /api/workspaces
    POST / => Crear espacio de trabajo y membresia de creador
    GET / => Obtener lista de espacios de trabajo asociados a un usuario (Buscamos las membresias asociadas a un cierto usuario)
    GET /:workspace_id => Obtener los datos de un cierto espacio de trabajo
*/


workspace_router.post(
    '/',
    authMiddleware,
    async (request, response) => {
        //Quien carancho quiere hacer esta operacion ?????
        console.log('[CREATE WORKSPACE]', request.user)
        const { name, description } = request.body


        console.log('BODY:', request.body)
        const workspace_created = await workspace_repository.createWorkspace(name, description)
        const owner_membership = await member_repository.create(
            request.user.id,
            workspace_created._id,
            'owner'
        )

        return response.status(201).send(
            {
                ok: true,
                status: 201,
                message: "Por ahora todo bien",
                data: {
                    workspace_created,
                    owner_membership
                }
            }
        )
    }
)

workspace_router.get(
    '/:workspace_id',
    authMiddleware,
    workspaceMiddleware([]),
    async (request, response) => {


        return response.status(200).send({
            ok: true,
            message: "Workspace obtenido correctamente",
            status: 200,
            data: {
                workspace_selected: request.workspace
            }
        })

    }
)

workspace_router.delete(
        '/:workspace_id',
        authMiddleware,
        workspaceMiddleware(['owner']),
        async (request, response) => {
            const { workspace_id } = request.params
            await member_repository.deleteAllMembershipsByWorkspaceId(workspace_id)
            await workspace_repository.deleteById(workspace_id)
            return response.status(200).send({
                ok: true,
                status: 200,
                message: 'Espacio de trabajo eliminado correctamente'
            })
        }
    )

workspace_router.put(
    '/:workspace_id',
    authMiddleware,
    workspaceMiddleware(['owner', 'admin']),
    async (request, response) => {
        const { workspace_id } = request.params
        const { name, description } = request.body
        const workspace_updated = await workspace_repository.updateById(workspace_id, { nombre: name,  description })
        return response.status(200).send({
            ok: true,
            message: "Workspace actualizado correctamente",
            status: 200,
            data: {
                workspace_updated
            }
        })
    }
)



// (owner, admin) POST /api/workspaces/:workspace_id/members/invite
workspace_router.post(
    '/:workspace_id/members/invite',
    authMiddleware,
    workspaceMiddleware(['owner', 'admin']),
    async (request, response) => {
        const { workspace_id } = request.params
        const { email, role } = request.body

        if (!email || !role) {
            throw new ServerError('Email y role son requeridos', 400)
        }

        if (role !== 'admin' && role !== 'user') {
            throw new ServerError("El rol debe ser 'admin' o 'user'", 400)
        }

        // El usuario a invitar tiene que existir
        const user_to_invite = await user_repository.getByEmail(email)
        if (!user_to_invite) {
            throw new ServerError('El usuario a invitar no existe', 404)
        }

        // No puede tener ya una membresia
        const membership_found = await member_repository.getMembershipByUserAndWorkspace(
            user_to_invite._id,
            workspace_id
        )
        if (membership_found) {
            throw new ServerError('El usuario ya es miembro de este espacio de trabajo', 400)
        }

        // Creamos la membresia con la invitacion sin aceptar
        const new_membership = await member_repository.create(
            user_to_invite._id,
            workspace_id,
            role,
            false
        )

        // Token que vence en 7 dias
        const invitation_token = jwt.sign(
            { membership_id: new_membership._id },
            ENVIRONMENT.JWT_SECRET_KEY,
            { expiresIn: '7d' }
        )

        await mailer_transporter.sendMail({
            to: email,
            from: ENVIRONMENT.GMAIL_USER,
            subject: 'Te invitaron a un espacio de trabajo',
            html: `
                <body>
                    <h1>Tenes una invitacion</h1>
                    <p>Te invitaron a unirte a ${request.workspace.nombre}</p>
                    <a href='${ENVIRONMENT.URL_BACKEND}/api/workspaces/${workspace_id}/members/accept-invite/${invitation_token}'>
                        Click aqui para aceptar la invitacion
                    </a>
                </body>
            `
        })

        return response.status(201).send({
            ok: true,
            status: 201,
            message: 'Invitacion enviada correctamente'
        })
    }
)

// GET /api/workspaces/:workspace_id/members/accept-invite/:invitation_token
workspace_router.get(
    '/:workspace_id/members/accept-invite/:invitation_token',
    async (request, response) => {
        const { invitation_token } = request.params

        // Verificar el token (si expiro o es falso, jwt.verify tira error)
        const { membership_id } = jwt.verify(
            invitation_token,
            ENVIRONMENT.JWT_SECRET_KEY
        )

        const membership = await member_repository.getById(membership_id)
        if (!membership) {
            throw new ServerError('La invitacion no existe', 404)
        }

        if (membership.invitacion_aceptada) {
            throw new ServerError('La invitacion ya fue aceptada', 400)
        }

        await member_repository.acceptInvitationById(membership_id)

        return response.status(200).send({
            ok: true,
            status: 200,
            message: 'Invitacion aceptada correctamente'
        })
    }
)
/* 
Crear los endpoints 

- (owner) DELETE /api/workspace/:workspace_id => Elimina espacio de trabajo
- (owner, admin) PUT /api/workspace/:workspace_id => Actualizar nombre/descripcion del espacio de trabajo

Tarea:
- (todos) get /api/workspace/:workspace_id/members
- (owner, admin) DELETE /api/workspace/:workspace_id/members/:member_id
- (owner, admin) POST /api/workspace/:workspace_id/members/invite
*/



/* workspace_router.use(
    '/:workspace_id/channels', 
    channel_router
) */

export default workspace_router


/* 
/api/workspace/:workspace_id/channels

*/