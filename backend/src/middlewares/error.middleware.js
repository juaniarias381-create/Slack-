//Middleware de errores (Oficina de errores)
//Si bien llamamos a next en este caso NO nos interesa usarlo PORQUE no hay oficina sig a la de errores

//Conclusion simple: Con este middleware de errores centralizas cualquier error de tu API, todos los errores terminaran aqui y se manejaran desde aqui
function errorHandlerMiddleware(error, request, response, next) {

    //Error esperable del sistema
    if (error.status) {
        return response.status(error.status).send(
            {
                ok: false,
                status: error.status,
                message: error.message
            }
        )
    }

    //Error de validacion de Mongoose (campo requerido, maxlength, enum, etc.)
    if (error.name === 'ValidationError') {
        const first_error = Object.values(error.errors || {})[0]

        return response.status(400).send(
            {
                ok: false,
                status: 400,
                message: first_error?.message || 'Los datos enviados no son validos'
            }
        )
    }

    //Id con formato invalido (por ejemplo, un ObjectId mal escrito)
    if (error.name === 'CastError') {
        return response.status(400).send(
            {
                ok: false,
                status: 400,
                message: 'El id enviado no es valido'
            }
        )
    }

    //Violacion de un indice unico (por ejemplo, canal o membresia duplicada)
    if (error.code === 11000) {
        // Los indices son compuestos, asi que podemos tener varias claves.
        const duplicated_fields = Object.keys(error.keyPattern || {})

        let message = 'El recurso ya existe'

        if (duplicated_fields.includes('nombre')) {
            message = 'Ya existe un canal con ese nombre en este espacio de trabajo'
        }

        if (duplicated_fields.includes('fk_id_usuario')) {
            message = 'El usuario ya es miembro de este espacio de trabajo'
        }

        return response.status(409).send(
            {
                ok: false,
                status: 409,
                message
            }
        )
    }

    //Es un error inesperado
    console.log('[Middleware de Error]:', error)
    //Error generico
    return response.status(500).send(
        {
            ok: false,
            status: 500,
            message: 'Internal server error'
        }
    )
}

export default errorHandlerMiddleware