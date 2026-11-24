import mongoose from "mongoose";
import { WORKSPACE_COLLECTION_NAME } from "./workspace.model.js";

const channelSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true,
            maxlength: 30
        },
        descripcion: {
            type: String,
            maxlength: 1000
        },
        fk_id_espacio_trabajo: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: WORKSPACE_COLLECTION_NAME
        },
        fecha_creacion: {
            type: Date,
            default: Date.now
        }
    }
)

/*
Un workspace no puede tener dos canales con el mismo nombre.
La collation hace la comparacion case-insensitive ("General" == "general").
Si ya existen duplicados en la base, este indice no se podra crear:
en ese caso hay que limpiar los duplicados antes de reiniciar.
*/
channelSchema.index(
    { fk_id_espacio_trabajo: 1, nombre: 1 },
    {
        unique: true,
        collation: { locale: 'es', strength: 2 }
    }
)

export const CHANNEL_COLLECTION_NAME = 'Canal'
const Channel = mongoose.model(CHANNEL_COLLECTION_NAME, channelSchema)
export default Channel