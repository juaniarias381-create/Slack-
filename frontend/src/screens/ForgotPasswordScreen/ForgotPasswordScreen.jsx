import React from 'react'
import { Link } from 'react-router'
import useForm from '../../hooks/useForm'
import useRequest from '../../hooks/useRequest'
import { forgotPassword } from '../../services/authService'
import TextField from '../../Components/Form/TextField'
import FormButton from '../../Components/Form/FormButton'
import Alert from '../../Components/Alert/Alert'

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

    async function handleSubmit (event){
        event.preventDefault()
        sendRequest(
            () => forgotPassword(formState.email)
        )
        console.log('Usuario solicita restablecer contraseña', formState)
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
                <h1 className='form-title form-title--wrap'>Olvidé mi contraseña</h1>
                <p className='form-subtitle'>
                    Ingresá tu email y te enviaremos un link para restablecer tu contraseña
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
                        Enviar mail
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
                    Si el mail salio bien, dejamos ir al login
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

export default ForgotPasswordScreen
