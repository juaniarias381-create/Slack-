/*
Los controllers son la capa de entrada HTTP: leen la request (body/params),
llaman a la capa de servicios (logica de negocio) y formatean la respuesta HTTP
*/

import {
    getChannelsByWorkspaceId,
    createChannel as createChannelService,
    getChannelById as getChannelByIdService,
    getMessagesByChannelId,
    sendMessageToChannel,
    updateChannel as updateChannelService,
    deleteChannelWithMessages
} from '../services/channel.services.js'


/*
(Authentified) GET /api/workspaces/:workspace_id/channels
    Traer la lista de canales del workspace. El middleware ya valido que el
    usuario sea miembro e inyecto el workspace en request.workspace
*/
export async function getChannels (request, response) {
    const channels = await getChannelsByWorkspaceId(request.workspace._id)

    return response.status(200).send({
        ok: true,
        status: 200,
        message: 'Canales obtenidos correctamente',
        data: {
            channels
        }
    })
}


/*
(Authentified) POST /api/workspaces/:workspace_id/channels
    Crear un canal en el workspace (solo owner y admin). La descripcion es opcional
*/
export async function createChannel (request, response) {
    const { name, description } = request.body

    const channel_created = await createChannelService(
        name,
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


/*
(Authentified) GET /api/workspaces/:workspace_id/channels/:channel_id
    Traer los datos del canal. El middleware ya valido que exista y que
    pertenezca al workspace de la URL
*/
export async function getChannelById (request, response) {
    const channel = await getChannelByIdService(request.channel)

    return response.status(200).send({
        ok: true,
        status: 200,
        message: 'Canal obtenido correctamente',
        data: {
            channel
        }
    })
}


/*
(Authentified) GET /api/workspaces/:workspace_id/channels/:channel_id/messages
    Traer los mensajes del canal
*/
export async function getMessages (request, response) {
    const messages = await getMessagesByChannelId(request.channel._id)

    return response.status(200).send({
        ok: true,
        status: 200,
        message: 'Mensajes obtenidos correctamente',
        data: {
            messages
        }
    })
}


/*
(Authentified) POST /api/workspaces/:workspace_id/channels/:channel_id/messages
    Enviar un mensaje al canal. La respuesta incluye el mensaje con su autor
    para que el front pueda agregarlo sin recargar
*/
export async function sendMessage (request, response) {
    const { content } = request.body

    const message_created = await sendMessageToChannel(
        content,
        request.membership._id,
        request.channel._id
    )

    return response.status(201).send({
        ok: true,
        status: 201,
        message: 'Mensaje enviado correctamente',
        data: {
            message_created
        }
    })
}


/*
(Authentified) PUT /api/workspaces/:workspace_id/channels/:channel_id
    Actualizar nombre y descripcion del canal (solo owner y admin)
*/
export async function updateChannel (request, response) {
    const { name, description } = request.body

    const channel_updated = await updateChannelService(
        request.workspace._id,
        request.channel._id,
        name,
        description
    )

    return response.status(200).send({
        ok: true,
        status: 200,
        message: 'Canal actualizado correctamente',
        data: {
            channel_updated
        }
    })
}


/*
(Authentified) DELETE /api/workspaces/:workspace_id/channels/:channel_id
    Eliminar el canal y sus mensajes (solo owner y admin)
*/
export async function deleteChannel (request, response) {
    const channel_deleted = await deleteChannelWithMessages(request.channel._id)

    return response.status(200).send({
        ok: true,
        status: 200,
        message: 'Canal eliminado correctamente',
        data: {
            channel_deleted
        }
    })
}
