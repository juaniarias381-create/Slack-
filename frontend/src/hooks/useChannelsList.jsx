import { useEffect } from 'react'
import useRequest from './useRequest'
import { getChannelsByWorkspaceId } from '../services/workspaceService'

export default function useChannelsList(workspace_id) {
    const { response, error, loading, sendRequest } = useRequest()

    function reloadChannels() {
        sendRequest(
            () => getChannelsByWorkspaceId(workspace_id)
        )
    }

    useEffect(
        () => {
            reloadChannels()
        },
        [workspace_id]
    )

    return {
        channels_response: response,
        channels_error: error,
        channels_loading: loading,
        reloadChannels
    }
}
