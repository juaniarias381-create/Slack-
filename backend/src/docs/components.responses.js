/*
Respuestas de error reutilizables de la documentacion OpenAPI

Estas respuestas son las que generan los middlewares y el manejo centralizado de errores:
    - auth.middleware.js      -> 400 (header faltante/malformado), 401 (token invalido/expirado)
    - workspace.middleware.js -> 404 (workspace inexistente), 403 (sin membresia o rol insuficiente)
    - channel.middleware.js   -> 400 (ObjectId invalido), 404 (canal inexistente o de otro workspace)
    - error.middleware.js     -> 500 (error inesperado)
    - main.js (conexion DB)   -> 503 (MongoDB inaccesible)

Cada endpoint detalla en su descripcion los casos concretos que aplican.
*/

export default {

    BadRequest: {
        description: `Solicitud invalida. Casos posibles segun el endpoint:
- Faltan campos obligatorios en el body
- Formato de email incorrecto
- ObjectId invalido en un path param
- Header Authorization faltante o malformado`,
        content: {
            'application/json': {
                schema: { $ref: '#/components/schemas/ErrorEnvelope' },
                examples: {
                    campos_faltantes: {
                        summary: 'Campo obligatorio faltante',
                        value: { ok: false, status: 400, message: 'Email and password are required' },
                    },
                    email_invalido: {
                        summary: 'Formato de email incorrecto',
                        value: { ok: false, status: 400, message: 'Email is incorrect' },
                    },
                    header_faltante: {
                        summary: 'Header Authorization faltante',
                        value: { ok: false, status: 400, message: 'Auth header is requered' },
                    },
                    header_malformado: {
                        summary: 'Header Authorization malformado',
                        value: { ok: false, status: 400, message: 'Auth header is malformed' },
                    },
                    id_invalido: {
                        summary: 'ObjectId invalido',
                        value: { ok: false, status: 400, message: 'El id del canal no es valido' },
                    },
                },
            },
        },
    },

    Unauthorized: {
        description: 'No autenticado. El token JWT es invalido, esta malfirmado o expiro (se devuelve el mismo mensaje en todos los casos).',
        content: {
            'application/json': {
                schema: { $ref: '#/components/schemas/ErrorEnvelope' },
                example: { ok: false, status: 401, message: 'Auth token is invalid!' },
            },
        },
    },

    Forbidden: {
        description: `Prohibido. Casos posibles segun el endpoint:
- El usuario no es miembro del workspace
- El rol del usuario no es suficiente para la operacion
- El usuario esta desactivado de la plataforma`,
        content: {
            'application/json': {
                schema: { $ref: '#/components/schemas/ErrorEnvelope' },
                examples: {
                    sin_membresia: {
                        summary: 'No es miembro del workspace',
                        value: { ok: false, status: 403, message: 'No eres miembro de este espacio de trabajo' },
                    },
                    rol_insuficiente: {
                        summary: 'Rol insuficiente',
                        value: { ok: false, status: 403, message: 'No tienes permisos suficientes para hacer esta operacion' },
                    },
                    usuario_desactivado: {
                        summary: 'Usuario desactivado',
                        value: {
                            ok: false,
                            status: 403,
                            message: 'Usuario esta desactivado de la plataforma, contactate con soporte si consideras que esto es un error',
                        },
                    },
                },
            },
        },
    },

    NotFound: {
        description: `Recurso no encontrado. Casos posibles segun el endpoint:
- El workspace/canal/usuario no existe
- El canal existe pero pertenece a otro workspace (mismo mensaje para evitar filtrar informacion)`,
        content: {
            'application/json': {
                schema: { $ref: '#/components/schemas/ErrorEnvelope' },
                examples: {
                    workspace_inexistente: {
                        summary: 'Workspace inexistente',
                        value: { ok: false, status: 404, message: 'Workspace no encontrado' },
                    },
                    canal_inexistente: {
                        summary: 'Canal inexistente o de otro workspace',
                        value: { ok: false, status: 404, message: 'Canal no encontrado' },
                    },
                    usuario_inexistente: {
                        summary: 'Usuario inexistente',
                        value: { ok: false, status: 404, message: 'User not found' },
                    },
                },
            },
        },
    },

    InternalServerError: {
        description: 'Error inesperado del servidor. Cualquier error que no sea un ServerError termina aqui.',
        content: {
            'application/json': {
                schema: { $ref: '#/components/schemas/ErrorEnvelope' },
                example: { ok: false, status: 500, message: 'Internal server error' },
            },
        },
    },

    //OJO: esta respuesta NO tiene el formato {ok, status, message}, solo {message}
    ServiceUnavailable: {
        description: 'Servicio no disponible: no se pudo conectar a MongoDB antes de procesar la request.',
        content: {
            'application/json': {
                schema: { $ref: '#/components/schemas/ServiceUnavailableEnvelope' },
                example: { message: 'No se pudo conectar a la base de datos' },
            },
        },
    },
}
