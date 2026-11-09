import { useContext } from 'react'
import { WorkspaceContext } from '../../Context/WorkspaceContext'
import ChannelList from '../../Components/ChannelList/ChannelList'
import { Link, Outlet } from 'react-router'

export default function WorkspaceScreen() {
    const {
        workspace_response,
        workspace_error,
        workspace_loading,
        members_response
    } = useContext(WorkspaceContext)

    if (workspace_loading || (!workspace_response && !workspace_error)) {
        return <span>Cargando...</span>
    }

    if (workspace_error) {
        return (
            <div>
                <span className='error-text'>Error: {workspace_error}</span>
                <Link to='/home'>Volver al inicio</Link>
            </div>
        )
    }

    const workspace = workspace_response.data.workspace_selected
    const members_count = members_response?.data?.members?.length

return (
    <div>
        <h1>{workspace.nombre}</h1>
        {members_count !== undefined && <span>{members_count} miembros</span>}
        <div>
            <ChannelList />
            <button>Add member</button>
        </div>
        <Outlet />
    </div>
)
}