import { useContext } from 'react'
import { ChannelContext } from '../../Context/ChannelContext'
import Messages from '../Messages/Messages'
import MessageForm from '../MessageForm/MessageForm'
import RefreshMessagesButton from './RefreshMessagesButton'
import './Channel.css'

/*
Panel del canal elegido.

4 estados:
- cargando: el Canal todavia no llego
- error: fallo la carga, con boton de reintento
- lista: header + mensajes + formulario
- vacio: lo resuelve Messages (canal sin mensajes)
*/
export default function Channel() {
    const {
        channel_response,
        channel_error,
        channel_loading,
        reloadChannel
    } = useContext(ChannelContext)

    if (channel_loading || (!channel_response && !channel_error)) {
        return (
            <section className='channel-state'>
                <span className='channel-state__text'>Cargando canal…</span>
            </section>
        )
    }

    if (channel_error || !channel_response?.data?.channel) {
        return (
            <section className='channel-state'>
                <span className='channel-state__text'>
                    No se pudo cargar el canal: {channel_error || 'canal no encontrado'}
                </span>
                <button
                    type='button'
                    className='channel-state__button'
                    onClick={reloadChannel}
                >
                    Reintentar
                </button>
            </section>
        )
    }

    const channel = channel_response.data.channel

    return (
        <section className='channel'>
            <header className='channel__header'>
                <div className='channel__heading'>
                    <h2 className='channel__title'># {channel.nombre}</h2>
                    {
                        channel.descripcion
                        && <p className='channel__description'>{channel.descripcion}</p>
                    }
                </div>

                <RefreshMessagesButton />
            </header>

            <Messages />
            <MessageForm />
        </section>
    )
}
