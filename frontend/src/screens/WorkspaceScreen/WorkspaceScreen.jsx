import { useContext, useEffect } from 'react'
import { WorkspaceContext } from '../../Context/WorkspaceContext'

export default function WorkspaceScreen() {
    const {
        workspace_response,
        workspace_error,
        workspace_loading,
        members_response,
        members_error,
        members_loading
    } = useContext(WorkspaceContext)

    useEffect(() => {
        console.log('[Workspace] loading:', workspace_loading)
        console.log('[Workspace] response:', workspace_response)
        console.log('[Workspace] error:', workspace_error)

        console.log('[Members] loading:', members_loading)
        console.log('[Members] response:', members_response)
        console.log('[Members] error:', members_error)
    }, [
        workspace_loading,
        workspace_response,
        workspace_error,
        members_loading,
        members_response,
        members_error
    ])

    return (
        <div>
            {/* Por ahora vacia */}
        </div>
    )
}
