/*
Capa de servicios de workspace

Aca vive la logica de negocio de cada endpoint de workspace (los controllers solo
leen la request, llaman al servicio y formatean la respuesta HTTP)

Responsabilidades por servicio:
    - getWorkspacesByUser: trae todos los espacios de trabajo de un usuario, cada uno con su lista de miembros (nombre y rol)
    - createWorkspaceWithOwner: crea el espacio de trabajo y le asigna al creador una membresia de 'owner'
    - deleteWorkspaceWithMemberships: elimina el espacio de trabajo y, en cascada, todas sus membresias
    - updateWorkspaceData: valida los campos requeridos y actualiza nombre/descripcion del workspace
*/

import workspace_repository from '../repositories/workspace.repository.js'
import member_repository from '../repositories/member.repository.js'
import ServerError from '../utils/error.util.js'


/*
Traer todos los espacios de trabajo asociados a un usuario,
con la lista de miembros (nombre y rol) de cada espacio de trabajo
*/
export async function getWorkspacesByUser (user_id) {
    return await member_repository.getAllWorkspacesWithMembersByUserId(user_id)
}


/*
Traer la lista de miembros de un espacio de trabajo,
con el nombre, email y rol de cada membresia
*/
export async function getMembersByWorkspaceId (workspace_id) {
    const memberships = await member_repository.getAllMembershipsByWorkspaceId(workspace_id)

    return memberships.map(
        membership => {
            return {
                member_id: membership._id,
                nombre: membership.fk_id_usuario?.nombre,
                email: membership.fk_id_usuario?.email,
                rol: membership.rol
            }
        }
    )
}


/*
Crear un espacio de trabajo y asignar al usuario creador
una membresia con el rol de 'owner'
*/
export async function createWorkspaceWithOwner (user_id, name, description) {
    const workspace_created = await workspace_repository.createWorkspace(name, description)

    const owner_membership = await member_repository.create(
        user_id,
        workspace_created._id,
        'owner'
    )

    return {
        workspace_created,
        owner_membership
    }
}


/*
Eliminar un espacio de trabajo y, en cascada, todas las membresias
que apuntaban a ese espacio de trabajo
*/
export async function deleteWorkspaceWithMemberships (workspace_id) {
    await workspace_repository.deleteById(workspace_id)
    await member_repository.deleteAllMembershipsByWorkspaceId(workspace_id)
}


/*
Actualizar el nombre/descripcion de un espacio de trabajo.
Valida que los campos requeridos vengan completos
*/
export async function updateWorkspaceData (workspace_id, name, description) {
    if(!name || !description){
        throw new ServerError("name y description son campos requeridos", 400)
    }

    return await workspace_repository.updateById(
        workspace_id,
        { nombre: name, description }
    )
}
