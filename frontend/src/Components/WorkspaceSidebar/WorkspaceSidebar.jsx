import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router'
import { FaArrowLeft, FaEllipsisVertical, FaPenToSquare, FaPlus, FaTrashCan } from 'react-icons/fa6'
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
    onOpenAddMember,
    onEdit,
    onDelete
}) {
    const workspace_id = workspace?._id
    const [workspace_menu_open, set_workspace_menu_open] = useState(false)
    const workspace_menu_ref = useRef(null)

    useEffect(
        () => {
            if (!workspace_menu_open) return

            function handlePointerDown(event) {
                if (!workspace_menu_ref.current?.contains(event.target)) {
                    set_workspace_menu_open(false)
                }
            }

            function handleKeyDown(event) {
                if (event.key === 'Escape') {
                    set_workspace_menu_open(false)
                }
            }

            document.addEventListener('pointerdown', handlePointerDown)
            document.addEventListener('keydown', handleKeyDown)

            return () => {
                document.removeEventListener('pointerdown', handlePointerDown)
                document.removeEventListener('keydown', handleKeyDown)
            }
        },
        [workspace_menu_open]
    )

    function handleEdit() {
        set_workspace_menu_open(false)
        onEdit()
    }

    function handleDelete() {
        set_workspace_menu_open(false)
        onDelete()
    }

    return (
        <aside className='workspace-sidebar'>
            <div
                className='workspace-sidebar__identity-row'
                ref={workspace_menu_ref}
            >
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

                {
                    is_owner
                    &&
                    <button
                        type='button'
                        className='workspace-sidebar__menu-button'
                        onClick={() => set_workspace_menu_open(true)}
                        aria-label='Opciones del espacio'
                        aria-haspopup='menu'
                        aria-expanded={workspace_menu_open}
                        title='Opciones del espacio'
                    >
                        <FaEllipsisVertical aria-hidden='true' />
                    </button>
                }

                {
                    is_owner
                    &&
                    workspace_menu_open
                    &&
                    <div className='workspace-sidebar__menu' role='menu'>
                        <button
                            type='button'
                            role='menuitem'
                            className='workspace-sidebar__menu-item'
                            onClick={handleEdit}
                        >
                            <FaPenToSquare aria-hidden='true' />
                            Editar espacio
                        </button>

                        <button
                            type='button'
                            role='menuitem'
                            className='workspace-sidebar__menu-item workspace-sidebar__menu-item--danger'
                            onClick={handleDelete}
                        >
                            <FaTrashCan aria-hidden='true' />
                            Eliminar espacio
                        </button>
                    </div>
                }
            </div>

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
