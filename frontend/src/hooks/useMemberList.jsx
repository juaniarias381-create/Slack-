import { useEffect } from 'react'
import useRequest from './useRequest'
import { getMembersByWorkspaceId } from '../services/workspaceService'

export default function useMemberList(workspace_id) {
    const { response, error, loading, sendRequest } = useRequest()

    useEffect(
        () => {
            sendRequest(
                () => getMembersByWorkspaceId(workspace_id)
            )
        },
        [workspace_id]
    )

    return {
        members_response: response,
        members_error: error,
        members_loading: loading
    }
}