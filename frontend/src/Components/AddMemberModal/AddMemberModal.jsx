import { useContext, useEffect, useRef } from 'react'
import useForm from '../../hooks/useForm'
import useRequest from '../../hooks/useRequest'
import { WorkspaceContext } from '../../Context/WorkspaceContext'
import Modal from '../Modal/Modal'
import TextField from '../Form/TextField'
import FormButton from '../Form/FormButton'
import Alert from '../Alert/Alert'
import '../Modal/ModalForm.css'

/*
Roles que el owner puede asignar al agregar un miembro.
El backend aplica exactamente la misma regla: solo admin o user.
*/
const ROLE_OPTIONS = [
    { value: 'user', label: 'Miembro' },
    { value: 'admin', label: 'Administrador' }
]

export default function AddMemberModal({ onClose, onCreated }) {
    const { inviteMember } = useContext(WorkspaceContext)

    const { formState, handleChangeInput } = useForm({
        email: '',
        rol: 'user'
    })

    const { loading, response, error, sendRequest } = useRequest()
    const created_handled = useRef(false)

    useEffect(
        () => {
            if (response && !created_handled.current) {
                created_handled.current = true
                onCreated()
            }
        },
        [response, onCreated]
    )

    function handleClose() {
        if (!loading) {
            onClose()
        }
    }

    function handleSubmit(event) {
        event.preventDefault()

        sendRequest(
            () => inviteMember(
                formState.email.trim(),
                formState.rol
            )
        )
    }

    return (
        <Modal title='Agregar miembro' onClose={handleClose}>
            <form className='modal-form' onSubmit={handleSubmit}>
                <TextField
                    name='email'
                    label='Email:'
                    type='email'
                    value={formState.email}
                    onChange={handleChangeInput}
                    placeholder='nombre@empresa.com'
                    autoComplete='off'
                    required
                />

                <div className='form-field'>
                    <label className='form-field__label' htmlFor='rol'>
                        Rol:
                    </label>
                    <select
                        className='form-field__input'
                        id='rol'
                        name='rol'
                        value={formState.rol}
                        onChange={handleChangeInput}
                    >
                        {ROLE_OPTIONS.map((role) => (
                            <option key={role.value} value={role.value}>
                                {role.label}
                            </option>
                        ))}
                    </select>

                    <p className='modal-form__hint'>
                        Solo el owner puede agregar miembros. Si el email
                        coincide con una cuenta, se agregará al espacio.
                    </p>
                </div>

                {
                    error
                    &&
                    !loading
                    &&
                    <Alert type='error'>{error}</Alert>
                }

                <div className='modal-form__actions'>
                    <button
                        type='button'
                        className='modal-form__cancel'
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Cancelar
                    </button>

                    <FormButton loading={loading} loadingText='Agregando…'>
                        Agregar miembro
                    </FormButton>
                </div>
            </form>
        </Modal>
    )
}
