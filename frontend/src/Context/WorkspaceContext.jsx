import { createContext } from 'react'
import { useParams } from 'react-router'
import useWorkspace from '../hooks/useWorkspace'
import useChannelsList from '../hooks/useChannelsList'
import useMemberList from '../hooks/useMemberList'

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

    const workspace = useWorkspace(workspace_id)
    const channels = useChannelsList(workspace_id)
    const members = useMemberList(workspace_id)

    return (
        <WorkspaceContext.Provider
            value={{
                ...workspace,
                ...channels,
                ...members
            }}
        >
            {children}
        </WorkspaceContext.Provider>
    )
}