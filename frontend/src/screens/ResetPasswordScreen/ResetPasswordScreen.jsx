import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import useForm from '../../hooks/useForm'
import useRequest from '../../hooks/useRequest'
import { resetPassword } from '../../services/authService'
import TextField from '../../Components/Form/TextField'
import FormButton from '../../Components/Form/FormButton'
import Alert from '../../Components/Alert/Alert'

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
    const [clientError, setClientError] = useState(null)
    const navigate = useNavigate()

    async function handleSubmit (event){
        event.preventDefault()

        //Validamos en el cliente que las dos contraseñas coincidan
        if(formState.password !== formState.confirmPassword){
            setClientError('Las contraseñas no coinciden')
            return
        }
        setClientError(null)

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
            <div className='form-screen'>
                <div className='form-card'>
                    <img
                        className='form-logo'
                        alt='Slack'
                        height='26'
                        title='Slack'
                        src='https://a.slack-edge.com/bv1-13/slack_logo-97f7334.svg'
                    />
                    <h1 className='form-title form-title--wrap'>Restablecer contraseña</h1>
                    <p className='form-subtitle'>
                        El link que usaste no es válido o está incompleto
                    </p>
                    <div className='form-stack'>
                        <Alert type='error'>
                            No se encontró el token de restablecimiento en el link
                        </Alert>
                    </div>
                    <p className='form-footer'>
                        Volvé a <Link to='/forgot-password'>olvidé mi contraseña</Link> para pedir un link nuevo
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
                <h1 className='form-title form-title--wrap'>Restablecer contraseña</h1>
                <p className='form-subtitle'>
                    Elegí una nueva contraseña para tu cuenta
                </p>
                <form className='form-stack' onSubmit={handleSubmit}>
                    <TextField
                        name='password'
                        label='Nueva contraseña:'
                        type='password'
                        value={formState.password}
                        onChange={handleChangeInput}
                        autoComplete='new-password'
                    />
                    <TextField
                        name='confirmPassword'
                        label='Confirmar contraseña:'
                        type='password'
                        value={formState.confirmPassword}
                        onChange={handleChangeInput}
                        autoComplete='new-password'
                    />
                    {
                        clientError
                        &&
                        <Alert type='error'>{clientError}</Alert>
                    }
                    {
                        error
                        &&
                        !loading
                        &&
                        <Alert type='error'>{error}</Alert>
                    }
                    <FormButton loading={loading} loadingText='Restableciendo…'>
                        Restablecer contraseña
                    </FormButton>
                    {
                        response
                        && response.ok
                        && !loading
                        &&
                        <Alert type='success'>
                            {response.message} - Te redirigiremos al login en unos segundos...
                        </Alert>
                    }
                </form>
                <p className='form-footer'>
                    ¿Ya tenés cuenta? <Link to='/login'>Iniciá sesión</Link>
                </p>
            </div>
        </div>
    )
}

export default ResetPasswordScreen
