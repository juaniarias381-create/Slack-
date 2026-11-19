/* 
Los controllers son la capa de entrada HTTP: leen la request (body/params), 
llaman a la capa de servicios (logica de negocio) y formatean la respuesta HTTP

Para enviar en una request HTTP info a una API usamos el body
Las consultas (request) tipo GET NO TIENEN body
El body puede ser de distintos tipos de dato:
    Hoy vamos a usar JSON, para poder usar JSON nuestra API debe estar preparada para recibir ese tipo de informacion
*/

import {
    registerUser,
    loginUser,
    verifyUserEmail,
    resendEmailVerification,
    forgotUserPassword,
    resetUserPassword
} from "../services/auth.services.js"


export async function register(request, response) {
    const { username, email, password } = request.body

    await registerUser(username, email, password)

    return response.status(201).send({
        ok: true,
        status: 201,
        message: "User registered successfully"
    })
}


export async function login(request, response) {
    const { email, password } = request.body

    const auth_token = await loginUser(email, password)

    return response.status(200).send({
        ok: true,
        message: "You have logged in successfully",
        status: 200,
        data: {
            auth_token
        }
    });
}


export async function verifyEmail (request, response){
    const {verify_email_token} = request.params

    await verifyUserEmail(verify_email_token)

    return response.status(200).send(
        {
            ok: true, 
            status: 200,
            message: 'Usuario verificado exitosamente'
        }
    )
}


/* 
Endpoint para reenviar el mail de verificacion cuando el token expiro o el usuario perdio el mail
Recibe el email por params, genera un token nuevo y se lo envia
*/

export async function resendVerificationEmail (request, response){
    const {email} = request.params

    const message = await resendEmailVerification(email)

    return response.status(200).send(
        {
            ok: true,
            status: 200,
            message
        }
    )
}


/*
Endpoint de "olvide mi contraseña": recibe el email por body y, si el usuario existe
y esta activo, le envia un mail con un link para restablecer la contraseña.
Siempre responde lo mismo para no revelar si la cuenta existe o no.
*/
export async function forgotPassword (request, response){
    const {email} = request.body

    const message = await forgotUserPassword(email)

    return response.status(200).send(
        {
            ok: true,
            status: 200,
            message
        }
    )
}


/*
Endpoint de restablecer la contraseña: recibe el token de reseteo por params
(viene del link del mail, por querystring llega a /reset-password del frontend) 
y la nueva password por body. Si el token es valido actualiza la contraseña.
*/
export async function resetPassword (request, response){
    const {reset_password_token} = request.params
    const {password} = request.body

    await resetUserPassword(reset_password_token, password)

    return response.status(200).send(
        {
            ok: true,
            status: 200,
            message: 'Contraseña restablecida exitosamente'
        }
    )
}
