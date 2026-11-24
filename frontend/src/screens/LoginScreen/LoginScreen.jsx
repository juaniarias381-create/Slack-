import React, { useEffect } from 'react'
import useForm from '../../hooks/useForm'
import { login } from '../../services/authService'
import useRequest from '../../hooks/useRequest'
import {useNavigate, Link} from 'react-router'
import TextField from '../../Components/Form/TextField'
import FormButton from '../../Components/Form/FormButton'
import Alert from '../../Components/Alert/Alert'

/*
Siguiendo las practicas implementadas la conectar el formulario de login con nuesta API REST
Desarrollar la implementacion del formulario de registro y la consulta a la API REST
*/

function LoginScreen() {

    const initial_state = {email: '', password: ''}
    const {formState, handleChangeInput} = useForm(initial_state)
    const {loading, response, error, sendRequest} = useRequest()

    const navigate = useNavigate()


    async function handleSubmit (event){
        event.preventDefault()
        sendRequest(
            () => login(formState.email, formState.password)
        )
        console.log('Usuario intenta iniciar sesion', formState)
    }

    /*
    Los efectos sirven para controlar la recarga/ejecucion de una funcion

    Cuando la response cambie/llegue:
        - Guardar en localstorage el auth_token (para que luego podamos seguir usandolo)
        - voy a redireccionar a /home
    */
    useEffect(
        () => {
            if(response && response.data){
                localStorage.setItem('auth_token', response.data.auth_token)
                navigate('/')
            }
        },
        [response]
    )

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
                <h1 className='form-title'>Iniciar sesión</h1>
                <p className='form-subtitle'>Ingresá a tu cuenta para continuar</p>
                <form className='form-stack' onSubmit={handleSubmit}>
                    <TextField
                        name='email'
                        label='Email:'
                        type='email'
                        value={formState.email}
                        onChange={handleChangeInput}
                        autoComplete='email'
                    />
                    <TextField
                        name='password'
                        label='Password:'
                        type='password'
                        value={formState.password}
                        onChange={handleChangeInput}
                        autoComplete='current-password'
                    />
                    {
                        error
                        &&
                        !loading
                        &&
                        <Alert type='error'>{error}</Alert>
                    }
                    <FormButton loading={loading} loadingText='Iniciando sesión…'>
                        Iniciar sesión
                    </FormButton>
                </form>
                <p className='form-footer'>
                    No recibiste el mail de verificación? <Link to='/resend-email-verification'>Reenviar mail de verificación</Link>
                </p>
                <p className='form-footer'>
                    Olvidaste tu contraseña? <Link to='/forgot-password'>Olvidé mi contraseña</Link>
                </p>
                <p className='form-footer'>
                    ¿No tenés cuenta? <Link to='/register'>Registrate</Link>
                </p>
            </div>
        </div>
    )
}

export default LoginScreen
