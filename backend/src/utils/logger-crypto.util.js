/*
Utilidades de encriptacion para el body registrado por el logger.

El logger guarda el body de consultas POST/PUT/DELETE encriptado con
AES-256-GCM usando una clave derivada de LOGGER_PRIVATE_KEY (.env).
AES-GCM es un modo autenticado: si alguien altera el texto cifrado,
el descifrado falla en lugar de devolver basura.

Formato guardado en la coleccion RequestLog:
    iv_base64:tag_base64:data_base64
*/
import crypto from 'node:crypto'
import ENVIRONMENT from '../config/environment.config.js'

//Derivamos una clave de 32 bytes (256 bits) a partir de LOGGER_PRIVATE_KEY,
//que puede ser cualquier texto en el .env
function get_key() {
    return crypto.createHash('sha256').update(ENVIRONMENT.LOGGER_PRIVATE_KEY).digest()
}

/*
Encripta el body de una request y devuelve el string "iv:tag:data".
Si LOGGER_PRIVATE_KEY no esta configurada, devuelve null (fail closed:
nunca guardamos el body en texto plano).
*/
export function encryptRequestBody(body) {
    if (!ENVIRONMENT.LOGGER_PRIVATE_KEY) {
        console.warn('[LoggerCrypto]: LOGGER_PRIVATE_KEY no esta configurada, el body no se registra')
        return null
    }

    try {
        const iv = crypto.randomBytes(12)
        const cipher = crypto.createCipheriv('aes-256-gcm', get_key(), iv)

        const body_json = JSON.stringify(body)
        const data = Buffer.concat([cipher.update(body_json, 'utf8'), cipher.final()])
        const tag = cipher.getAuthTag()

        return [
            iv.toString('base64'),
            tag.toString('base64'),
            data.toString('base64')
        ].join(':')
    }
    catch (error) {
        console.error('[LoggerCrypto]: no se pudo encriptar el body', error)
        return null
    }
}

/*
Descifra un body encriptado por encryptRequestBody y devuelve el objeto
original. Sirve para auditar logs cuando sea necesario.
Si el texto fue alterado o la clave no coincide, lanza error.
*/
export function decryptRequestBody(encrypted_body) {
    const [iv_base64, tag_base64, data_base64] = encrypted_body.split(':')

    const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        get_key(),
        Buffer.from(iv_base64, 'base64')
    )
    decipher.setAuthTag(Buffer.from(tag_base64, 'base64'))

    const data = Buffer.concat([
        decipher.update(Buffer.from(data_base64, 'base64')),
        decipher.final()
    ])

    return JSON.parse(data.toString('utf8'))
}
