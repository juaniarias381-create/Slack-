import { useContext } from 'react'
import { Link } from 'react-router'
import { WorkspaceContext } from '../../Context/WorkspaceContext'

export default function WorkspaceScreen() {
    const { workspace_response, workspace_error, workspace_loading } = useContext(WorkspaceContext)

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

    return (
        <div>
            <h1>{workspace_response.data.workspace_selected.nombre}</h1>
        </div>
    )
}