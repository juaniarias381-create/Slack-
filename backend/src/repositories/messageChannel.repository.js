import MessageChannel from "../models/messageChannel.model.js"

class MessageChannelRepository {
    async create(contenido, member_id, channel_id) {
        await MessageChannel.create({
            contenido: contenido,
            fk_id_emisor: member_id,
            fk_id_canal: channel_id
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
        const result = await MessageChannel.find({ fk_id_canal: channel_id })
        console.log(result)
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
}

const message_channel_repository = new MessageChannelRepository()
export default message_channel_repository
