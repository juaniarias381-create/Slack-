import { useContext } from 'react'
import { Link } from 'react-router'
import { WorkspaceContext } from '../../Context/WorkspaceContext'

export default function ChannelList() {
    const {
        workspace_response,
        channels_response,
        channels_error,
        channels_loading,
        reloadChannels
    } = useContext(WorkspaceContext)

    if (channels_loading || (!channels_response && !channels_error)) {
        return <span>Cargando canales...</span>
    }

    if (channels_error) {
        return (
            <div>
                <span className='error-text'>Error: {channels_error}</span>
                <button onClick={reloadChannels}>Recargar</button>
            </div>
        )
    }

    const channels = channels_response.data.channels
    const workspace_id = workspace_response?.data?.workspace_selected?._id

    if (channels.length === 0) {
        return <p>Este espacio de trabajo aún no tiene canales</p>
    }

    return (
        <div>
            <h3>Canales</h3>
            {channels.map((channel) => (
                <div key={channel._id}>
                    <Link to={`/workspace/${workspace_id}/channel/${channel._id}`}>
                        # {channel.nombre}
                    </Link>
                </div>
            ))}
        </div>
    )
}