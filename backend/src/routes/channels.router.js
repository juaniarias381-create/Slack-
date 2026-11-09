import express from 'express'
import authMiddleware from '../middlewares/auth.middleware.js'
import workspaceMiddleware from '../middlewares/workspace.middleware.js'
import channelMiddleware from '../middlewares/channel.middleware.js'
import channel_repository from '../repositories/channel.repository.js'
import member_repository from '../repositories/member.repository.js'
import message_channel_repository from '../repositories/messageChannel.repository.js'
import ServerError from '../utils/error.util.js'

const channel_router = express.Router({ mergeParams: true })

/* 
GET /api/workspaces/:workspace_id/channels
*/
channel_router.get(
    '/',
    authMiddleware,
    workspaceMiddleware([]),
    async (request, response) => {
        const channels = await channel_repository.getAllChannelsByWorkpaceId(request.workspace._id)

        return response.status(200).send({
            ok: true,
            status: 200,
            message: 'Canales obtenidos correctamente',
            data: {
                channels
            }
        })
    }
)

/* 
POST /api/workspaces/:workspace_id/channels
Solo owner y admin
*/
channel_router.post(
    '/',
    authMiddleware,
    workspaceMiddleware(['owner', 'admin']),
    async (request, response) => {
        const { name, description } = request.body

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            throw new ServerError('El nombre del canal es requerido', 400)
        }
        if (name.trim().length > 30) {
            throw new ServerError('El nombre del canal no puede superar los 30 caracteres', 400)
        }

        const channel_created = await channel_repository.createChannel(
            name.trim(),
            description,
            request.workspace._id
        )

        return response.status(201).send({
            ok: true,
            status: 201,
            message: 'Canal creado correctamente',
            data: {
                channel_created
            }
        })
    }
)

/* 
GET /api/workspaces/:workspace_id/channels/:channel_id
Traer los datos del canal
*/
channel_router.get(
    '/:channel_id',
    authMiddleware,
    workspaceMiddleware([]),
    channelMiddleware,
    async (request, response) => {
        return response.status(200).send({
            ok: true,
            status: 200,
            message: 'Canal obtenido correctamente',
            data: {
                channel: request.channel
            }
        })
    }
)

/* 
GET /api/workspaces/:workspace_id/channels/:channel_id/messages
Traer los mensajes del canal
*/
channel_router.get(
    '/:channel_id/messages',
    authMiddleware,
    workspaceMiddleware([]),
    channelMiddleware,
    async (request, response) => {
        const messages = await message_channel_repository.getAllMessagesByChannelId(request.channel._id)

        return response.status(200).send({
            ok: true,
            status: 200,
            message: 'Mensajes obtenidos correctamente',
            data: {
                messages
            }
        })
    }
)

/* 
POST /api/workspaces/:workspace_id/channels/:channel_id/messages
Para poder crear mensajes de prueba (despues lo usamos desde el front)
*/
channel_router.post(
    '/:channel_id/messages',
    authMiddleware,
    workspaceMiddleware([]),
    channelMiddleware,
    async (request, response) => {
        const { content } = request.body

        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            throw new ServerError('El contenido del mensaje es requerido', 400)
        }
        if (content.length > 2000) {
            throw new ServerError('El mensaje no puede superar los 2000 caracteres', 400)
        }

        const membership = await member_repository.getMembershipByUserAndWorkspace(
            request.user.id,
            request.workspace._id
        )

        await message_channel_repository.create(
            content.trim(),
            membership._id,
            request.channel._id
        )

        return response.status(201).send({
            ok: true,
            status: 201,
            message: 'Mensaje enviado correctamente'
        })
    }
)

export default channel_router