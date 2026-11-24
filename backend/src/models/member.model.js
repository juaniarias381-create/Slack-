import mongoose from 'mongoose'
import { USER_COLLECTION_NAME } from './user.model.js'
import { WORKSPACE_COLLECTION_NAME } from './workspace.model.js'

const member_schema = new mongoose.Schema(
    {
        fk_id_usuario:{
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: USER_COLLECTION_NAME /* La coleccion a la que hacemos referencia */
        },
        fk_id_espacio_trabajo: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: WORKSPACE_COLLECTION_NAME
        },
        rol: {
            type: String,
            enum: ['user', 'admin', 'owner'],
            default: 'user'
        },
        fecha_creacion: {
            type: Date,
            default: Date.now
        },
        activo: {
            type: mongoose.Schema.Types.Boolean,
            default: false
        }
    }
)

/*
Un usuario solo puede tener una membresia por workspace.
Protege contra dos requests simultaneos que intenten agregar al mismo miembro.
*/
member_schema.index(
    { fk_id_usuario: 1, fk_id_espacio_trabajo: 1 },
    { unique: true }
)

export const MEMBER_COLLECTION_NAME = 'Miembro'
const Member = mongoose.model(MEMBER_COLLECTION_NAME, member_schema)
export default Member