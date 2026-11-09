import { useContext } from 'react'
import { ChannelContext } from '../../Context/ChannelContext'

export default function Messages() {
    const {
        messages_response,
        messages_error,
        messages_loading,
        reloadMessages
    } = useContext(ChannelContext)

    if (messages_loading || (!messages_response && !messages_error)) {
        return <span>Cargando mensajes...</span>
    }

    if (messages_error) {
        return (
            <div>
                <span className='error-text'>Error: {messages_error}</span>
                <button onClick={reloadMessages}>Recargar</button>
            </div>
        )
    }

    const messages = messages_response.data.messages

    if (messages.length === 0) {
        return <p>Todavía no hay mensajes en este canal</p>
    }

    return (
        <div>
            {messages.map((message) => {
                //El emisor podria ser null si su membresia se borro
                const author = message.fk_id_emisor?.fk_id_usuario?.nombre ?? 'Usuario eliminado'

                return (
                    <div key={message._id}>
                        <strong>{author}</strong>
                        <span> {new Date(message.fecha_creacion).toLocaleString('es-AR')}</span>
                        <p>{message.contenido}</p>
                    </div>
                )
            })}
        </div>
    )
}
