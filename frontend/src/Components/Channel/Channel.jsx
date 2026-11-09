import { useContext } from 'react'
import { ChannelContext } from '../../Context/ChannelContext'
import Messages from '../Messages/Messages'

export default function Channel() {
    const { channel_response, channel_error, channel_loading } = useContext(ChannelContext)

    if (channel_loading || (!channel_response && !channel_error)) {
        return <span>Cargando canal...</span>
    }

    if (channel_error) {
        return <span className='error-text'>Error: {channel_error}</span>
    }

    const channel = channel_response.data.channel

    return (
        <div>
            <h2># {channel.nombre}</h2>
            {channel.descripcion && <p>{channel.descripcion}</p>}
            <Messages />
        </div>
    )
}