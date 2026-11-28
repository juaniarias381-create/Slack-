import { useNavigate } from 'react-router'
import './WorkspaceHeader.css'

export default function WorkspaceHeader({ workspace }) {
    const navigate = useNavigate()

    /*
    Cerrar sesion: sacamos el token guardado y volvemos al login. Asi una
    cuenta nueva no hereda los permisos de la sesion anterior.
    */
    function handleLogout() {
        localStorage.removeItem('auth_token')
        navigate('/login')
    }

    return (
        <header className='workspace-main-header'>
            <div className='workspace-main-header__info'>
                <h1 className='workspace-main-header__title'>
                    {workspace?.nombre || 'Workspace'}
                </h1>

                {
                    workspace?.description
                    &&
                    <p className='workspace-main-header__description'>
                        {workspace.description}
                    </p>
                }
            </div>

            <button
                type='button'
                className='workspace-main-header__logout'
                onClick={handleLogout}
            >
                Cerrar sesión
            </button>
        </header>
    )
}
