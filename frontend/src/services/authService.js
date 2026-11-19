/* 
Interaccion con la API
*/

const API_URL = import.meta.env.VITE_APP_URL_BACKEND

export async function login (email, password){
    const response_http = await fetch(
        API_URL + '/api/auth/login',
        {
            method: 'POST',
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        }
    )
    const response_body = await response_http.json()

    if(!response_body.ok){
        throw new Error(response_body.message)
    }

    return response_body
}

export async function verifyEmail(verification_token) {
    const response_http = await fetch(
        API_URL + '/api/auth/verify-email/' + verification_token
    )
    const response_body = await response_http.json()

    if(!response_body.ok){
        throw new Error(response_body.message)
    }
    return response_body
}

/* 
Reenvia el mail de verificacion creando un token nuevo
*/

export async function resendVerificationEmail (email) {
    const response_http = await fetch(
        API_URL + '/api/auth/verify-email/resend/' + email
    )
    const response_body = await response_http.json()

    if(!response_body.ok){
        throw new Error(response_body.message)
    }
    return response_body
}

/* 
JSON.stringify sirve para transformar un Objeto de JS en un JSON
*/


export async function  register(username, email, password) {
    const response_http = await fetch(
        API_URL + '/api/auth/register',
        {
            method: 'POST',
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        }
    )
    //Leemos el cuerpo de la respuesta como un JSON
    const response_body = await response_http.json()
    
    if(!response_body.ok){
        throw new Error(response_body.message)
    }
    return response_body
}

/*
Solicita el mail de restablecimiento de contraseña. El backend solo envia el mail
si el usuario existe y esta activo, pero siempre responde lo mismo por seguridad
*/
export async function forgotPassword (email) {
    const response_http = await fetch(
        API_URL + '/api/auth/forgot-password',
        {
            method: 'POST',
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({
                email: email
            })
        }
    )
    const response_body = await response_http.json()

    if(!response_body.ok){
        throw new Error(response_body.message)
    }
    return response_body
}

/*
Restablece la contraseña enviando tanto el token (que vino del link del mail
por querystring) como la nueva password
*/
export async function resetPassword (reset_token, password) {
    const response_http = await fetch(
        API_URL + '/api/auth/reset-password/' + reset_token,
        {
            method: 'POST',
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({
                password: password
            })
        }
    )
    const response_body = await response_http.json()

    if(!response_body.ok){
        throw new Error(response_body.message)
    }
    return response_body
}