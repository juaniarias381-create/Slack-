/*
Schemas reutilizables de la documentacion OpenAPI

Los envoltorios de respuesta replican el formato real de la API:
    { ok, status, message, data? }
Los modelos replican los documentos de Mongoose tal como los devuelven los endpoints.
*/

const object_id = {
    type: 'string',
    description: 'ObjectId de MongoDB (24 caracteres hexadecimales)',
    example: '674a1b2c3d4e5f6a7b8c9d0e',
}

const fecha_creacion = {
    type: 'string',
    format: 'date-time',
    description: 'Fecha de creacion del documento',
    example: '2026-01-15T10:30:00.000Z',
}

export default {

    //ENVOLTORIOS

    //Respuesta de exito simple (sin data)
    SimpleSuccess: {
        type: 'object',
        properties: {
            ok: { type: 'boolean', example: true },
            status: { type: 'integer', example: 200 },
            message: { type: 'string', example: 'Operacion exitosa' },
        },
    },

    //Respuesta de error estandar (ServerError / middleware de errores)
    ErrorEnvelope: {
        type: 'object',
        properties: {
            ok: { type: 'boolean', example: false },
            status: { type: 'integer', description: 'Codigo de estado HTTP', example: 400 },
            message: { type: 'string', description: 'Descripcion del error', example: 'Mensaje de error' },
        },
        required: ['ok', 'status', 'message'],
    },

    //Respuesta 503 (el middleware de conexion a MongoDB responde solo con message)
    ServiceUnavailableEnvelope: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'No se pudo conectar a la base de datos' },
        },
        required: ['message'],
    },

    //AUTH

    LoginResponse: {
        type: 'object',
        properties: {
            ok: { type: 'boolean', example: true },
            status: { type: 'integer', example: 200 },
            message: { type: 'string', example: 'You have logged in successfully' },
            data: {
                type: 'object',
                properties: {
                    auth_token: {
                        type: 'string',
                        description: 'Token JWT de sesion. Usarlo en el header Authorization como "Bearer <auth_token>"',
                        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NGExYjJjM2Q0ZTVmNmE3YjhjOWQwZSIsIm5hbWUiOiJBbmEiLCJlbWFpbCI6ImFuYUBleGFtcGxlLmNvbSJ9.ejemplo',
                    },
                },
            },
        },
    },

    ResendVerificationResponse: {
        type: 'object',
        properties: {
            ok: { type: 'boolean', example: true },
            status: { type: 'integer', example: 200 },
            message: {
                type: 'string',
                description: 'Mensaje ambiguo: es el mismo sin importar si la cuenta existe, esta activa o ya fue verificada',
                example: 'Se enviara un mail con los pasos para verificar en caso de que esta cuenta sea real',
            },
        },
    },

    ForgotPasswordResponse: {
        type: 'object',
        properties: {
            ok: { type: 'boolean', example: true },
            status: { type: 'integer', example: 200 },
            message: {
                type: 'string',
                description: 'Mensaje ambiguo: es el mismo sin importar si la cuenta existe o esta activa',
                example: 'Se enviara un mail con los pasos para restablecer la contrasena en caso de que esta cuenta sea real',
            },
        },
    },

    //USERS

    User: {
        type: 'object',
        description: 'Documento de usuario tal como lo devuelve la base de datos. ATENCION: incluye el hash de la password',
        properties: {
            _id: { ...object_id, description: 'Id del usuario' },
            nombre: { type: 'string', example: 'Ana' },
            email: { type: 'string', format: 'email', example: 'ana@example.com' },
            password: {
                type: 'string',
                description: 'Hash bcrypt de la contrasena. Expuesto por los endpoints de listado/detalle de usuarios',
                example: '$2b$10$X7QzY1vE9xK2pLmNoPqRsTuVwXyZ0123456789abcdefghijklmnopqrstuvwxyz',
            },
            fecha_creacion,
            activo: { type: 'boolean', example: true },
            email_verificado: { type: 'boolean', example: true },
            __v: { type: 'integer', example: 0 },
        },
    },

    UsersListResponse: {
        type: 'object',
        properties: {
            ok: { type: 'boolean', example: true },
            status: { type: 'integer', example: 200 },
            message: { type: 'string', example: 'Get users list' },
            data: {
                type: 'object',
                properties: {
                    users: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                },
            },
        },
    },

    UserDetailResponse: {
        type: 'object',
        properties: {
            ok: { type: 'boolean', example: true },
            status: { type: 'integer', example: 200 },
            message: { type: 'string', example: 'Get user details successfully' },
            data: {
                type: 'object',
                properties: {
                    user: { $ref: '#/components/schemas/User' },
                },
            },
        },
    },

    //WORKSPACES

    Workspace: {
        type: 'object',
        description: 'Documento de espacio de trabajo',
        properties: {
            _id: { ...object_id, description: 'Id del workspace' },
            nombre: { type: 'string', maxLength: 30, example: 'Equipo Frontend' },
            description: { type: 'string', maxLength: 200, example: 'Workspace del equipo de frontend' },
            fecha_creacion,
            __v: { type: 'integer', example: 0 },
        },
    },

    MemberSummary: {
        type: 'object',
        description: 'Miembro de un workspace (resumen, con nombre y rol)',
        properties: {
            member_id: { ...object_id, description: 'Id de la membresia' },
            nombre: { type: 'string', description: 'Nombre del usuario miembro', example: 'Ana' },
            rol: { type: 'string', enum: ['user', 'admin', 'owner'], example: 'owner' },
        },
    },

    WorkspaceWithMembers: {
        type: 'object',
        description: 'Workspace con su lista completa de miembros (así devuelve GET /api/workspaces)',
        properties: {
            _id: { ...object_id, description: 'Id del workspace' },
            nombre: { type: 'string', example: 'Equipo Frontend' },
            fecha_creacion,
            members: { type: 'array', items: { $ref: '#/components/schemas/MemberSummary' } },
        },
    },

    WorkspacesListResponse: {
        type: 'object',
        properties: {
            ok: { type: 'boolean', example: true },
            status: { type: 'integer', example: 200 },
            message: { type: 'string', example: 'Obtenidos todos los datos' },
            data: {
                type: 'object',
                properties: {
                    workspaces: { type: 'array', items: { $ref: '#/components/schemas/WorkspaceWithMembers' } },
                },
            },
        },
    },

    WorkspaceCreatedResponse: {
        type: 'object',
        properties: {
            ok: { type: 'boolean', example: true },
            status: { type: 'integer', example: 201 },
            message: { type: 'string', example: 'Por ahora todo bien' },
            data: {
                type: 'object',
                properties: {
                    workspace_created: { $ref: '#/components/schemas/Workspace' },
                    owner_membership: {
                        type: 'object',
                        description: 'Membresia del creador con rol owner',
                        properties: {
                            _id: object_id,
                            fk_id_usuario: object_id,
                            fk_id_espacio_trabajo: object_id,
                            rol: { type: 'string', enum: ['user', 'admin', 'owner'], example: 'owner' },
                            fecha_creacion,
                            activo: { type: 'boolean', example: true },
                            __v: { type: 'integer', example: 0 },
                        },
                    },
                },
            },
        },
    },

    WorkspaceDetailResponse: {
        type: 'object',
        properties: {
            ok: { type: 'boolean', example: true },
            status: { type: 'integer', example: 200 },
            message: { type: 'string', example: 'Workspace obtenido correctamente' },
            data: {
                type: 'object',
                properties: {
                    workspace_selected: { $ref: '#/components/schemas/Workspace' },
                },
            },
        },
    },

    WorkspaceMember: {
        type: 'object',
        description: 'Miembro de un workspace con su nombre, email y rol (así devuelve GET /api/workspaces/:workspace_id/members)',
        properties: {
            member_id: { ...object_id, description: 'Id de la membresia' },
            nombre: { type: 'string', example: 'Ana' },
            email: { type: 'string', format: 'email', example: 'ana@example.com' },
            rol: { type: 'string', enum: ['user', 'admin', 'owner'], example: 'admin' },
        },
    },

    MembersListResponse: {
        type: 'object',
        properties: {
            ok: { type: 'boolean', example: true },
            status: { type: 'integer', example: 200 },
            message: { type: 'string', example: 'Miembros obtenidos correctamente' },
            data: {
                type: 'object',
                properties: {
                    members: { type: 'array', items: { $ref: '#/components/schemas/WorkspaceMember' } },
                },
            },
        },
    },

    WorkspaceUpdatedResponse: {
        type: 'object',
        properties: {
            ok: { type: 'boolean', example: true },
            status: { type: 'integer', example: 200 },
            message: { type: 'string', example: 'Workspace actualizado correctamente' },
            data: {
                type: 'object',
                properties: {
                    workspace_updated: { $ref: '#/components/schemas/Workspace' },
                },
            },
        },
    },

    WorkspaceDeletedResponse: {
        type: 'object',
        properties: {
            ok: { type: 'boolean', example: true },
            status: { type: 'integer', example: 200 },
            message: { type: 'string', example: 'Workspace eliminado correctamente' },
            data: {
                type: 'object',
                properties: {
                    workspace_deleted: { $ref: '#/components/schemas/Workspace' },
                },
            },
        },
    },

    //CHANNELS

    Channel: {
        type: 'object',
        description: 'Documento de canal',
        properties: {
            _id: { ...object_id, description: 'Id del canal' },
            nombre: { type: 'string', example: 'general' },
            descripcion: { type: 'string', maxLength: 1000, example: 'Canal para anuncios generales' },
            fk_id_espacio_trabajo: { ...object_id, description: 'Id del workspace al que pertenece el canal' },
            fecha_creacion,
            __v: { type: 'integer', example: 0 },
        },
    },

    ChannelsListResponse: {
        type: 'object',
        properties: {
            ok: { type: 'boolean', example: true },
            status: { type: 'integer', example: 200 },
            message: { type: 'string', example: 'Canales obtenidos correctamente' },
            data: {
                type: 'object',
                properties: {
                    channels: { type: 'array', items: { $ref: '#/components/schemas/Channel' } },
                },
            },
        },
    },

    ChannelCreatedResponse: {
        type: 'object',
        properties: {
            ok: { type: 'boolean', example: true },
            status: { type: 'integer', example: 201 },
            message: { type: 'string', example: 'Canal creado correctamente' },
            data: {
                type: 'object',
                properties: {
                    channel_created: { $ref: '#/components/schemas/Channel' },
                },
            },
        },
    },

    ChannelDetailResponse: {
        type: 'object',
        properties: {
            ok: { type: 'boolean', example: true },
            status: { type: 'integer', example: 200 },
            message: { type: 'string', example: 'Canal obtenido correctamente' },
            data: {
                type: 'object',
                properties: {
                    channel: { $ref: '#/components/schemas/Channel' },
                },
            },
        },
    },

    Message: {
        type: 'object',
        description: 'Mensaje de canal con el emisor poblado (rol de la membresia y nombre del usuario)',
        properties: {
            _id: { ...object_id, description: 'Id del mensaje' },
            contenido: { type: 'string', maxLength: 2000, example: 'Hola equipo, este es el primer mensaje' },
            fk_id_emisor: {
                type: 'object',
                description: 'Membresia del emisor (poblada)',
                properties: {
                    _id: { ...object_id, description: 'Id de la membresia del emisor' },
                    rol: { type: 'string', enum: ['user', 'admin', 'owner'], example: 'user' },
                    fk_id_usuario: {
                        type: 'object',
                        properties: {
                            _id: object_id,
                            nombre: { type: 'string', example: 'Ana' },
                        },
                    },
                },
            },
            fk_id_canal: { ...object_id, description: 'Id del canal' },
            fecha_creacion,
            editado: { type: 'boolean', example: false },
            __v: { type: 'integer', example: 0 },
        },
    },

    MessagesListResponse: {
        type: 'object',
        properties: {
            ok: { type: 'boolean', example: true },
            status: { type: 'integer', example: 200 },
            message: { type: 'string', example: 'Mensajes obtenidos correctamente' },
            data: {
                type: 'object',
                properties: {
                    messages: { type: 'array', items: { $ref: '#/components/schemas/Message' } },
                },
            },
        },
    },

    MessageSentResponse: {
        type: 'object',
        properties: {
            ok: { type: 'boolean', example: true },
            status: { type: 'integer', example: 201 },
            message: { type: 'string', example: 'Mensaje enviado correctamente' },
        },
    },
}
