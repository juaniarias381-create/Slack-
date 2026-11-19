import React from 'react'
import { Link, useNavigate } from 'react-router'
import useForm from '../../hooks/useForm'
import useRequest from '../../hooks/useRequest'
import { resendVerificationEmail } from '../../services/authService'

/* 
Esta screen permite reenviar el mail de verificacion cuando el usuario perdio el mail
o el token expiro. Se ingresa el email y se consulta al endpoint
GET /api/auth/verify-email/resend/:email que genera un token nuevo y envia el mail
*/

function ResendEmailVerificationScreen() {

    const initial_state = {email: ''}
    const {formState, handleChangeInput} = useForm(initial_state)
    const {loading, response, error, sendRequest} = useRequest()
    const navigate = useNavigate()

    async function handleSubmit (event){
        event.preventDefault()
        sendRequest(
            () => resendVerificationEmail(formState.email)
        )
        console.log('Usuario solicita reenvio de verificacion', formState)
    }

    return (
        <div>
            <h1>Reenviar mail de verificacion</h1>
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
                    : <button type='submit'>Reenviar mail</button>
                }

                {
                    /* 
                    Si el reenvio salio bien, volvemos al login donde ya podra iniciar sesion cuando verifique
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

export default ResendEmailVerificationScreen
