import { createContext, useCallback, useContext, useEffect } from 'react'
import { useParams } from 'react-router'
import useRequest from '../hooks/useRequest'
import {
    getChannelById,
    getMessagesByChannelId,
    sendMessage as sendMessageRequest
} from '../services/channelService'

/*
  ChannelContext

  Todo lo que pasa DENTRO de un canal: sus datos, sus mensajes y el envio de
  nuevos mensajes. Se monta en las rutas del workspace y lee workspace_id y
  channel_id de la URL (useParams).

  Analogia: el WorkspaceContext es el edificio y este es el salon elegido.
  Cuando cambias de salon, se vacia el anterior y se carga el nuevo.
*/

const defaultValue = {
    channel_response: null,
    channel_error: null,
    channel_loading: false,
    reloadChannel: () => {},
    messages_response: null,
    messages_error: null,
    messages_loading: false,
    refetchMessages: () => {},
    sendMessage: () => {}
}

export const ChannelContext = createContext(defaultValue)

export const useChannelContext = () => useContext(ChannelContext)

export default function ChannelContextProvider({ children }) {
    const { workspace_id, channel_id } = useParams()

    const {
        response: channel_response,
        error: channel_error,
        loading: channel_loading,
        sendRequest: sendChannelRequest,
        reset: resetChannel
    } = useRequest()

    const {
        response: messages_response,
        error: messages_error,
        loading: messages_loading,
        sendRequest: sendMessagesRequest,
        reset: resetMessages
    } = useRequest()

    const reloadChannel = useCallback(
        () => {
            if (!workspace_id || !channel_id) {
                return
            }
            return sendChannelRequest(
                () => getChannelById(workspace_id, channel_id)
            )
        },
        [channel_id, sendChannelRequest, workspace_id]
    )

    const refetchMessages = useCallback(
        () => {
            if (!workspace_id || !channel_id) {
                return
            }
            return sendMessagesRequest(
                () => getMessagesByChannelId(workspace_id, channel_id)
            )
        },
        [channel_id, sendMessagesRequest, workspace_id]
    )

    useEffect(
        () => {
            if (!workspace_id || !channel_id) {
                resetChannel()
                resetMessages()
                return
            }

            reloadChannel()
            refetchMessages()
        },
        [
            channel_id,
            workspace_id,
            reloadChannel,
            refetchMessages,
            resetChannel,
            resetMessages
        ]
    )

    /*
    Enviar no actualiza el estado "a mano": primero guarda en el backend y
    despues pide un GET de mensajes. Asi el emisor y el orden siempre vienen del
    servidor, que es la fuente de la verdad.
    */
    async function handleSendMessage(content) {
        if (!workspace_id || !channel_id) {
            throw new Error('No hay un canal seleccionado')
        }

        const result = await sendMessageRequest(
            workspace_id,
            channel_id,
            content
        )

        await refetchMessages()

        return result
    }

    return (
        <ChannelContext.Provider
            value={{
                channel_response,
                channel_error,
                channel_loading,
                reloadChannel,
                messages_response,
                messages_error,
                messages_loading,
                refetchMessages,
                sendMessage: handleSendMessage
            }}
        >
            {children}
        </ChannelContext.Provider>
    )
}
