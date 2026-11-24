import { useCallback, useEffect } from 'react'
import useRequest from './useRequest'
import { getMembersByWorkspaceId } from '../services/workspaceService'

export default function useMemberList(workspace_id) {
    const {
        response,
        error,
        loading,
        sendRequest,
        reset
    } = useRequest()

    const reloadMembers = useCallback(
        () => sendRequest(() => getMembersByWorkspaceId(workspace_id)),
        [sendRequest, workspace_id]
    )

    useEffect(
        () => {
            if (!workspace_id) {
                reset()
                return
            }

            reloadMembers()
        },
        [workspace_id, reloadMembers, reset]
    )

    return {
        members_response: response,
        members_error: error,
        members_loading: loading,
        reloadMembers
    }
}
