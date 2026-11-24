import { useContext, useRef, useState } from 'react'
import { FaPaperPlane } from 'react-icons/fa6'
import { ChannelContext } from '../../Context/ChannelContext'
import useRequest from '../../hooks/useRequest'
import Alert from '../Alert/Alert'
import './MessageForm.css'

export default function MessageForm() {
    const { sendMessage } = useContext(ChannelContext)

    const [content, set_content] = useState('')
    const { loading, error, sendRequest } = useRequest()
    const sending_ref = useRef(false)

    async function submitMessage() {
        const normalized_content = content.trim()

        if (!normalized_content || sending_ref.current) {
            return
        }

        sending_ref.current = true

        try {
            const result = await sendRequest(
                () => sendMessage(normalized_content)
            )

            if (result) {
                set_content('')
            }
        }
        finally {
            sending_ref.current = false
        }
    }

    function handleSubmit(event) {
        event.preventDefault()
        submitMessage()
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            submitMessage()
        }
    }

    return (
        <form className='message-form' onSubmit={handleSubmit}>
            {
                error
                &&
                !loading
                &&
                <div className='message-form__error'>
                    <Alert type='error'>{error}</Alert>
                </div>
            }

            <div className='message-form__box'>
                <textarea
                    className='message-form__input'
                    name='content'
                    value={content}
                    onChange={(event) => set_content(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder='Escribí un mensaje…'
                    maxLength={2000}
                    rows={1}
                    aria-label='Mensaje'
                />

                <button
                    type='submit'
                    className='message-form__send'
                    disabled={loading || content.trim().length === 0}
                    aria-label='Enviar mensaje'
                    title='Enviar mensaje'
                >
                    <FaPaperPlane aria-hidden='true' />
                </button>
            </div>

            <div className='message-form__footer'>
                <span className='message-form__hint'>
                    Enter para enviar · Shift + Enter para salto de línea
                </span>

                {
                    content.length > 1800
                    &&
                    <span className='message-form__counter'>
                        {content.length}/2000
                    </span>
                }
            </div>
        </form>
    )
}
