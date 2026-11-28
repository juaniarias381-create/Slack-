/*
Capa de servicios de workspace

Aca vive la logica de negocio de cada endpoint de workspace (los controllers solo
leen la request, llaman al servicio y formatean la respuesta HTTP)

Responsabilidades por servicio:
    - getWorkspacesByUser: trae todos los espacios de trabajo de un usuario, cada uno con su lista de miembros (nombre y rol)
    - createWorkspaceWithOwner: valida los datos, crea el espacio de trabajo y le asigna al creador una membresia de 'owner'
    - addMemberToWorkspace: valida el rol de quien agrega y crea la membresia de un usuario en el workspace
    - deleteWorkspaceWithMemberships: elimina el espacio de trabajo y, en cascada, sus mensajes, canales y membresias
    - updateWorkspaceData: valida los campos y actualiza nombre/descripcion del workspace
*/

import workspace_repository from '../repositories/workspace.repository.js'
import member_repository from '../repositories/member.repository.js'
import user_repository from '../repositories/user.repository.js'
import channel_repository from '../repositories/channel.repository.js'
import message_channel_repository from '../repositories/messageChannel.repository.js'
import ServerError from '../utils/error.util.js'
import { normalizeText } from '../utils/validation.util.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ALLOWED_MEMBER_ROLES = ['admin', 'user']

/*
Mensaje ambiguo de la solicitud de invitacion: no revela si el email tiene
cuenta, si esta activa o si ya es miembro. Lo usa el controller para responder
siempre lo mismo, igual que hacen verificacion y reseteo de password.
*/
export const MEMBER_INVITATION_MESSAGE = 'Se procesara la solicitud en caso de que exista una cuenta con ese email'

const ROLE_ORDER = {
    owner: 0,
    admin: 1,
    user: 2
}


/*
Normaliza y valida el nombre del workspace.
Devuelve el nombre sin espacios sobrantes o lanza un 400.
*/
function normalizeWorkspaceName(name) {
    return normalizeText(
        name,
        {
            field: 'El nombre del workspace',
            required: true,
            max_length: 30
        }
    )
}


/*
Normaliza y valida la descripcion del workspace.
Una descripcion vacia es valida: el workspace puede no tener descripcion.
*/
function normalizeWorkspaceDescription(description) {
    return normalizeText(
        description,
        {
            field: 'La descripcion del workspace',
            max_length: 200,
            allow_newlines: true
        }
    )
}


/*
Traer todos los espacios de trabajo asociados a un usuario,
con la lista de miembros (nombre y rol) de cada espacio de trabajo
*/
export async function getWorkspacesByUser(user_id) {
    return await member_repository.getAllWorkspacesWithMembersByUserId(user_id)
}


/*
Traer la lista de miembros de un espacio de trabajo,
con el nombre, email y rol de cada membresia.
Se ordenan por jerarquia (owner, admin, user) y luego por nombre.
*/
export async function getMembersByWorkspaceId(workspace_id) {
    const memberships = await member_repository.getAllMembershipsByWorkspaceId(workspace_id)

    return memberships
        .map(
            membership => {
                return {
                    member_id: membership._id,
                    nombre: membership.fk_id_usuario?.nombre,
                    email: membership.fk_id_usuario?.email,
                    rol: membership.rol
                }
            }
        )
        .sort(
            (member_a, member_b) => {
                const role_difference =
                    (ROLE_ORDER[member_a.rol] ?? 99) - (ROLE_ORDER[member_b.rol] ?? 99)

                if (role_difference !== 0) {
                    return role_difference
                }

                return (member_a.nombre || '').localeCompare(member_b.nombre || '', 'es')
            }
        )
}


/*
Crear un espacio de trabajo y asignar al usuario creador
una membresia con el rol de 'owner'
*/
export async function createWorkspaceWithOwner(user_id, name, description) {
    const normalized_name = normalizeWorkspaceName(name)
    const normalized_description = normalizeWorkspaceDescription(description)

    const workspace_created = await workspace_repository.createWorkspace(
        normalized_name,
        normalized_description
    )

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
Agregar un miembro a un espacio de trabajo.

Solo el owner puede agregar miembros. El rol de la membresia a crear
solo puede ser 'admin' o 'user' (nunca 'owner').

Ademas valida que el email sea valido y que no exista ya una membresia.
Si no hay usuario con ese email o esta desactivado devuelve null: el controller
responde con el mensaje ambiguo para no revelar el estado de la cuenta.
*/
export async function addMemberToWorkspace(workspace_id, actor_role, email, member_role) {
    if (actor_role !== 'owner') {
        throw new ServerError(
            'Solo el owner puede agregar miembros a este espacio de trabajo',
            403
        )
    }

    if (typeof email !== 'string' || email.trim().length === 0) {
        throw new ServerError('email es un campo requerido', 400)
    }

    const normalized_email = email.trim()

    if (!EMAIL_REGEX.test(normalized_email)) {
        throw new ServerError('El email no es valido', 400)
    }

    if (member_role === 'owner') {
        throw new ServerError(
            'No se puede asignar el rol owner desde este endpoint',
            403
        )
    }

    if (!ALLOWED_MEMBER_ROLES.includes(member_role)) {
        throw new ServerError('El rol debe ser admin o user', 400)
    }

    const user_found = await user_repository.getByEmail(normalized_email)

    /*
    No diferenciamos entre "no existe" y "desactivado": ambos casos devuelven
    null para que la API responda exactamente lo mismo que en el caso exitoso.
    */
    if (!user_found || !user_found.activo) {
        return null
    }

    const existing_membership = await member_repository.getMembershipByUserAndWorkspace(
        user_found._id,
        workspace_id
    )

    if (existing_membership) {
        throw new ServerError(
            "El usuario ya es miembro de este espacio de trabajo",
            409
        )
    }

    return await member_repository.create(user_found._id, workspace_id, member_role)
}


/*
Eliminar un espacio de trabajo y, en cascada:
    1. los mensajes de sus canales
    2. sus canales
    3. sus membresias
    4. el workspace

El orden importa: primero los hijos, despues el padre. Si algo falla a mitad
de camino no queda un workspace eliminado con datos huerfanos apuntandole.
*/
export async function deleteWorkspaceWithMemberships(workspace_id) {
    const channel_ids = await channel_repository.getAllIdsByWorkspaceId(workspace_id)

    if (channel_ids.length > 0) {
        await message_channel_repository.deleteAllByChannelIds(channel_ids)
    }

    await channel_repository.deleteAllByWorkspaceId(workspace_id)
    await member_repository.deleteAllMembershipsByWorkspaceId(workspace_id)
    await workspace_repository.deleteById(workspace_id)
}


/*
Actualizar el nombre/descripcion de un espacio de trabajo.
El nombre es obligatorio; la descripcion es opcional.
*/
export async function updateWorkspaceData(workspace_id, name, description) {
    const normalized_name = normalizeWorkspaceName(name)

    const update_data = {
        nombre: normalized_name
    }

    /*
    Si el cliente no manda description, no la tocamos. Si la manda
    (aunque sea vacia), la reemplazamos.
    */
    if (description !== undefined) {
        update_data.description = normalizeWorkspaceDescription(description)
    }

    return await workspace_repository.updateById(workspace_id, update_data)
}