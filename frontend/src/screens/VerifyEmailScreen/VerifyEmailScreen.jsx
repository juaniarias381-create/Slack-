import React, { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import useRequest from '../../hooks/useRequest'
import { verifyEmail } from '../../services/authService'
import Alert from '../../Components/Alert/Alert'
import '../../Components/Form/Form.css'

/* 
Esta screen recibe el verification_token que llega por querystring 
(el link del email apunta a /verify-email?verification_token=...)
y envia la consulta a la API para verificar el email del usuario.
Si la verificacion es exitosa redirige a /login.
*/

function VerifyEmailScreen() {

    const [searchParams] = useSearchParams()
    const verification_token = searchParams.get('verification_token')

    const {loading, response, error, sendRequest} = useRequest()
    const navigate = useNavigate()

    /* 
    Cuando la screen monta, si hay token, enviamos la consulta para verificar el email 
    */
    useEffect(
        () => {
            if(verification_token){
                sendRequest(
                    () => verifyEmail(verification_token)
                )
            }
        },
        [verification_token]
    )

    /* 
    Cuando la response llegue y sea exitosa: redirigimos a /login
    */
    useEffect(
        () => {
            if(response && response.ok){
                //Le damos un momento al usuario para leer el mensaje y lo mandamos al login
                setTimeout(
                    () => {
                        navigate('/login')
                    },
                    3000
                )
            }
        },
        [response]
    )

    if(!verification_token){
        return (
            <div className='form-screen'>
                <div className='form-card'>
                    <img
                        className='form-logo'
                        alt='Slack'
                        height='26'
                        title='Slack'
                        src='https://a.slack-edge.com/bv1-13/slack_logo-97f7334.svg'
                    />
                    <h1 className='form-title form-title--wrap'>Verificación de email</h1>
                    <p className='form-subtitle'>
                        El link que usaste no es válido o está incompleto
                    </p>
                    <div className='form-stack'>
                        <Alert type='error'>
                            No se encontró el token de verificación en el link
                        </Alert>
                    </div>
                    <p className='form-footer'>
                        Pedí un mail nuevo desde <Link to='/resend-email-verification'>reenviar mail de verificación</Link>
                    </p>
                    <p className='form-footer'>
                        ¿Ya tenés cuenta? <Link to='/login'>Iniciá sesión</Link>
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className='form-screen'>
            <div className='form-card'>
                <img
                    className='form-logo'
                    alt='Slack'
                    height='26'
                    title='Slack'
                    src='https://a.slack-edge.com/bv1-13/slack_logo-97f7334.svg'
                />
                <h1 className='form-title form-title--wrap'>Verificación de email</h1>
                <p className='form-subtitle'>
                    Estamos verificando tu cuenta...
                </p>
                <div className='form-stack'>
                    {
                        loading
                        && <Alert type='info'>Verificando...</Alert>
                    }
                    {
                        error
                        && !loading
                        && <Alert type='error'>{error}</Alert>
                    }
                    {
                        response
                        && response.ok
                        && !loading
                        && <Alert type='success'>
                            {response.message} - Te redirigiremos al login en unos segundos...
                        </Alert>
                    }
                </div>
                <p className='form-footer'>
                    ¿No recibiste el mail? <Link to='/resend-email-verification'>Reenviar mail de verificación</Link>
                </p>
                <p className='form-footer'>
                    ¿Ya tenés cuenta? <Link to='/login'>Iniciá sesión</Link>
                </p>
            </div>
        </div>
    )
}

export default VerifyEmailScreen
