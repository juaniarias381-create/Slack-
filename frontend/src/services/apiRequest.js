const API_URL = import.meta.env.VITE_APP_URL_BACKEND

/*
Helper compartido por todos los services.

Analogia: es el mensajero. Los services le dicen QUE pedir (path, metodo y
body) y este se encarga de llevar el token, parsear la respuesta y traducir
cualquier fallo en un Error con el mensaje que mando el backend.

Asi evitamos repetir fetch + localStorage + response.json() en cada service.
*/
export default async function apiRequest(path, { method = 'GET', body } = {}) {
    const headers = {}

    const auth_token = localStorage.getItem('auth_token')

    if (auth_token) {
        headers.Authorization = `Bearer ${auth_token}`
    }

    if (body !== undefined) {
        headers['Content-Type'] = 'application/json'
    }

    let response_http

    try {
        response_http = await fetch(
            `${API_URL}${path}`,
            {
                method,
                headers,
                body: body === undefined ? undefined : JSON.stringify(body)
            }
        )
    } catch (error) {
        throw new Error('No se pudo conectar con el servidor', { cause: error })
    }

    let response_body = null

    try {
        response_body = await response_http.json()
    } catch (_error) {
        // El servidor devolvio HTML (por ejemplo, un 503 de Vercel). Lo
        // transformamos en un error entendible para la UI.
    }

    if (!response_http.ok || response_body?.ok === false) {
        throw new Error(
            response_body?.message || `Error ${response_http.status} en la solicitud`
        )
    }

    return response_body
}
