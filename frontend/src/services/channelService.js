import apiRequest from './apiRequest'

/*
Services de canales y mensajes. Todos los paths son relativos al workspace,
porque en el backend el router de canales esta montado dentro de /workspaces.
*/

export async function getChannelsByWorkspaceId(workspace_id) {
    return await apiRequest(`/api/workspaces/${workspace_id}/channels`)
}

export async function createChannel(workspace_id, name, description) {
    return await apiRequest(
        `/api/workspaces/${workspace_id}/channels`,
        {
            method: 'POST',
            body: { name, description }
        }
    )
}

export async function getChannelById(workspace_id, channel_id) {
    return await apiRequest(`/api/workspaces/${workspace_id}/channels/${channel_id}`)
}

export async function getMessagesByChannelId(workspace_id, channel_id) {
    return await apiRequest(
        `/api/workspaces/${workspace_id}/channels/${channel_id}/messages`
    )
}

export async function sendMessage(workspace_id, channel_id, content) {
    return await apiRequest(
        `/api/workspaces/${workspace_id}/channels/${channel_id}/messages`,
        {
            method: 'POST',
            body: { content }
        }
    )
}
