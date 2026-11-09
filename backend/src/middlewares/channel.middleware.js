import mongoose from 'mongoose'
import channel_repository from '../repositories/channel.repository.js'
import ServerError from '../utils/error.util.js'

/* 
Se usa DESPUES de workspaceMiddleware (necesita request.workspace)
Valida que el id sea valido, que el canal exista y que sea de ESTE workspace
*/
async function channelMiddleware(request, response, next) {
    const { channel_id } = request.params

    if (!mongoose.isValidObjectId(channel_id)) {
        throw new ServerError('El id del canal no es valido', 400)
    }

    const channel_selected = await channel_repository.getById(channel_id)

    if (!channel_selected) {
        throw new ServerError('Canal no encontrado', 404)
    }

    //Evita que un miembro lea canales de OTRO workspace cambiando el id en la URL
    if (channel_selected.fk_id_espacio_trabajo.toString() !== request.workspace._id.toString()) {
        throw new ServerError('Canal no encontrado', 404)
    }

    request.channel = channel_selected
    next()
}

export default channelMiddleware 