import { useContext } from 'react'
import { ChannelContext } from '../../Context/ChannelContext'
import { formatDateTime, getAvatarTone, getInitial } from '../../utils/format.util'
import './Messages.css'

/*
Lista de mensajes del canal abierto.

4 estados:
- cargando
- error (con reintento)
- vacio (canal sin mensajes todavia)
- lista (mensajes con autor y fecha)
*/
export default function Messages() {
    const {
        messages_response,
        messages_error,
        messages_loading,
        refetchMessages
    } = useContext(ChannelContext)

    if (messages_loading || (!messages_response && !messages_error)) {
        return (
            <div className='messages'>
                <span className='messages__status'>Cargando mensajes…</span>
            </div>
        )
    }

    if (messages_error || !messages_response?.data?.messages) {
        return (
            <div className='messages'>
                <div className='messages__status'>
                    <span>No se pudieron cargar los mensajes: {messages_error}</span>
                    <button
                        type='button'
                        className='channel-state__button'
                        onClick={refetchMessages}
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        )
    }

    const messages = messages_response.data.messages

    if (messages.length === 0) {
        return (
            <div className='messages'>
                <div className='messages__empty'>
                    <strong>Todavía no hay mensajes en este canal</strong>
                    <span>Publicá el primero con el formulario de abajo.</span>
                </div>
            </div>
        )
    }

    return (
        <div className='messages'>
            {
                messages.map(
                    (message) => {
                        // La membresia pudo borrarse: mostramos un autor generico.
                        const author = message.fk_id_emisor?.fk_id_usuario?.nombre || 'Usuario eliminado'

                        return (
                            <article className='message' key={message._id}>
                                <span
                                    className={`message__avatar workspace-avatar-tone--${getAvatarTone(message.fk_id_emisor?._id || author)}`}
                                    aria-hidden='true'
                                >
                                    {getInitial(author)}
                                </span>

                                <div className='message__content'>
                                    <div className='message__head'>
                                        <strong className='message__author'>{author}</strong>
                                        <time className='message__date'>
                                            {formatDateTime(message.fecha_creacion)}
                                        </time>
                                    </div>
                                    <p className='message__text'>{message.contenido}</p>
                                </div>
                            </article>
                        )
                    }
                )
            }
        </div>
    )
}
