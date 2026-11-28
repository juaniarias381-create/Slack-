/*
Capa de servicios de canales

Aca vive la logica de negocio de cada endpoint de canal (los controllers solo
leen la request, llaman al servicio y formatean la respuesta HTTP)

Responsabilidades por servicio:
    - getChannelsByWorkspaceId: trae todos los canales de un workspace
    - createChannel: normaliza nombre/descripcion, chequea duplicado y crea el canal
    - getChannelById: devuelve el canal que ya valido channelMiddleware
    - getMessagesByChannelId: trae los mensajes de un canal con el emisor poblado
    - sendMessageToChannel: normaliza el contenido, crea el mensaje y lo devuelve con su autor
    - updateChannel: valida duplicado y actualiza nombre/descripcion del canal
    - deleteChannelWithMessages: borra los mensajes del canal y despues el canal
*/

import channel_repository from '../repositories/channel.repository.js'
import message_channel_repository from '../repositories/messageChannel.repository.js'
import ServerError from '../utils/error.util.js'
import { normalizeText } from '../utils/validation.util.js'


/*
Normaliza y valida el nombre del canal.
Devuelve el nombre sin espacios sobrantes o lanza un 400.
*/
function normalizeChannelName(name) {
    return normalizeText(
        name,
        {
            field: 'El nombre del canal',
            required: true,
            max_length: 30
        }
    )
}


/*
Normaliza y valida la descripcion del canal.
Una descripcion vacia es valida: el canal puede no tener descripcion.
*/
function normalizeChannelDescription(description) {
    return normalizeText(
        description,
        {
            field: 'La descripcion del canal',
            max_length: 1000,
            allow_newlines: true
        }
    )
}


/*
Normaliza y valida el contenido de un mensaje.
Ademas del limite general, usa un mensaje de error propio para el limite largo.
*/
function normalizeMessageContent(content) {
    return normalizeText(
        content,
        {
            field: 'El contenido del mensaje',
            required: true,
            max_length: 2000,
            allow_newlines: true,
            long_message: 'El mensaje no puede superar los 2000 caracteres'
        }
    )
}


/*
Traer todos los canales de un workspace.
*/
export async function getChannelsByWorkspaceId(workspace_id) {
    return await channel_repository.getAllChannelsByWorkpaceId(workspace_id)
}


/*
Crear un canal dentro de un workspace.

Normalizamos antes de mirar la base: el nombre llega sin espacios sobrantes y
sin caracteres de control. Lo que valida el front es solo comodidad; la regla
real vive aca.

Chequeo explicito de duplicado para devolver un 409 claro. El indice unico del
schema sigue siendo la red de seguridad para requests simultaneos.
*/
export async function createChannel(name, description, workspace_id) {
    const normalized_name = normalizeChannelName(name)
    const normalized_description = normalizeChannelDescription(description)

    const existing_channel = await channel_repository.getByNameInWorkspace(
        workspace_id,
        normalized_name
    )

    if (existing_channel) {
        throw new ServerError(
            'Ya existe un canal con ese nombre en este espacio de trabajo',
            409
        )
    }

    return await channel_repository.createChannel(
        normalized_name,
        normalized_description,
        workspace_id
    )
}


/*
Devuelve el canal que ya valido channelMiddleware: existe y pertenece al
workspace de la URL, asi que no hace falta volver a consultarlo.
*/
export async function getChannelById(channel) {
    return channel
}


/*
Traer los mensajes de un canal, ordenados por fecha de creacion y con el
emisor poblado (rol de la membresia y nombre del usuario).
*/
export async function getMessagesByChannelId(channel_id) {
    return await message_channel_repository.getAllMessagesByChannelId(channel_id)
}


/*
Enviar un mensaje al canal asociado a la membresia del usuario autenticado.

workspaceMiddleware ya garantiza que el usuario es miembro, pero necesitamos
LA membresia (su _id) para saber quien escribio el mensaje.
*/
export async function sendMessageToChannel(content, member_id, channel_id) {
    const normalized_content = normalizeMessageContent(content)

    const message_created = await message_channel_repository.create(
        normalized_content,
        member_id,
        channel_id
    )

    /*
    Devolvemos el mensaje para que el front pueda agregarlo sin recargar.
    El populate es el mismo que usa GET /messages.
    */
    return await message_channel_repository.getById(message_created._id)
}


/*
Actualizar nombre y descripcion de un canal.

El nombre es obligatorio. Si el cliente no manda "description", no la tocamos:
conserva la descripcion actual. Si la manda (aunque sea vacia), la normalizamos
igual que en la creacion y la reemplazamos.

El chequeo de duplicado excluye el propio canal para no dar un falso 409 cuando
solo cambiamos la descripcion. El indice unico sigue siendo la red de seguridad.
*/
export async function updateChannel(workspace_id, channel_id, name, description) {
    const normalized_name = normalizeChannelName(name)

    const existing_channel = await channel_repository.getByNameInWorkspaceExcludingId(
        workspace_id,
        normalized_name,
        channel_id
    )

    if (existing_channel) {
        throw new ServerError(
            'Ya existe un canal con ese nombre en este espacio de trabajo',
            409
        )
    }

    const update_data = {
        nombre: normalized_name
    }

    if (description !== undefined) {
        update_data.descripcion = normalizeChannelDescription(description)
    }

    return await channel_repository.updateById(channel_id, update_data)
}


/*
Eliminar un canal y, en cascada, todos sus mensajes.

Primero los hijos y despues el padre, igual que al eliminar un workspace.
Devuelve el canal eliminado para que el front pueda sacarlo de la lista.
*/
export async function deleteChannelWithMessages(channel_id) {
    await message_channel_repository.deleteAllByChannelIds([channel_id])

    return await channel_repository.deleteById(channel_id)
}
