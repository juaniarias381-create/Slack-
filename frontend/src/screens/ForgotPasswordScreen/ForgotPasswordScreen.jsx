import React from 'react'
import { Link, useNavigate } from 'react-router'
import useForm from '../../hooks/useForm'
import useRequest from '../../hooks/useRequest'
import { forgotPassword } from '../../services/authService'

/*
Esta screen es el "olvide mi contraseña": se ingresa el email y se consulta el
endpoint POST /api/auth/forgot-password. Si el usuario existe y esta activo,
el backend le envia un mail con un link para restablecer la contraseña
(/reset-password con el token por querystring).

Por seguridad el backend responde lo mismo exista o no la cuenta.
*/

function ForgotPasswordScreen() {

    const initial_state = {email: ''}
    const {formState, handleChangeInput} = useForm(initial_state)
    const {loading, response, error, sendRequest} = useRequest()
    const navigate = useNavigate()

    async function handleSubmit (event){
        event.preventDefault()
        sendRequest(
            () => forgotPassword(formState.email)
        )
        console.log('Usuario solicita restablecer contraseña', formState)
    }

    return (
        <div>
            <h1>Olvide mi contraseña</h1>
            <p>Ingresá tu email y te enviaremos un link para restablecer tu contraseña</p>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input 
                        name='email' 
                        id='email' 
                        type='email' 
                        value={formState.email} 
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
                        {response.message} - Revisa tu casilla y hace click en el link del mail
                    </span>
                }

                {
                    loading
                    ? <button type='submit' disabled={true} >Cargando...</button>
                    : <button type='submit'>Enviar mail</button>
                }

                {
                    /*
                    Si el mail salio bien, dejamos ir al login
                    */
                    response
                    && !loading
                    &&
                    <p>
                        <button type='button' onClick={() => navigate('/login')}>
                            Ir al login
                        </button>
                    </p>
                }
            </form>

            <p>
                Ya tienes cuenta? <Link to='/login'>Iniciar sesion</Link>
            </p>
        </div>
    )
}

export default ForgotPasswordScreen
