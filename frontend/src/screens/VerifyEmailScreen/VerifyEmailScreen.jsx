import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import useRequest from '../../hooks/useRequest'
import { verifyEmail } from '../../services/authService'

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
            <div>
                <h1>Verificacion de email</h1>
                <p style={{color: 'red'}}>No se encontro el token de verificacion en el link</p>
            </div>
        )
    }

    return (
        <div>
            <h1>Verificacion de email</h1>
            <p>Estamos verificando tu cuenta...</p>
            {
                loading
                && <span>Verificando...</span>
            }
            {
                error
                && !loading
                && <span style={{color: 'red'}}>{error}</span>
            }
            {
                response
                && response.ok
                && !loading
                && <span style={{color: 'green'}}>
                    {response.message} - Te redirigiremos al login en unos segundos...
                </span>
            }
        </div>
    )
}

export default VerifyEmailScreen
