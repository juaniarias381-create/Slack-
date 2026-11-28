import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useWorkspaceContext } from '../../Context/WorkspaceContext'
import { useChannelContext } from '../../Context/ChannelContext'
import WorkspaceSidebar from '../../Components/WorkspaceSidebar/WorkspaceSidebar'
import WorkspaceHeader from '../../Components/WorkspaceHeader/WorkspaceHeader'
import WorkspaceWelcome from '../../Components/WorkspaceWelcome/WorkspaceWelcome'
import Channel from '../../Components/Channel/Channel'
import CreateChannelModal from '../../Components/CreateChannelModal/CreateChannelModal'
import AddMemberModal from '../../Components/AddMemberModal/AddMemberModal'
import EditWorkspaceModal from '../../Components/EditWorkspaceModal/EditWorkspaceModal'
import DeleteWorkspaceModal from '../../Components/DeleteWorkspaceModal/DeleteWorkspaceModal'
import EditChannelModal from '../../Components/EditChannelModal/EditChannelModal'
import DeleteChannelModal from '../../Components/DeleteChannelModal/DeleteChannelModal'
import Alert from '../../Components/Alert/Alert'
import './WorkspaceScreen.css'

/*
  WorkspaceScreen

  Arma el rompecabezas: sidebar + header + panel central (bienvenida o canal).
  Los datos vienen de los Contexts; aca solo se decide QUE se muestra en cada
  caso y cuales modales estan abiertos.

  4 estados globales: cargando / error / sin datos / pantalla completa.
  Los estados de canales, miembros y mensajes se manejan dentro de sus
  componentes para que un fallo parcial no tape todo el workspace.
*/
export default function WorkspaceScreen() {
    const navigate = useNavigate()
    const { workspace_id, channel_id } = useParams()

    const { reloadChannel } = useChannelContext()

    const {
        workspace_response,
        workspace_error,
        workspace_loading,
        reloadWorkspace,
        channels_response,
        channels_error,
        channels_loading,
        reloadChannels,
        members_response,
        members_error,
        members_loading,
        reloadMembers,
        is_owner,
        can_create_channels,
        can_manage_channels
    } = useWorkspaceContext()

    const [create_channel_open, set_create_channel_open] = useState(false)
    const [add_member_open, set_add_member_open] = useState(false)
    const [edit_workspace_open, set_edit_workspace_open] = useState(false)
    const [delete_workspace_open, set_delete_workspace_open] = useState(false)
    const [channel_to_edit, set_channel_to_edit] = useState(null)
    const [channel_to_delete, set_channel_to_delete] = useState(null)

    // --- CASO 1: cargando ---
    if (workspace_loading) {
        return (
            <div className='workspace-state'>
                <p>Cargando espacio de trabajo…</p>
            </div>
        )
    }

    // --- CASO 2: error ---
    if (workspace_error) {
        return (
            <div className='workspace-state'>
                <Alert type='error'>{workspace_error}</Alert>
                <div className='workspace-state__actions'>
                    <button
                        type='button'
                        className='workspace-state__button'
                        onClick={reloadWorkspace}
                    >
                        Reintentar
                    </button>
                    <Link to='/home' className='workspace-state__link'>
                        Volver al inicio
                    </Link>
                </div>
            </div>
        )
    }

    const workspace = workspace_response?.data?.workspace_selected
    const channels = channels_response?.data?.channels || []
    const members = members_response?.data?.members || []

    // --- CASO 3: sin datos (por ejemplo, un id inexistente) ---
    if (!workspace) {
        return (
            <div className='workspace-state'>
                <p>No encontramos este espacio de trabajo.</p>
                <Link to='/home' className='workspace-state__link'>
                    Volver al inicio
                </Link>
            </div>
        )
    }

    // --- CASO 4: pantalla completa ---
    return (
        <div className='workspace-layout'>
            <WorkspaceSidebar
                workspace={workspace}
                channels={channels}
                channels_loading={channels_loading}
                channels_error={channels_error}
                reloadChannels={reloadChannels}
                members={members}
                members_loading={members_loading}
                members_error={members_error}
                reloadMembers={reloadMembers}
                can_create_channels={can_create_channels}
                can_manage_channels={can_manage_channels}
                is_owner={is_owner}
                onOpenCreateChannel={() => set_create_channel_open(true)}
                onOpenAddMember={() => set_add_member_open(true)}
                onEdit={() => set_edit_workspace_open(true)}
                onDelete={() => set_delete_workspace_open(true)}
                onEditChannel={(channel) => set_channel_to_edit(channel)}
                onDeleteChannel={(channel) => set_channel_to_delete(channel)}
            />

            <main className='workspace-content'>
                <WorkspaceHeader workspace={workspace} />

                {
                    channel_id
                    ? <Channel />
                    : <WorkspaceWelcome
                        workspace={workspace}
                        members_count={members.length}
                        channels_count={channels.length}
                        members_loading={members_loading}
                        channels_loading={channels_loading}
                    />
                }
            </main>

            {
                create_channel_open
                && <CreateChannelModal
                    onClose={() => set_create_channel_open(false)}
                    onCreated={() => set_create_channel_open(false)}
                />
            }

            {
                add_member_open
                && <AddMemberModal
                    onClose={() => set_add_member_open(false)}
                    onCreated={() => set_add_member_open(false)}
                />
            }

            {
                edit_workspace_open
                && <EditWorkspaceModal
                    workspace={workspace}
                    onClose={() => set_edit_workspace_open(false)}
                    onSaved={() => set_edit_workspace_open(false)}
                />
            }

            {
                delete_workspace_open
                && <DeleteWorkspaceModal
                    workspace={workspace}
                    onClose={() => set_delete_workspace_open(false)}
                    onDeleted={() => navigate('/home')}
                />
            }

            {
                channel_to_edit
                && <EditChannelModal
                    channel={channel_to_edit}
                    onClose={() => set_channel_to_edit(null)}
                    onSaved={() => {
                        if (channel_to_edit._id === channel_id) {
                            reloadChannel()
                        }
                        set_channel_to_edit(null)
                    }}
                />
            }

            {
                channel_to_delete
                && <DeleteChannelModal
                    channel={channel_to_delete}
                    onClose={() => set_channel_to_delete(null)}
                    onDeleted={() => {
                        if (channel_to_delete._id === channel_id) {
                            navigate(`/workspace/${workspace_id}`)
                        }
                        set_channel_to_delete(null)
                    }}
                />
            }
        </div>
    )
}
