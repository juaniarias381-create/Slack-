/*
Los controllers son la capa de entrada HTTP: leen la request (body/params),
llaman a la capa de servicios (logica de negocio) y formatean la respuesta HTTP
*/

import {
    getWorkspacesByUser,
    getMembersByWorkspaceId,
    createWorkspaceWithOwner,
    deleteWorkspaceWithMemberships,
    updateWorkspaceData
} from '../services/workspace.services.js'


/*
(Authentified) GET /api/workspace
    Traer la lista de espacios de trabajo asociados a ese usuario (basicamente sus membresias),
    con el rol de membresia en cada espacio de trabajo
*/
export async function getUserWorkspaces (request, response) {
    const workspaces_obtenidos = await getWorkspacesByUser(request.user.id)

    return response.status(200).send({
        ok: true,
        message: "Obtenidos todos los datos",
        status: 200,
        data: {
            workspaces: workspaces_obtenidos
        }
    })
}


/*
(Authentified) POST /api/workspace
    Crear un espacio de trabajo: el usuario autenticado queda como 'owner'
*/
export async function createWorkspace (request, response) {
    const { name, description } = request.body

    const { workspace_created, owner_membership } = await createWorkspaceWithOwner(
        request.user.id,
        name,
        description
    )

    return response.status(201).send(
        {
            ok: true,
            status: 201,
            message: "Por ahora todo bien",
            data: {
                workspace_created,
                owner_membership
            }
        }
    )
}


/*
(Authentified) GET /api/workspace/:workspace_id
    Obtener un espacio de trabajo: el middleware ya valido que exista y que
    el usuario sea miembro, e inyecto el workspace en request.workspace
*/
export async function getWorkspaceById (request, response) {
    return response.status(200).send({
        ok: true,
        message: "Workspace obtenido correctamente",
        status: 200,
        data: {
            workspace_selected: request.workspace
        }
    })
}


/*
(Authentified) GET /api/workspace/:workspace_id/members
    Traer la lista de miembros (nombre, email y rol) de un espacio de trabajo:
    el middleware ya valido que exista y que el usuario sea miembro
*/
export async function getWorkspaceMembers (request, response) {
    const members = await getMembersByWorkspaceId(request.workspace._id)

    return response.status(200).send({
        ok: true,
        message: "Miembros obtenidos correctamente",
        status: 200,
        data: {
            members
        }
    })
}


/*
(owner) DELETE /api/workspace/:workspace_id
    Eliminar un espacio de trabajo y sus membresias
*/
export async function deleteWorkspace (request, response) {
    await deleteWorkspaceWithMemberships(request.workspace._id)

    return response.status(200).send({
        ok: true,
        message: "Workspace eliminado correctamente",
        status: 200,
        data: {
            workspace_deleted: request.workspace
        }
    })
}


/*
(owner, admin) PUT /api/workspace/:workspace_id
    Actualizar nombre/descripcion del espacio de trabajo
*/
export async function updateWorkspace (request, response) {
    const { workspace_id } = request.params
    const { name, description } = request.body

    const workspace_updated = await updateWorkspaceData(workspace_id, name, description)

    return response.status(200).send({
        ok: true,
        message: "Workspace actualizado correctamente",
        status: 200,
        data: {
            workspace_updated
        }
    })
}
