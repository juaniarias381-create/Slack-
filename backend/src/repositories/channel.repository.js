import Channel from '../models/channel.model.js'

class ChannelRepository {
    async createChannel(name, description, workspace_id) {
        return await Channel.create({
            nombre: name,
            descripcion: description,
            fk_id_espacio_trabajo: workspace_id
        })
    }

    async deleteById(channel_id) {
        return await Channel.findByIdAndDelete(channel_id)
    }

    async updateById(channel_id, name, description) {
        return await Channel.findByIdAndUpdate(
            channel_id,
            {
                nombre: name,
                descripcion: description
            },
            { new: true }
        )
    }

    async getAllChannelsByWorkpaceId(workspace_id) {
        return await Channel.find({ fk_id_espacio_trabajo: workspace_id })
    }

    async getById(channel_id) {
        return await Channel.findById(channel_id)
    }

    /*
    Busca un canal por nombre dentro de UN workspace.
    La collation ignore mayusculas/minusculas, igual que el indice unico:
    "General" y "general" se consideran el mismo nombre.
    */
    async getByNameInWorkspace(workspace_id, name) {
        return await Channel
            .findOne({ fk_id_espacio_trabajo: workspace_id, nombre: name })
            .collation({ locale: 'es', strength: 2 })
    }

    async getAllIdsByWorkspaceId(workspace_id) {
        return await Channel.distinct('_id', { fk_id_espacio_trabajo: workspace_id })
    }

    async deleteAllByWorkspaceId(workspace_id) {
        return await Channel.deleteMany({ fk_id_espacio_trabajo: workspace_id })
    }
}

const channel_repository = new ChannelRepository()
export default channel_repository
