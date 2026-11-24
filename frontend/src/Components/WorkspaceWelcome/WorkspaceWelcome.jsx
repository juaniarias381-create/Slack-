import { formatDate, getInitial, pluralize } from '../../utils/format.util'
import './WorkspaceWelcome.css'

export default function WorkspaceWelcome({
    workspace,
    members_count,
    channels_count,
    members_loading,
    channels_loading
}) {
    const members_text = members_loading
        ? '…'
        : pluralize(members_count, 'miembro', 'miembros')

    const channels_text = channels_loading
        ? '…'
        : pluralize(channels_count, 'canal', 'canales')

    return (
        <section className='workspace-welcome'>
            <span className='workspace-welcome__avatar' aria-hidden='true'>
                {getInitial(workspace?.nombre)}
            </span>

            <h2 className='workspace-welcome__title'>
                Bienvenido a {workspace?.nombre}
            </h2>

            {
                workspace?.description
                ? <p className='workspace-welcome__description'>{workspace.description}</p>
                : <p className='workspace-welcome__description workspace-welcome__description--muted'>
                    Este espacio todavía no tiene una descripción.
                </p>
            }

            <p className='workspace-welcome__meta'>
                Creado el {formatDate(workspace?.fecha_creacion)}
                {' · '}
                {members_text}
                {' · '}
                {channels_text}
            </p>

            {
                channels_count === 0
                ? <p className='workspace-welcome__hint'>
                    Este espacio todavía no tiene canales. Creá el primero
                    desde la barra lateral.
                  </p>
                : <p className='workspace-welcome__hint'>
                    Elegí un canal de la izquierda para empezar a chatear
                  </p>
            }
        </section>
    )
}
