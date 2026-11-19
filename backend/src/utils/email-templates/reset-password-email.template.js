/*
Plantilla del mail para restablecer la contraseña

Igual que las demas plantillas usa estilos inline porque los clientes de email
(Gmail, Outlook) ignoran el CSS externo y las media queries son poco confiables

Es una funcion que devuelve { subject, html } listo para el transporter
*/

import ENVIRONMENT from "../../config/environment.config.js"

/*
Recortamos la barra final si la tuviera, para que el link no quede con doble slash
(ej: localhost:5173//reset-password) porque React Router no matchea esa ruta
*/
const url_frontend = ENVIRONMENT.URL_FRONTEND.replace(/\/+$/, '')

export function resetPasswordEmailTemplate(reset_password_token) {

    const reset_url = `${url_frontend}/reset-password?reset_token=${reset_password_token}`

    return {
        subject: 'Restablece tu contraseña',
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
                                            Slack Clone
                                        </h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td style='background-color: #ffffff; padding: 32px 24px;'>
                                        <p style='margin: 0 0 16px; color: #333333; font-size: 16px; line-height: 1.6;'>
                                            Hola,
                                        </p>
                                        <p style='margin: 0 0 24px; color: #333333; font-size: 16px; line-height: 1.6;'>
                                            Recibimos una solicitud para restablecer la contraseña de tu cuenta.
                                            Hace click en el siguiente boton para elegir una contraseña nueva:
                                        </p>
                                        <table role='presentation' border='0' cellpadding='0' cellspacing='0' width='100%'>
                                            <tr>
                                                <td align='center' style='padding: 0 0 24px;'>
                                                    <a href='${reset_url}'
                                                    style='display: inline-block; background-color: #4a154b; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px; padding: 14px 32px; border-radius: 8px;'>
                                                        Restablecer contraseña
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        <p style='margin: 0 0 8px; color: #333333; font-size: 14px; line-height: 1.6;'>
                                            Si el boton no funciona, copia y pega este link en tu navegador:
                                        </p>
                                        <p style='margin: 0 0 24px;'>
                                            <a href='${reset_url}' style='color: #1264a3; font-size: 13px; word-break: break-all;'>
                                                ${reset_url}
                                            </a>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style='background-color: #f4f4f7; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e0e0e5;'>
                                        <p style='margin: 0 0 8px; color: #706b80; font-size: 13px; line-height: 1.6;'>
                                            Este link vence en <strong>1 hora</strong>.
                                        </p>
                                        <p style='margin: 0; color: #706b80; font-size: 13px; line-height: 1.6;'>
                                            Si no pediste restablecer tu contraseña, podes ignorar este mensaje y tu contraseña actual sigue siendo valida.
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
