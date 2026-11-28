import { useContext, useEffect, useRef } from 'react'
import { FaTrashCan } from 'react-icons/fa6'
import useRequest from '../../hooks/useRequest'
import { WorkspaceContext } from '../../Context/WorkspaceContext'
import Modal from '../Modal/Modal'
import Alert from '../Alert/Alert'
import '../Modal/ModalForm.css'

export default function DeleteChannelModal({ channel, onClose, onDeleted }) {
    const { removeChannel } = useContext(WorkspaceContext)

    const { loading, response, error, sendRequest } = useRequest()
    const deleted_handled = useRef(false)

    useEffect(
        () => {
            if (response && !deleted_handled.current) {
                deleted_handled.current = true
                onDeleted()
            }
        },
        [response, onDeleted]
    )

    function handleClose() {
        if (!loading) {
            onClose()
        }
    }

    function handleDelete() {
        sendRequest(
            () => removeChannel(channel._id)
        )
    }

    return (
        <Modal title='Eliminar canal' onClose={handleClose}>
            <div className='modal-form'>
                <p className='modal-form__warning'>
                    Vas a eliminar <strong># {channel?.nombre}</strong> y todos
                    sus mensajes. Esta acción no se puede deshacer.
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

                    <button
                        type='button'
                        className='modal-form__danger'
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        <FaTrashCan aria-hidden='true' />
                        {loading ? 'Eliminando…' : 'Eliminar canal'}
                    </button>
                </div>
            </div>
        </Modal>
    )
}
