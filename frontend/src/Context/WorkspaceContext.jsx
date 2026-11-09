import { createContext, useEffect } from 'react'
import { useParams } from 'react-router'
import useRequest from '../hooks/useRequest'
import { getWorkspaceById } from '../services/workspaceService'

export const WorkspaceContext = createContext({
    workspace_response: null,
    workspace_error: null,
    workspace_loading: false
})

export default function WorkspaceContextProvider({ children }) {
    const { workspace_id } = useParams()
    const { response, error, loading, sendRequest } = useRequest()

    useEffect(
        () => {
            sendRequest(
                () => getWorkspaceById(workspace_id)
            )
        },
        [workspace_id]
    )

    return (
        <WorkspaceContext.Provider
            value={{
                workspace_response: response,
                workspace_error: error,
                workspace_loading: loading
            }}
        >
            {children}
        </WorkspaceContext.Provider>
    )
}