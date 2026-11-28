import { createContext, useContext } from 'react'
import { useParams } from 'react-router'
import useWorkspace from '../hooks/useWorkspace'
import useChannelsList from '../hooks/useChannelsList'
import useMemberList from '../hooks/useMemberList'
import {
    addWorkspaceMember,
    deleteWorkspace,
    updateWorkspace
} from '../services/workspaceService'
import {
    createChannel,
    updateChannel as updateChannelRequest,
    deleteChannel as deleteChannelRequest
} from '../services/channelService'

/*
  WorkspaceContext

  Es el "tablero de control" de la pantalla: guarda los datos del workspace,
  canales y miembros, y expone las acciones que pueden hacerlos cambiar.

  Analogia: los hooks son los sensores (lee el estado del mundo) y el Context
  es el panel con los botones (crear/editar/borrar canal, invitar, editar y
  borrar espacio). Los componentes solo miran el panel; no necesitan saber de
  fetch ni de tokens.

  Despues de cada escritura se vuelve a pedir la lista correspondiente, asi
  la UI se actualiza sin recargar la pagina.
*/

const defaultValue = {
    workspace_response: null,
    workspace_error: null,
    workspace_loading: false,
    reloadWorkspace: () => {},
    channels_response: null,
    channels_error: null,
    channels_loading: false,
    reloadChannels: () => {},
    members_response: null,
    members_error: null,
    members_loading: false,
    reloadMembers: () => {},
    is_owner: false,
    can_create_channels: false,
    can_manage_channels: false,
    createChannel: () => {},
    updateChannelInfo: () => {},
    removeChannel: () => {},
    inviteMember: () => {},
    updateWorkspaceInfo: () => {},
    removeWorkspace: () => {}
}

export const WorkspaceContext = createContext(defaultValue)

export const useWorkspaceContext = () => useContext(WorkspaceContext)

export default function WorkspaceContextProvider({ children }) {
    const { workspace_id } = useParams()

    const workspace = useWorkspace(workspace_id)
    const channels = useChannelsList(workspace_id)
    const members = useMemberList(workspace_id)

    const my_role = workspace.workspace_response?.data?.my_role

    /*
    Regla unica para las acciones de canal: solo owner y admin.
    El backend aplica la misma lista en workspaceMiddleware; aca apenas
    ocultamos los botones, no validamos permisos.
    */
    const can_manage_channels = ['owner', 'admin'].includes(my_role)
    const can_create_channels = can_manage_channels
    const is_owner = my_role === 'owner'

    /*
    Las acciones NO manejan errores: si el service lanza, el useRequest del
    modal que la llamo muestra el mensaje. Aca solo nos ocupamos de que el
    estado quede fresco despues del exito.
    */
    async function handleCreateChannel(name, description) {
        const result = await createChannel(workspace_id, name, description)
        await channels.reloadChannels()
        return result
    }

    async function handleUpdateChannelInfo(channel_id, name, description) {
        const result = await updateChannelRequest(
            workspace_id,
            channel_id,
            name,
            description
        )
        await channels.reloadChannels()
        return result
    }

    async function handleRemoveChannel(channel_id) {
        const result = await deleteChannelRequest(workspace_id, channel_id)
        await channels.reloadChannels()
        return result
    }

    async function handleInviteMember(email, rol) {
        const result = await addWorkspaceMember(workspace_id, email, rol)
        await members.reloadMembers()
        return result
    }

    async function handleUpdateWorkspaceInfo(name, description) {
        const result = await updateWorkspace(workspace_id, name, description)
        await workspace.reloadWorkspace()
        return result
    }

    async function handleRemoveWorkspace() {
        return await deleteWorkspace(workspace_id)
    }

    return (
        <WorkspaceContext.Provider
            value={{
                workspace_response: workspace.workspace_response,
                workspace_error: workspace.workspace_error,
                workspace_loading: workspace.workspace_loading,
                reloadWorkspace: workspace.reloadWorkspace,

                channels_response: channels.channels_response,
                channels_error: channels.channels_error,
                channels_loading: channels.channels_loading,
                reloadChannels: channels.reloadChannels,

                members_response: members.members_response,
                members_error: members.members_error,
                members_loading: members.members_loading,
                reloadMembers: members.reloadMembers,

                is_owner,
                can_create_channels,
                can_manage_channels: can_create_channels,

                createChannel: handleCreateChannel,
                updateChannelInfo: handleUpdateChannelInfo,
                removeChannel: handleRemoveChannel,
                inviteMember: handleInviteMember,
                updateWorkspaceInfo: handleUpdateWorkspaceInfo,
                removeWorkspace: handleRemoveWorkspace
            }}
        >
            {children}
        </WorkspaceContext.Provider>
    )
}
