/*
Middleware global de logging de consultas.

Se registra AL INICIO de la cadena de middlewares (main.js) pero escribe el log
cuando la respuesta ya se envio (evento 'finish'), porque recien ahi sabemos:
    - el status de respuesta
    - el tiempo total de ejecucion
    - el user_id (authMiddleware corre por-router y ya habra poblado request.user)

El body se registra SOLO en consultas POST/PUT/DELETE y va encriptado con
AES-256-GCM (ver utils/logger-crypto.util.js). Las rutas sensibles
(login, registro y reseteo de password) NUNCA registran body ni siquiera
encriptado, porque contienen credenciales y tokens de activacion.
*/
import RequestLog from "../models/requestLog.model.js"
import { encryptRequestBody } from "../utils/logger-crypto.util.js"

//Rutas que por seguridad nunca registran el body, ni siquiera encriptado.
//Se matchea por prefijo de URL para cubrir rutas con params
//(ej: /api/auth/reset-password/:reset_password_token)
const RUTAS_SIN_BODY = [
    '/api/auth/register',
    '/api/auth/login',
    '/api/auth/forgot-password',
    '/api/auth/reset-password'
]

function body_debe_registrarse(request) {
    //Solo los metodos con body que escribe datos
    if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
        return false
    }

    //Rutas sensibles: excluidas por seguridad
    if (RUTAS_SIN_BODY.some(ruta => request.originalUrl.startsWith(ruta))) {
        return false
    }

    //Si la request no tenia body (ej: POST vacio), nada que registrar
    if (!request.body || Object.keys(request.body).length === 0) {
        return false
    }

    return true
}

function loggerMiddleware(request, response, next) {
    //Marca de tiempo al entrar para calcular la duracion del request
    const inicio = performance.now()

    response.on('finish', () => {
        try {
            const log = new RequestLog({
                fecha_consulta: new Date(),
                metodo: request.method,
                url: request.originalUrl,
                //request.route existe solo si la request matcheo una ruta definida
                //(si no matcheo ninguna, ej: 404, guardamos la URL como endpoint)
                endpoint: (request.route?.path)
                    ? request.baseUrl + request.route.path
                    : request.originalUrl,
                ip: request.ip,
                status_respuesta: response.statusCode,
                tiempo_ejecucion_ms: Math.round(performance.now() - inicio),
                user_id: request.user?.id ?? null,
                body_encriptado: body_debe_registrarse(request)
                    ? encryptRequestBody(request.body)
                    : null
            })

            log.save().catch(error => {
                console.error('[LoggerMiddleware]: no se pudo guardar el log de la request', error)
            })

            //Respaldo en consola (en Vercel los console.log quedan en los logs de plataforma)
            console.log('[REQUEST]', {
                fecha_consulta: log.fecha_consulta,
                metodo: log.metodo,
                url: log.url,
                endpoint: log.endpoint,
                ip: log.ip,
                status_respuesta: log.status_respuesta,
                tiempo_ejecucion_ms: log.tiempo_ejecucion_ms,
                user_id: log.user_id
            })
        }
        catch (error) {
            console.error('[LoggerMiddleware]: error construyendo el log de la request', error)
        }
    })

    next()
}

export default loggerMiddleware
