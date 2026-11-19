/* 
Plantillas de mails de la app

 Las plantillas usan estilos inline porque los clientes de email (Gmail, Outlook)
 ignoran el CSS externo y las media queries son poco confiables

Cada plantilla es una funcion que devuelve { subject, html } listo para el transporter
*/

import ENVIRONMENT from "../../config/environment.config.js"

/* 
Recortamos la barra final si la tuviera, para que el link no quede con doble slash 
(ej: localhost:5173//verify-email) porque React Router no matchea esa ruta
*/
const url_frontend = ENVIRONMENT.URL_FRONTEND.replace(/\/+$/, '')

export function verificationEmailTemplate(verify_email_token) {

    const verify_url = `${url_frontend}/verify-email?verification_token=${verify_email_token}`

    return {
        subject: 'Verifica tu cuenta',
        html: `
            <!DOCTYPE html>
            <html>
            <body style='margin: 0; padding: 0; background-color: #f4f4f7; font-family: Arial, Helvetica, sans-serif;'>
                <table role='presentation' border='0' cellpadding='0' cellspacing='0' width='100%'>
                    <tr>
                        <td align='center' style='padding: 40px 16px;'>
                            <table role='presentation' border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 520px;'>
                                <tr>
                                    <td align='center' style='background-color: #4a154b; padding: 32px 24px; border-radius: 12px 12px 0 0;'>
                                        <h1 style='margin: 0; color: #ffffff; font-size: 24px;'>
                                            Bienvenido a Slack Clone
                                        </h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td style='background-color: #ffffff; padding: 32px 24px;'>
                                        <p style='margin: 0 0 16px; color: #333333; font-size: 16px; line-height: 1.6;'>
                                            Hola,
                                        </p>
                                        <p style='margin: 0 0 24px; color: #333333; font-size: 16px; line-height: 1.6;'>
                                            Necesitamos verificar que este correo electronico es tuyo para que puedas iniciar sesion.
                                            Hace click en el siguiente boton:
                                        </p>
                                        <table role='presentation' border='0' cellpadding='0' cellspacing='0' width='100%'>
                                            <tr>
                                                <td align='center' style='padding: 0 0 24px;'>
                                                    <a href='${verify_url}'
                                                    style='display: inline-block; background-color: #4a154b; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px; padding: 14px 32px; border-radius: 8px;'>
                                                        Verificar mi email
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        <p style='margin: 0 0 8px; color: #333333; font-size: 14px; line-height: 1.6;'>
                                            Si el boton no funciona, copia y pega este link en tu navegador:
                                        </p>
                                        <p style='margin: 0 0 24px;'>
                                            <a href='${verify_url}' style='color: #1264a3; font-size: 13px; word-break: break-all;'>
                                                ${verify_url}
                                            </a>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style='background-color: #f4f4f7; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e0e0e5;'>
                                        <p style='margin: 0 0 8px; color: #706b80; font-size: 13px; line-height: 1.6;'>
                                            Este link vence en <strong>7 dias</strong>.
                                        </p>
                                        <p style='margin: 0; color: #706b80; font-size: 13px; line-height: 1.6;'>
                                            Si no fuiste vos quien creo esta cuenta, podes ignorar este mensaje.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `
    }
}
