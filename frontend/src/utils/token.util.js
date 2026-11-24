/*
El backend firma un JWT con { id, name, email }.

Decodificamos el payload en el front solo para mostrar u ocultar acciones
segun el usuario logueado. NO validamos la firma: el backend sigue siendo
la autoridad y devuelve 403 si algo no corresponde.
*/

function decodeBase64Url(payload_base64_url) {
    // base64url -> base64
    const payload_base64 = payload_base64_url
        .replace(/-/g, '+')
        .replace(/_/g, '/')

    // atob exige que el largo sea multiplo de 4
    const padding = (4 - (payload_base64.length % 4)) % 4

    return atob(payload_base64 + '='.repeat(padding))
}

export function getUserFromAuthToken() {
    const auth_token = localStorage.getItem('auth_token')

    if (!auth_token) {
        return null
    }

    try {
        const [, payload_base64_url] = auth_token.split('.')

        if (!payload_base64_url) {
            return null
        }

        const payload_json = new TextDecoder().decode(
            Uint8Array.from(
                decodeBase64Url(payload_base64_url),
                (char) => char.charCodeAt(0)
            )
        )

        return JSON.parse(payload_json)
    }
    catch (error) {
        console.log('[token.util] No se pudo decodificar el token:', error)
        return null
    }
}
