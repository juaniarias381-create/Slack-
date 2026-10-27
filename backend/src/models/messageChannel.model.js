import mongoose from "mongoose"
import { MEMBER_COLLECTION_NAME } from './member.model.js'
import { CHANNEL_COLLECTION_NAME } from './channel.model.js'

const messageChannelSchema = new mongoose.Schema(
    {
        contenido: {
            type: String,
            required: true
        },
        fk_id_emisor: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: MEMBER_COLLECTION_NAME
        },
        fk_id_canal: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: CHANNEL_COLLECTION_NAME
        },
        fecha_creacion: {
            type: Date,
            default: Date.now
        },
        //Opcional: para saber si el mensaje fue editado
        editado: {
            type: Boolean,
            default: false
        }
    }
)

export const MESSAGE_CHANNEL_COLLECTION_NAME = 'MensajeCanal'
const MessageChannel = mongoose.model(MESSAGE_CHANNEL_COLLECTION_NAME, messageChannelSchema)
export default MessageChannel
