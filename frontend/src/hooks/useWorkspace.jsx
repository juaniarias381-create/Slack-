import { useEffect } from 'react'
import useRequest from './useRequest'
import { getWorkspaceById } from '../services/workspaceService'

export default function useWorkspace(workspace_id) {
    const { response, error, loading, sendRequest } = useRequest()

    useEffect(
        () => {
            sendRequest(
                () => getWorkspaceById(workspace_id)
            )
        },
        [workspace_id]
    )

    return {
        workspace_response: response,
        workspace_error: error,
        workspace_loading: loading
    }
}