import { createContext, useEffect } from 'react'
import { useParams } from 'react-router'
import useRequest from '../hooks/useRequest'
import {
    getWorkspaceById,
    getChannelsByWorkspaceId,
    getMembersByWorkspaceId
} from '../services/workspaceService'

export const WorkspaceContext = createContext({
    workspace_response: null,
    workspace_error: null,
    workspace_loading: false,
    channels_response: null,
    channels_error: null,
    channels_loading: false,
    reloadChannels: () => {},
    members_response: null,
    members_error: null,
    members_loading: false
})

export default function WorkspaceContextProvider({ children }) {
    const { workspace_id } = useParams()

    /* 
    useRequest maneja el estado de UNA sola consulta, por eso usamos uno por cada endpoint
    */
    const workspace_request = useRequest()
    const channels_request = useRequest()
    const members_request = useRequest()

    function reloadChannels() {
        channels_request.sendRequest(
            () => getChannelsByWorkspaceId(workspace_id)
        )
    }

    useEffect(
        () => {
            workspace_request.sendRequest(
                () => getWorkspaceById(workspace_id)
            )
            channels_request.sendRequest(
                () => getChannelsByWorkspaceId(workspace_id)
            )
            members_request.sendRequest(
                () => getMembersByWorkspaceId(workspace_id)
            )
        },
        [workspace_id]
    )

    return (
        <WorkspaceContext.Provider
            value={{
                workspace_response: workspace_request.response,
                workspace_error: workspace_request.error,
                workspace_loading: workspace_request.loading,
                channels_response: channels_request.response,
                channels_error: channels_request.error,
                channels_loading: channels_request.loading,
                reloadChannels,
                members_response: members_request.response,
                members_error: members_request.error,
                members_loading: members_request.loading
            }}
        >
            {children}
        </WorkspaceContext.Provider>
    )
}