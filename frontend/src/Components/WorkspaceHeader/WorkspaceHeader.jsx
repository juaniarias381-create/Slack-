import './WorkspaceHeader.css'

export default function WorkspaceHeader({ workspace }) {
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
        </header>
    )
}
