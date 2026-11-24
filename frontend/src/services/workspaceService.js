import apiRequest from './apiRequest'

/*
Services de workspace: traducen acciones de la UI a llamadas HTTP.
El componente/Context no sabe nada de URLs ni de tokens; solo llama aca.
*/

export async function createWorkspace(name, description) {
    return await apiRequest(
        '/api/workspaces',
        {
            method: 'POST',
            body: { name, description }
        }
    )
}

export async function getAllWorkspaces() {
    return await apiRequest('/api/workspaces')
}

export async function getWorkspaceById(workspace_id) {
    return await apiRequest(`/api/workspaces/${workspace_id}`)
}

export async function getMembersByWorkspaceId(workspace_id) {
    return await apiRequest(`/api/workspaces/${workspace_id}/members`)
}

export async function updateWorkspace(workspace_id, name, description) {
    return await apiRequest(
        `/api/workspaces/${workspace_id}`,
        {
            method: 'PUT',
            body: { name, description }
        }
    )
}

export async function deleteWorkspace(workspace_id) {
    return await apiRequest(
        `/api/workspaces/${workspace_id}`,
        {
            method: 'DELETE'
        }
    )
}

export async function addWorkspaceMember(workspace_id, email, rol) {
    return await apiRequest(
        `/api/workspaces/${workspace_id}/members`,
        {
            method: 'POST',
            body: { email, rol }
        }
    )
}
