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

export default function EditWorkspaceModal({ workspace, onClose, onSaved }) {
    const { updateWorkspaceInfo } = useContext(WorkspaceContext)

    const { formState, handleChangeInput } = useForm({
        name: workspace?.nombre || '',
        description: workspace?.description || ''
    })

    const { loading, response, error, sendRequest } = useRequest()
    const saved_handled = useRef(false)

    useEffect(
        () => {
            if (response && !saved_handled.current) {
                saved_handled.current = true
                onSaved()
            }
        },
        [response, onSaved]
    )

    function handleClose() {
        if (!loading) {
            onClose()
        }
    }

    function handleSubmit(event) {
        event.preventDefault()

        sendRequest(
            () => updateWorkspaceInfo(
                formState.name.trim(),
                formState.description.trim()
            )
        )
    }

    return (
        <Modal title='Editar espacio' onClose={handleClose}>
            <form className='modal-form' onSubmit={handleSubmit}>
                <TextField
                    name='name'
                    label='Nombre del espacio:'
                    type='text'
                    value={formState.name}
                    onChange={handleChangeInput}
                    maxLength={30}
                    autoComplete='off'
                    required
                />

                <TextArea
                    name='description'
                    label='Descripción:'
                    value={formState.description}
                    onChange={handleChangeInput}
                    maxLength={200}
                    placeholder='Contale al equipo para qué sirve este espacio'
                />

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

                    <FormButton loading={loading} loadingText='Guardando…'>
                        Guardar cambios
                    </FormButton>
                </div>
            </form>
        </Modal>
    )
}
