import React from 'react'
import { Link } from 'react-router'
import useForm from '../../hooks/useForm'
import useRequest from '../../hooks/useRequest'
import { resendVerificationEmail } from '../../services/authService'
import TextField from '../../Components/Form/TextField'
import FormButton from '../../Components/Form/FormButton'
import Alert from '../../Components/Alert/Alert'

/* 
Esta screen permite reenviar el mail de verificacion cuando el usuario perdio el mail
o el token expiro. Se ingresa el email y se consulta al endpoint
GET /api/auth/verify-email/resend/:email que genera un token nuevo y envia el mail
*/

function ResendEmailVerificationScreen() {

    const initial_state = {email: ''}
    const {formState, handleChangeInput} = useForm(initial_state)
    const {loading, response, error, sendRequest} = useRequest()

    async function handleSubmit (event){
        event.preventDefault()
        sendRequest(
            () => resendVerificationEmail(formState.email)
        )
        console.log('Usuario solicita reenvio de verificacion', formState)
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
                <h1 className='form-title form-title--wrap'>Reenviar mail de verificación</h1>
                <p className='form-subtitle'>
                    Ingresá tu email y te enviaremos un link nuevo para verificar tu cuenta
                </p>
                <form className='form-stack' onSubmit={handleSubmit}>
                    <TextField
                        name='email'
                        label='Email:'
                        type='email'
                        value={formState.email}
                        onChange={handleChangeInput}
                        autoComplete='email'
                    />
                    {
                        error
                        &&
                        !loading
                        &&
                        <Alert type='error'>{error}</Alert>
                    }
                    <FormButton loading={loading} loadingText='Enviando mail…'>
                        Reenviar mail
                    </FormButton>
                    {
                        response
                        && response.ok
                        && !loading
                        &&
                        <Alert type='success'>
                            {response.message} - Revisá tu casilla y hacé click en el link del mail
                        </Alert>
                    }
                </form>
                {
                    /*
                    Si el reenvio salio bien, volvemos al login donde ya podra iniciar sesion cuando verifique
                    */
                    response
                    && response.ok
                    && !loading
                    ? <p className='form-footer'>
                        <Link to='/login'>Ir al inicio de sesión</Link>
                      </p>
                    : <p className='form-footer'>
                        ¿Ya tenés cuenta? <Link to='/login'>Iniciá sesión</Link>
                      </p>
                }
            </div>
        </div>
    )
}

export default ResendEmailVerificationScreen
