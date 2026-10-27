import Member from "../models/member.model.js"

class MemberRepository {
    async create(userId, workspaceId, role, invitacion_aceptada = true) {
    return await Member.create({
        fk_id_usuario: userId,
        fk_id_espacio_trabajo: workspaceId,
        rol: role,
        invitacion_aceptada: invitacion_aceptada
    })
}

    async deleteById(memberId) {
        const result = await Member.findByIdAndDelete(memberId)
        console.log(result)
    }

    async updateRoleById(memberId, role) {
        const result = await Member.findByIdAndUpdate(memberId, { rol: role })
        console.log(result)
    }

    async getById(member_id) {
    return await Member.findById(member_id)
}

async acceptInvitationById(member_id) {
    await Member.findByIdAndUpdate(member_id, { invitacion_aceptada: true })
}


    /* 
    formato: 
        {
            member_id,
            member_role,
            workspace_id,
            workspace_name
            workspace_fecha_creacion
        }

    */
    async getAllWorkspaceByUserId (user_id){
        //Traer todas las membresias de un usuario
        const result = await Member
        .find({fk_id_usuario: user_id})
        .select('rol fecha_creacion fk_id_espacio_trabajo')
        .populate(
            'fk_id_espacio_trabajo',
            'nombre fecha_creacion'
        )

        return result.map(
            membership => {
                return {
                    member_id: membership._id,
                    member_rol: membership.rol,
                    workspace_id: membership.fk_id_espacio_trabajo._id,
                    workspace_nombre: membership.fk_id_espacio_trabajo.nombre,
                    workspace_fecha_creacion: membership.fk_id_espacio_trabajo.fecha_creacion
                }
            }
        )
    }

    //Traer todos miembros de un espacio de trabajo
    async getAllMembershipsByWorkspaceId(workspace_id) {
    const result = await Member
        .find({ fk_id_espacio_trabajo: workspace_id })
        .populate('fk_id_usuario', 'nombre email')

    return result.map(
        membership => {
            return {
                member_id: membership._id,
                member_rol: membership.rol,
                invitacion_aceptada: membership.invitacion_aceptada,
                user_id: membership.fk_id_usuario._id,
                user_nombre: membership.fk_id_usuario.nombre,
                user_email: membership.fk_id_usuario.email
            }
        }
    )
}

    async getMembershipByUserAndWorkspace (user_id, workspace_id){
        return await Member.findOne({fk_id_usuario:user_id, fk_id_espacio_trabajo: workspace_id })
    }


    //Borrar las membresias de un espacio de trabajo
    async deleteAllMembershipsByWorkspaceId(workspace_id){
        await Member.deleteMany({fk_id_espacio_trabajo: workspace_id})
    }
}
const member_repository = new MemberRepository()
export default member_repository