/* 
Capa de servicios de auth

Aca vive la logica de negocio de cada endpoint de auth (los controllers solo 
leen la request, llaman al servicio y formatean la respuesta HTTP)

Responsabilidades por servicio:
    - registerUser: valida datos, no duplica emails, hashea la password, crea el usuario y envia el mail de verificacion
    - loginUser: valida datos, verifica el usuario, compara la contraseña y crea el token de acceso
    - verifyUserEmail: decodifica el token de verificacion, valida el estado del usuario y lo marca como verificado
    - resendEmailVerification: genera un token nuevo y reenvia el mail de verificacion
    - forgotUserPassword: si el usuario existe y esta activo le envia un mail con un token para restablecer la contraseña
    - resetUserPassword: valida el token de reseteo y actualiza la contraseña hasheada del usuario
*/

import ENVIRONMENT from "../config/environment.config.js"
import mailer_transporter from "../config/mailer.config.js"
import user_repository from "../repositories/user.repository.js"
import { compareHash, generateHash } from "../utils/bcrypt.util.js"
import ServerError from "../utils/error.util.js"
import { verificationEmailTemplate } from "../utils/email-templates/verification-email.template.js"
import { resetPasswordEmailTemplate } from "../utils/email-templates/reset-password-email.template.js"
import jwt from 'jsonwebtoken'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/*
Mensaje ambiguo del reenvio de verificacion: en cualquier caso decimos lo mismo
para no revelar si el email tiene una cuenta, si esta desactivada o si ya esta verificada
*/
const RESEND_AMBIGUOUS_MESSAGE = 'Se enviara un mail con los pasos para verificar en caso de que esta cuenta sea real'

/*
Mensaje ambiguo del olvido de contraseña: en cualquier caso decimos lo mismo
para no revelar si el email tiene una cuenta o si esta desactivada
*/
const FORGOT_PASSWORD_AMBIGUOUS_MESSAGE = 'Se enviara un mail con los pasos para restablecer la contraseña en caso de que esta cuenta sea real'


/* 
Helper que crea el token de verificacion de email y se lo envia al usuario
Lo usan el registro y el reenvio de verificacion
*/
async function createAndSendVerificationEmail(email) {
    const verify_email_token = jwt.sign(
        {
            email: email
        },
        ENVIRONMENT.JWT_SECRET_KEY,
        {
            expiresIn: '7d' // -> expira en 7 dias
        }
    )

    const mail = verificationEmailTemplate(verify_email_token)

    await mailer_transporter.sendMail(
        {
            to: email,
            from: ENVIRONMENT.GMAIL_USER,
            subject: mail.subject,
            html: mail.html
        }
    )
}


export async function registerUser(username, email, password) {

    if (!username || !email || !password) {
        throw new ServerError(
            "Email, password and username is required",
            400
        )
    }

    if (!EMAIL_REGEX.test(email)) {
        throw new ServerError(
            "Email is incorrect",
            400
        )
    }

    //Validar si el mail ya esta registrado
    const user_already_exist = await user_repository.getByEmail(email)
    if (user_already_exist) {
        throw new ServerError(
            'Email is already used',
            400
        )
    }

    /* 
    Encriptamos la password para que en DB se guarde un dato irreversible 
    Viendo el dato irreversible es IMPROBABLE que se sepa el dato original
    */
    const password_hash = await generateHash(password)

    await user_repository.create(username, email, password_hash)

    await createAndSendVerificationEmail(email)
}


export async function loginUser(email, password) {

    if (
        !email || !password || typeof email !== "string" || typeof password !== "string"
    ) {
        throw new ServerError(
            "Email and password are required",
            400
        );
    }

    if (!EMAIL_REGEX.test(email)) {
        throw new ServerError(
            "Email is incorrect",
            400
        );
    }

    const user = await user_repository.getByEmail(email)

    if (!user) {
        throw new ServerError(
            "Invalid email or password",
            401
        );
    }

    //Compara el hash guardado en DB contra la contraseña que nos envió por body el cliente.
    const isPasswordValid = await compareHash(password, user.password);
    if (!isPasswordValid) {
        throw new ServerError(
            "Invalid email or password",
            401
        );
    }

    if(!user.email_verificado){
        throw new ServerError(
            'Email no verificado',
            403
        )
    }

    /* 
    Crear un token firmado de sesion

    Cuando un usuario inicia sesion le damos una credencial firmada que nos permite indicar 
    quien es ese usuario para que mas adelante el usuario nos devuelva dicha credencial 
    y poder confiar en ella

    Los JWT son objetos de JS (JSON) pasados a string (HS256) con una firma
    */
    const auth_token = jwt.sign(
        {
            //Aca va a info que queres guardar en la credencial
            id: user._id,
            name: user.nombre,
            email: user.email
        },
        ENVIRONMENT.JWT_SECRET_KEY //Firmamos con esto
    )

    return auth_token
}


