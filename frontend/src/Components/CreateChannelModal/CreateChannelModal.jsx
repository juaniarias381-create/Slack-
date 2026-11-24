import { useContext, useEffect, useRef } from 'react'
import useForm from '../../hooks/useForm'
import useRequest from '../../hooks/useRequest'
import { WorkspaceContext } from '../../Context/WorkspaceContext'
import Modal from '../Modal/Modal'
import TextField from '../Form/TextField'
import TextArea from '../Form/TextArea'
import FormButton from '../Form/FormButton'
import Alert from '../Alert/Alert'
import '../Modal/ModalForm.css'

export default function CreateChannelModal({ onClose, onCreated }) {
    const { createChannel } = useContext(WorkspaceContext)

    const { formState, handleChangeInput } = useForm({
        name: '',
        description: ''
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
            () => createChannel(
                formState.name.trim(),
                formState.description.trim()
            )
        )
    }

    return (
        <Modal title='Crear canal' onClose={handleClose}>
            <form className='modal-form' onSubmit={handleSubmit}>
                <TextField
                    name='name'
                    label='Nombre del canal:'
                    type='text'
                    value={formState.name}
                    onChange={handleChangeInput}
                    placeholder='Ej: General'
                    autoComplete='off'
                    maxLength={30}
                    required
                />

                <TextArea
                    name='description'
                    label='Descripción (opcional):'
                    value={formState.description}
                    onChange={handleChangeInput}
                    maxLength={1000}
                    placeholder='¿De qué se va a hablar en este canal?'
                />

                <p className='modal-form__hint'>
                    Los nombres de canal no se pueden repetir dentro del mismo
                    espacio de trabajo.
                </p>

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

                    <FormButton loading={loading} loadingText='Creando…'>
                        Crear canal
                    </FormButton>
                </div>
            </form>
        </Modal>
    )
}
