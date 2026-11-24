import ServerError from './error.util.js'

/*
Normaliza y valida textos que vienen del cliente.

Analogia: es el "filtro de entrada" de la casa. No importa lo que traiga el
visitante (el front), aca se limpia y se descarta lo que no cumple las reglas.
El front puede validar para dar respuesta rapida, pero el backend siempre valida.

- required: si el texto final queda vacio, lanza 400.
- max_length: limite de caracteres.
- allow_newlines: permite saltos de linea (descripciones y mensajes).
- long_message: mensaje de error personalizado cuando se supera el limite.
*/
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g

export function normalizeText(
    value,
    {
        field,
        required = false,
        max_length = 255,
        allow_newlines = false,
        long_message
    } = {}
) {
    if (value === undefined || value === null) {
        if (required) {
            throw new ServerError(`${field} es requerido`, 400)
        }
        return ''
    }

    if (typeof value !== 'string') {
        throw new ServerError(`${field} debe ser un texto`, 400)
    }

    // Sacamos caracteres de control (excepto tab y salto de linea, que se
    // manejan mas abajo). Evitamos guardar basura invisible en la base.
    let normalized = value.replace(CONTROL_CHARACTERS, '')

    if (allow_newlines) {
        normalized = normalized.replace(/\r\n?/g, '\n').trim()
    } else {
        // En nombres/emails un salto de linea no tiene sentido: colapsamos
        // todos los espacios en blanco a un solo espacio.
        normalized = normalized.replace(/\s+/g, ' ').trim()
    }

    if (required && normalized.length === 0) {
        throw new ServerError(`${field} es requerido`, 400)
    }

    if (normalized.length > max_length) {
        throw new ServerError(
            long_message || `${field} no puede superar los ${max_length} caracteres`,
            400
        )
    }

    return normalized
}
