import { Link, NavLink } from 'react-router'
import { FaArrowLeft, FaPlus } from 'react-icons/fa6'
import { getAvatarTone, getInitial } from '../../utils/format.util'
import './WorkspaceSidebar.css'

const ROLE_LABELS = {
    owner: 'OWNER',
    admin: 'ADMIN',
    user: 'MIEMBRO'
}

function SidebarStatus({ children, is_error = false, onRetry }) {
    return (
        <div className={`workspace-sidebar__status${is_error ? ' workspace-sidebar__status--error' : ''}`}>
            <span>{children}</span>
            {
                onRetry
                &&
                <button
                    type='button'
                    className='workspace-sidebar__retry'
                    onClick={() => onRetry()}
                >
                    Reintentar
                </button>
            }
        </div>
    )
}

export default function WorkspaceSidebar({
    workspace,
    channels,
    channels_loading,
    channels_error,
    reloadChannels,
    members,
    members_loading,
    members_error,
    reloadMembers,
    can_create_channels,
    is_owner,
    onOpenCreateChannel,
    onOpenAddMember
}) {
    const workspace_id = workspace?._id

    return (
        <aside className='workspace-sidebar'>
            <Link
                to={`/workspace/${workspace_id}`}
                className='workspace-sidebar__identity'
                title='Volver a la bienvenida del espacio'
            >
                <span
                    className='workspace-sidebar__avatar'
                    aria-hidden='true'
                >
                    {getInitial(workspace?.nombre)}
                </span>

                <div className='workspace-sidebar__identity-info'>
                    <strong className='workspace-sidebar__workspace-name'>
                        {workspace?.nombre || 'Workspace'}
                    </strong>
                    <span className='workspace-sidebar__workspace-subtitle'>
                        Espacio de trabajo
                    </span>
                </div>
            </Link>

            <section className='workspace-sidebar__section'>
                <div className='workspace-sidebar__section-head'>
                    <span className='workspace-sidebar__section-title'>
                        Canales
                        <span className='workspace-sidebar__count'>
                            {channels.length}
                        </span>
                    </span>

                    {
                        can_create_channels
                        &&
                        <button
                            type='button'
                            className='workspace-sidebar__add'
                            onClick={onOpenCreateChannel}
                            aria-label='Crear canal'
                            title='Crear canal'
                        >
                            <FaPlus aria-hidden='true' />
                        </button>
                    }
                </div>

                {
                    channels_loading
                    &&
                    <SidebarStatus>Cargando canales…</SidebarStatus>
                }

                {
                    !channels_loading
                    &&
                    channels_error
                    &&
                    <SidebarStatus is_error onRetry={reloadChannels}>
                        {channels_error}
                    </SidebarStatus>
                }

                {
                    !channels_loading
                    &&
                    !channels_error
                    &&
                    channels.length === 0
                    &&
                    <SidebarStatus>
                        Todavía no hay canales
                    </SidebarStatus>
                }

                {
                    !channels_loading
                    &&
                    !channels_error
                    &&
                    channels.length > 0
                    &&
                    <ul className='workspace-sidebar__list'>
                        {
                            channels.map(
                                (channel) => (
                                    <li key={channel._id}>
                                        <NavLink
                                            to={`/workspace/${workspace_id}/channel/${channel._id}`}
                                            className={
                                                ({ isActive }) => (
                                                    'workspace-sidebar__channel'
                                                    + (isActive ? ' workspace-sidebar__channel--active' : '')
                                                )
                                            }
                                        >
                                            <span className='workspace-sidebar__hash' aria-hidden='true'>
                                                #
                                            </span>
                                            <span className='workspace-sidebar__channel-name'>
                                                {channel.nombre}
                                            </span>
                                        </NavLink>
                                    </li>
                                )
                            )
                        }
                    </ul>
                }
            </section>

            <section className='workspace-sidebar__section'>
                <div className='workspace-sidebar__section-head'>
                    <span className='workspace-sidebar__section-title'>
                        Miembros
                        <span className='workspace-sidebar__count'>
                            {members.length}
                        </span>
                    </span>

                    {
                        is_owner
                        &&
                        <button
                            type='button'
                            className='workspace-sidebar__add'
                            onClick={onOpenAddMember}
                            aria-label='Agregar miembro'
                            title='Agregar miembro'
                        >
                            <FaPlus aria-hidden='true' />
                        </button>
                    }
                </div>

                {
                    members_loading
                    &&
                    <SidebarStatus>Cargando miembros…</SidebarStatus>
                }

                {
                    !members_loading
                    &&
                    members_error
                    &&
                    <SidebarStatus is_error onRetry={reloadMembers}>
                        {members_error}
                    </SidebarStatus>
                }

                {
                    !members_loading
                    &&
                    !members_error
                    &&
                    members.length === 0
                    &&
                    <SidebarStatus>
                        Este espacio todavía no tiene miembros
                    </SidebarStatus>
                }

                {
                    !members_loading
                    &&
                    !members_error
                    &&
                    members.length > 0
                    &&
                    <ul className='workspace-sidebar__list'>
                        {
                            members.map(
                                (member) => (
                                    <li
                                        key={member.member_id}
                                        className='workspace-sidebar__member'
                                    >
                                        <span
                                            className={`workspace-sidebar__member-avatar workspace-avatar-tone--${getAvatarTone(member.member_id || member.nombre)}`}
                                            aria-hidden='true'
                                        >
                                            {getInitial(member.nombre)}
                                        </span>

                                        <span className='workspace-sidebar__member-name'>
                                            {member.nombre || member.email}
                                        </span>

                                        <span className={`workspace-sidebar__role workspace-sidebar__role--${member.rol}`}>
                                            {ROLE_LABELS[member.rol] || member.rol}
                                        </span>
                                    </li>
                                )
                            )
                        }
                    </ul>
                }
            </section>

            <footer className='workspace-sidebar__footer'>
                <Link to='/home' className='workspace-sidebar__back'>
                    <FaArrowLeft aria-hidden='true' />
                    Volver al inicio
                </Link>
            </footer>
        </aside>
    )
}
