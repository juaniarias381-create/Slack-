import { FaPenToSquare, FaTrashCan } from 'react-icons/fa6'
import './WorkspaceHeader.css'

export default function WorkspaceHeader({ workspace, is_owner, onEdit, onDelete }) {
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

            {
                is_owner
                &&
                <div className='workspace-main-header__actions'>
                    <button
                        type='button'
                        className='workspace-main-header__button'
                        onClick={onEdit}
                    >
                        <FaPenToSquare aria-hidden='true' />
                        Editar espacio
                    </button>

                    <button
                        type='button'
                        className='workspace-main-header__button workspace-main-header__button--danger'
                        onClick={onDelete}
                    >
                        <FaTrashCan aria-hidden='true' />
                        Eliminar espacio
                    </button>
                </div>
            }
        </header>
    )
}
