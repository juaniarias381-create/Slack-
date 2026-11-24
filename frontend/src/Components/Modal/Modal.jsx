import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { FaXmark } from 'react-icons/fa6'
import './Modal.css'

/*
  Modal reutilizable (portal a document.body).

  Uso:
    <Modal title="Agregar miembro" onClose={() => setOpen(false)}>
      ...contenido...
    </Modal>

  - Cierra con Escape y con click en el overlay.
  - Bloquea el scroll del body mientras esta abierto.
  - Enfoca el primer campo del contenido al abrir.
*/
export default function Modal({ title, onClose, children }) {
  const title_id = useId()
  const dialog_ref = useRef(null)

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    const previous_body_overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previous_body_overflow
    }
  }, [onClose])

  useEffect(() => {
    const first_field = dialog_ref.current?.querySelector(
      'input, select, textarea, button'
    )
    first_field?.focus()
  }, [])

  function handleOverlayMouseDown(event) {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return createPortal(
    <div className='modal-overlay' onMouseDown={handleOverlayMouseDown}>
      <div
        className='modal'
        role='dialog'
        aria-modal='true'
        aria-labelledby={title_id}
        ref={dialog_ref}
      >
        <header className='modal__header'>
          <h2 className='modal__title' id={title_id}>
            {title}
          </h2>

          <button
            type='button'
            className='modal__close'
            onClick={onClose}
            aria-label='Cerrar'
          >
            <FaXmark aria-hidden='true' />
          </button>
        </header>

        <div className='modal__body'>{children}</div>
      </div>
    </div>,
    document.body
  )
}
