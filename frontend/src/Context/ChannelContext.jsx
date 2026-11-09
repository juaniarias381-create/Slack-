import { createContext, useEffect } from 'react'
import { useParams } from 'react-router'
import useRequest from '../hooks/useRequest'
import { getChannelById, getMessagesByChannelId } from '../services/channelService'

export const ChannelContext = createContext({
    channel_response: null,
    channel_error: null,
    channel_loading: false,
    messages_response: null,
    messages_error: null,
    messages_loading: false,
    reloadMessages: () => {}
})

export default function ChannelContextProvider({ children }) {
    const { workspace_id, channel_id } = useParams()

    const channel_request = useRequest()
    const messages_request = useRequest()

    function reloadMessages() {
        messages_request.sendRequest(
            () => getMessagesByChannelId(workspace_id, channel_id)
        )
    }

    useEffect(
        () => {
            channel_request.sendRequest(
                () => getChannelById(workspace_id, channel_id)
            )
            messages_request.sendRequest(
                () => getMessagesByChannelId(workspace_id, channel_id)
            )
        },
        [workspace_id, channel_id]
    )

    return (
        <ChannelContext.Provider
            value={{
                channel_response: channel_request.response,
                channel_error: channel_request.error,
                channel_loading: channel_request.loading,
                messages_response: messages_request.response,
                messages_error: messages_request.error,
                messages_loading: messages_request.loading,
                reloadMessages
            }}
        >
            {children}
        </ChannelContext.Provider>
    )
}