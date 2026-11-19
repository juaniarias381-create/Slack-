import React, { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import useForm from '../../hooks/useForm'
import useRequest from '../../hooks/useRequest'
import { resetPassword } from '../../services/authService'

/*
Esta screen recibe el reset_token que llega por querystring (el link del email
apunta a /reset-password?reset_token=...), muestra un form con la nueva contraseña
y un segundo campo para confirmarla (deben coincidir). Al enviar, manda al backend
tanto el token como la nueva password a POST /api/auth/reset-password/:token
Si el backend la acepta redirige a /login.
*/

function ResetPasswordScreen() {

    const [searchParams] = useSearchParams()
    const reset_token = searchParams.get('reset_token')

    const initial_state = {password: '', confirmPassword: ''}
    const {formState, handleChangeInput} = useForm(initial_state)
    const {loading, response, error, sendRequest} = useRequest()
    const navigate = useNavigate()

    async function handleSubmit (event){
        event.preventDefault()

        //Validamos en el cliente que las dos contraseñas coincidan
        if(formState.password !== formState.confirmPassword){
            console.error('Las contraseñas no coinciden')
            alert('Las contraseñas no coinciden') //por ahora avisamos asi hasta decidir como mostramos errores del cliente
            return
        }

        sendRequest(
            () => resetPassword(reset_token, formState.password)
        )
        console.log('Usuario restablece su contraseña')
    }

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

    if(!reset_token){
        return (
            <div>
                <h1>Restablecer contraseña</h1>
                <p style={{color: 'red'}}>No se encontro el token de restablecimiento en el link</p>
                <p>
                    Volve al <Link to='/forgot-password'>olvide mi contraseña</Link> para pedir un link nuevo
                </p>
            </div>
        )
    }

    return (
        <div>
            <h1>Restablecer contraseña</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="password">Nueva contraseña:</label>
                    <input 
                        name='password' 
                        id='password' 
                        type='password' 
                        value={formState.password} 
                        onChange={handleChangeInput} 
                    />
                </div>
                <div>
                    <label htmlFor="confirmPassword">Confirmar contraseña:</label>
                    <input 
                        name='confirmPassword' 
                        id='confirmPassword' 
                        type='password' 
                        value={formState.confirmPassword} 
                        onChange={handleChangeInput} 
                    />
                </div>

                {
                    error
                    &&
                    !loading
                    &&
                    <span style={{color: 'red'}}>{error}</span>
                }

                {
                    response
                    && response.ok
                    && !loading
                    && <span style={{color: 'green'}}>
                        {response.message} - Te redirigiremos al login en unos segundos...
                    </span>
                }

                {
                    loading
                    ? <button type='submit' disabled={true} >Cargando...</button>
                    : <button type='submit'>Restablecer contraseña</button>
                }
            </form>
        </div>
    )
}

export default ResetPasswordScreen
