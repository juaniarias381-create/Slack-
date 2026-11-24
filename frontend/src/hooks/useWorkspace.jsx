import { useCallback, useEffect } from 'react'
import useRequest from './useRequest'
import { getWorkspaceById } from '../services/workspaceService'

export default function useWorkspace(workspace_id) {
    const {
        response,
        error,
        loading,
        sendRequest,
        reset
    } = useRequest()

    const reloadWorkspace = useCallback(
        () => sendRequest(() => getWorkspaceById(workspace_id)),
        [sendRequest, workspace_id]
    )

    useEffect(
        () => {
            if (!workspace_id) {
                reset()
                return
            }

            reloadWorkspace()
        },
        [workspace_id, reloadWorkspace, reset]
    )

    return {
        workspace_response: response,
        workspace_error: error,
        workspace_loading: loading,
        reloadWorkspace
    }
}
