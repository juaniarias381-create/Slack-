import mongoose from "mongoose"

/*
Modelo de log de consultas HTTP del servidor.
Registra cada request que llega al servidor. El body SOLO se guarda en
consultas POST/PUT/DELETE y va encriptado con AES-256-GCM usando
LOGGER_PRIVATE_KEY. Las rutas sensibles (login, registro y reseteo de
password) nunca registran body.

Campos:
    fecha_consulta:       timestamp de cuando llego la request
    metodo:               metodo HTTP (GET, POST, PUT, DELETE...)
    url:                  URL completa consultada (incluye query params)
    endpoint:             patron de la ruta que matcheo (ej: /api/users/:user_id)
    ip:                   IP real del cliente (requiere 'trust proxy' detras de un proxy)
    status_respuesta:     codigo HTTP que se le respondio al cliente
    tiempo_ejecucion_ms:  duracion total del request en milisegundos
    user_id:              id del usuario autenticado; null si la ruta es publica
    body_encriptado:      body encriptado ("iv:tag:data"); null en GET y rutas sensibles
*/
const requestLogSchema = new mongoose.Schema(
    {
        fecha_consulta: {
            type: Date,
            required: true
        },
        metodo: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
        endpoint: {
            type: String,
            required: true
        },
        ip: {
            type: String,
            required: true
        },
        status_respuesta: {
            type: Number,
            required: true
        },
        tiempo_ejecucion_ms: {
            type: Number,
            required: true
        },
        user_id: {
            type: String,
            default: null
        },
        //Body de la request encriptado con AES-256-GCM (LOGGER_PRIVATE_KEY).
        //Solo se registra en POST/PUT/DELETE, salvo rutas sensibles (login,
        //registro y reseteo de password) que nunca guardan body.
        body_encriptado: {
            type: String,
            default: null
        }
    }
)

//Las consultas mas frecuentes van a ser por fecha (ultimos logs, logs de un dia)
requestLogSchema.index({ fecha_consulta: -1 })

export const REQUEST_LOG_COLLECTION_NAME = 'RequestLog'
const RequestLog = mongoose.model(REQUEST_LOG_COLLECTION_NAME, requestLogSchema)

export default RequestLog
