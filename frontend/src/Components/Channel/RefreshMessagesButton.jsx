import { FaArrowRotateRight } from 'react-icons/fa6'
import { useChannelContext } from '../../Context/ChannelContext'
import './RefreshMessagesButton.css'

/*
Boton de recarga de mensajes del canal.

No hace pedidos por su cuenta: solo consume refetchMessages y
messages_loading del ChannelContext. El Context es el unico que conoce el
service y el hook useRequest que guardan respuesta, error y carga.
*/
export default function RefreshMessagesButton() {
    const { refetchMessages, messages_loading } = useChannelContext()

    return (
        <button
            type='button'
            className='refresh-messages-button'
            onClick={refetchMessages}
            disabled={messages_loading}
            aria-busy={messages_loading}
            aria-label='Actualizar mensajes'
            title='Actualizar mensajes'
        >
            <FaArrowRotateRight
                className={`refresh-messages-button__icon${
                    messages_loading
                        ? ' refresh-messages-button__icon--spinning'
                        : ''
                }`}
                aria-hidden='true'
            />
        </button>
    )
}
