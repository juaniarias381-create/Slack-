import DirectMessage from "../models/directMessage.model.js"

class DirectMessageRepository {
    async create(contenido, emisor_id, receptor_id) {
        await DirectMessage.create({
            contenido: contenido,
            fk_id_emisor: emisor_id,
            fk_id_receptor: receptor_id
        })
    }

    async deleteById(message_id) {
        const result = await DirectMessage.findByIdAndDelete(message_id)
        console.log(result)
    }

    //Opcional: editar mensaje
    async updateById(message_id, content) {
        const result = await DirectMessage.findByIdAndUpdate(message_id, { contenido: content, editado: true })
        console.log(result)
    }

    async getAllMessagesBySearchTerm(search_term) {
        const result = await DirectMessage.find({
            contenido: {
                $regex: search_term,
                $options: 'i'
            }
        })
        console.log(result)
        return result
    }

    async getAllMessagesByDateRange(min_date, max_date) {
        const result = await DirectMessage.find({
            fecha_creacion: {
                $gte: new Date(min_date),
                $lt: new Date(max_date)
            }
        })
        console.log(result)
        return result
    }
}

const direct_message_repository = new DirectMessageRepository()
export default direct_message_repository