export async function verifyUserEmail(verify_email_token) {
    //Verificar el token
    const {email} = jwt.verify(
        verify_email_token,
        ENVIRONMENT.JWT_SECRET_KEY
    )

    const user_found = await user_repository.getByEmail(email)

    //Si no existe el usuario error
    if(!user_found){
        throw new ServerError('Usuario no encontrado', 404)
    }

    if(!user_found.activo){
        throw new ServerError('Usuario esta desactivado de la plataforma, contactate con soporte si consideras que esto es un error', 403)
    }

    //Si ya estas verificado deja de intentar verificarte
    if(user_found.email_verificado){
        throw new ServerError('Ya estas verificado', 400)
    }

    //Actualizamos al usuario para verificarlo
    await user_repository.updateById(
        user_found._id, 
        {
            email_verificado: true
        }
    )
}


export async function resendEmailVerification(email) {

    if (!EMAIL_REGEX.test(email)) {
        throw new ServerError(
            "Email is incorrect",
            400
        )
    }

    const user_found = await user_repository.getByEmail(email)

    const user_can_receive_mail = 
        user_found
        && user_found.activo
        && !user_found.email_verificado

    //Solo enviamos el mail si el usuario existe, esta activo y no esta verificado
    if(user_can_receive_mail){
        //Generamos un token nuevo y enviamos el mail
        await createAndSendVerificationEmail(email)
    }

    //En cualquier caso devolvemos el mismo mensaje para no revelar informacion de las cuentas
    return RESEND_AMBIGUOUS_MESSAGE
}


/*
Helper que crea el token de reseteo de contraseña y se lo envia al usuario
Lo usa el forgotPassword

El token lleva purpose: 'reset_password' para que un token de verificacion de email
no pueda usarse para resetear la contraseña (y viceversa)
*/
async function createAndSendPasswordResetEmail(email) {
    const reset_password_token = jwt.sign(
        {
            email: email,
            purpose: 'reset_password'
        },
        ENVIRONMENT.JWT_SECRET_KEY,
        {
            expiresIn: '1h' // -> expira en 1 hora (es un token sensible, no conviene que viva mucho)
        }
    )

    const mail = resetPasswordEmailTemplate(reset_password_token)

    await mailer_transporter.sendMail(
        {
            to: email,
            from: ENVIRONMENT.GMAIL_USER,
            subject: mail.subject,
            html: mail.html
        }
    )
}


export async function forgotUserPassword(email) {

    if (!email || typeof email !== 'string') {
        throw new ServerError(
            'Email is required',
            400
        )
    }

    if (!EMAIL_REGEX.test(email)) {
        throw new ServerError(
            'Email is incorrect',
            400
        )
    }

    const user_found = await user_repository.getByEmail(email)

    const user_can_receive_mail =
        user_found
        && user_found.activo

    //Solo enviamos el mail si el usuario existe y esta activo
    if(user_can_receive_mail){
        await createAndSendPasswordResetEmail(email)
    }

    //En cualquier caso devolvemos el mismo mensaje para no revelar informacion de las cuentas
    return FORGOT_PASSWORD_AMBIGUOUS_MESSAGE
}


export async function resetUserPassword(reset_password_token, password) {

    if (!reset_password_token || !password || typeof password !== 'string') {
        throw new ServerError(
            'El token y la nueva password son requeridos',
            400
        )
    }

    if (password.length < 8) {
        throw new ServerError(
            'La password debe tener al menos 8 caracteres',
            400
        )
    }

    //Verificar el token
    let payload
    try {
        payload = jwt.verify(
            reset_password_token,
            ENVIRONMENT.JWT_SECRET_KEY
        )
    } catch (error) {
        if(error instanceof jwt.TokenExpiredError){
            throw new ServerError('El token de reseteo expiro, solicita uno nuevo', 400)
        }
        throw new ServerError('Token de reseteo invalido', 400)
    }

    if(payload.purpose !== 'reset_password' || !payload.email){
        throw new ServerError('Token de reseteo invalido', 400)
    }

    const user_found = await user_repository.getByEmail(payload.email)

    //Si no existe el usuario error
    if(!user_found){
        throw new ServerError('Usuario no encontrado', 404)
    }

    if(!user_found.activo){
        throw new ServerError('Usuario esta desactivado de la plataforma, contactate con soporte si consideras que esto es un error', 403)
    }

    /*
    Encriptamos la password nueva para que en DB se guarde un dato irreversible
    (mismo criterio que en el registro)
    */
    const password_hash = await generateHash(password)

    await user_repository.updateById(
        user_found._id,
        {
            password: password_hash
        }
    )
}
