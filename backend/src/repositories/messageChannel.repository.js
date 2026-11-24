import MessageChannel from "../models/messageChannel.model.js"

class MessageChannelRepository {
    async create(contenido, member_id, channel_id) {
        return await MessageChannel.create({
            contenido: contenido,
            fk_id_emisor: member_id,
            fk_id_canal: channel_id
        })
    }

    async getById(message_id) {
        return await MessageChannel
            .findById(message_id)
            .populate({
                path: 'fk_id_emisor',
                select: 'rol fk_id_usuario',
                populate: {
                    path: 'fk_id_usuario',
                    select: 'nombre'
                }
            })
    }

    async deleteById(message_id) {
        const result = await MessageChannel.findByIdAndDelete(message_id)
        console.log(result)
    }

    //Opcional: editar mensaje
    async updateById(message_id, content) {
        const result = await MessageChannel.findByIdAndUpdate(message_id, { contenido: content, editado: true })
        console.log(result)
    }

    async getAllMessagesByChannelId(channel_id) {
        const result = await MessageChannel
            .find({ fk_id_canal: channel_id })
            .sort({ fecha_creacion: 1 })
            .populate({
                path: 'fk_id_emisor',
                select: 'rol fk_id_usuario',
                populate: {
                    path: 'fk_id_usuario',
                    select: 'nombre'
                }
            })
        return result
    }

    //Busca mensajes por contenido
    async getAllMessagesBySearchTerm(search_term) {
        const result = await MessageChannel.find({
            contenido: {
                $regex: search_term,
                $options: 'i' //No diferencia entre mayus y minus
            }
        })
        console.log(result)
        return result
    }

    async getAllMessagesByDateRange(min_date, max_date) {
        const result = await MessageChannel.find({
            fecha_creacion: {
                $gte: new Date(min_date),
                $lt: new Date(max_date)
            }
        })
        console.log(result)
        return result
    }

    async getAllMessagesByMemberId(member_id) {
        const result = await MessageChannel.find({ fk_id_emisor: member_id })
        console.log(result)
        return result
    }

    // Se usa al eliminar un workspace: primero sacamos los mensajes de sus
    // canales para no dejar documentos huerfanos apuntando a canales borrados.
    async deleteAllByChannelIds(channel_ids) {
        return await MessageChannel.deleteMany({ fk_id_canal: { $in: channel_ids } })
    }
}

const message_channel_repository = new MessageChannelRepository()
export default message_channel_repository
