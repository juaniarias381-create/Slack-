import useWorkspaceList from '../../hooks/useWorkspaceList'
import { Link } from 'react-router'
import { FaArrowRight } from 'react-icons/fa'
import './WorkspaceList.css'

/*
Avatar por defecto de cada espacio de trabajo (mismo para todos, como en la referencia de Slack)
*/
const WORKSPACE_AVATAR_URL = 'https://a.slack-edge.com/80588/img/avatars-teams/ava_0018-88.png'

/*
Cantidad maxima de chips de miembros que se muestran por workspace;
si hay mas miembros solo se muestra el conteo
*/
const MAX_MEMBER_CHIPS = 4

export default function WorkspaceList() {

    const {
        workspaces_error,
        workspaces_loading,
        workspaces_response,
        reloadWorkspaces
    } = useWorkspaceList()

    if (workspaces_loading) {
        return <span className='workspace-list__status'>Cargando...</span>
    }
    else if (workspaces_error) {
        return (
            <div className='workspace-list__status'>
                <span className='error-text'>Error: {workspaces_error}</span>
                <button onClick={reloadWorkspaces}> Recargar </button>
            </div>
        )
    }
    else if (!workspaces_response) {
        return (
            <div className='workspace-list__status'>
                <span className='error-text'>Error: Ocurrio un problema al obtener la lista de espacios de trabajo</span>
                <button onClick={reloadWorkspaces}> Recargar </button>
            </div>
        )
    }
    else if (workspaces_response.data.workspaces.length === 0) {
        return <p className='workspace-list__empty'>Aún no creaste ningún espacio de trabajo</p>
    }

    const workspaces = workspaces_response.data.workspaces

    return (
        <div className='workspace-list'>
            <nav className='workspace-list__tabs'>
                <span className='workspace-list__tab workspace-list__tab--active'>Workspaces</span>
            </nav>

            <div className='workspace-list__rows'>
                <p className='workspace-list__section-label'>Ready to launch</p>

                {workspaces.map((workspace) => (
                    <Link
                        key={workspace._id}
                        to={`/workspace/${workspace._id}`}
                        className='workspace-row'
                    >
                        <img
                            className='workspace-row__avatar'
                            src={WORKSPACE_AVATAR_URL}
                            alt={`Avatar de ${workspace.nombre}`}
                        />

                        <div className='workspace-row__info'>
                            <span className='workspace-row__name'>{workspace.nombre}</span>

                            <div className='workspace-row__members'>
                                <span className='workspace-row__chips'>
                                    {workspace.members
                                        .slice(0, MAX_MEMBER_CHIPS)
                                        .map((member) => (
                                            <span
                                                key={member.member_id}
                                                className='member-chip'
                                                title={member.nombre}
                                            >
                                                {member.nombre?.charAt(0).toUpperCase()}
                                            </span>
                                        ))}
                                </span>

                                <span className='workspace-row__count'>
                                    {workspace.members.length} {workspace.members.length === 1 ? 'member' : 'members'}
                                </span>
                            </div>
                        </div>

                        <FaArrowRight className='workspace-row__arrow' aria-hidden='true' />
                    </Link>
                ))}
            </div>

            <footer className='workspace-list__footer'>
                <Link to='/workspaces/new' className='workspace-list__link'>
                    Create a new workspace
                </Link>

                <span className='workspace-list__footer-hint'>
                    Not seeing your workspace?{' '}
                    <Link to='/login' className='workspace-list__link'>
                        Try a different email
                    </Link>
                </span>
            </footer>
        </div>
    )
}
