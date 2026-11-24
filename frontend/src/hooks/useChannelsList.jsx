import { useCallback, useEffect } from 'react'
import useRequest from './useRequest'
import { getChannelsByWorkspaceId } from '../services/channelService'

export default function useChannelsList(workspace_id) {
    const {
        response,
        error,
        loading,
        sendRequest,
        reset
    } = useRequest()

    const reloadChannels = useCallback(
        () => sendRequest(() => getChannelsByWorkspaceId(workspace_id)),
        [sendRequest, workspace_id]
    )

    useEffect(
        () => {
            if (!workspace_id) {
                reset()
                return
            }

            reloadChannels()
        },
        [workspace_id, reloadChannels, reset]
    )

    return {
        channels_response: response,
        channels_error: error,
        channels_loading: loading,
        reloadChannels
    }
}
