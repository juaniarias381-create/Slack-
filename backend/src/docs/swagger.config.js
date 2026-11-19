/*
Configuracion base de la documentacion OpenAPI (Swagger)

La especificacion se genera a partir de:
    - Este archivo (info general, servers, tags, esquemas de seguridad)
    - components.schemas.js (schemas reutilizables de entrada/salida)
    - components.responses.js (respuestas de error reutilizables)
    - Anotaciones @openapi en los archivos ./src/routes/*.router.js

La UI se sirve en GET /api/docs (solo fuera de produccion, ver src/main.js)
*/

import swaggerJsdoc from 'swagger-jsdoc'
import schemas from './components.schemas.js'
import responses from './components.responses.js'

const swaggerDefinition = {
    openapi: '3.0.3',
    info: {
        title: 'API Slack Clone',
        version: '1.0.0',
        description: `
Documentacion de la API REST del clon de Slack.

Grupos de endpoints:
    - **Auth**: registro, login, verificacion de email y reseteo de contrasena (publicos)
    - **Users**: listado y detalle de usuarios (requieren autenticacion)
    - **Workspaces**: gestion de espacios de trabajo (requieren autenticacion y membresia)
    - **Channels**: gestion de canales y mensajes dentro de un workspace (requieren autenticacion y membresia)

## Formato de respuesta
Todos los endpoints responden con el mismo envoltorio JSON:
\`\`\`json
{
    "ok": true,
    "status": 200,
    "message": "...",
    "data": { }
}
\`\`\`
Los errores centralizados (ServerError) respetan el mismo formato con \`ok: false\`.

## Autenticacion
Los endpoints protegidos esperan el header \`Authorization: Bearer <jwt>\`.
Usa el boton **Authorize** de esta UI para guardar tu token y probar los endpoints protegidos.
        `,
    },

    //Servers para probar desde la UI
    servers: [
        {
            url: 'http://localhost:{port}',
            description: 'Desarrollo local',
            variables: {
                port: {
                    default: '3000',
                    description: 'Puerto del backend (ENVIRONMENT.PORT)'
                }
            }
        },
        {
            url: 'https://slack-clone-backend.vercel.app',
            description: 'Backend desplegado en Vercel',
        },
    ],

    tags: [
        {
            name: 'Auth',
            description: 'Registro, login, verificacion de email y reseteo de contrasena (endpoints publicos)',
        },
        {
            name: 'Users',
            description: 'Listado y detalle de usuarios (requieren autenticacion)',
        },
        {
            name: 'Workspaces',
            description: 'Espacios de trabajo: listado, creacion, detalle, miembros, actualizacion y eliminacion',
        },
        {
            name: 'Channels',
            description: 'Canales y mensajes dentro de un workspace',
        },
    ],

    //Esquema de seguridad: JWT via header Authorization: Bearer <token>
    security: [
        {
            bearerAuth: [],
        },
    ],
}

const options = {
    definition: swaggerDefinition,
    apis: [
        //Solo los routers activos (los que importa src/main.js)
        './src/routes/*.router.js',
    ],
}

//Components reutilizables: schemas, respuestas y parametros
const components = {
    schemas,
    responses,
    parameters: {
        WorkspaceId: {
            in: 'path',
            name: 'workspace_id',
            required: true,
            description: 'Id del workspace (ObjectId de MongoDB)',
            schema: {
                type: 'string',
                pattern: '^[0-9a-fA-F]{24}$',
            },
            example: '674a1b2c3d4e5f6a7b8c9d0e',
        },
        ChannelId: {
            in: 'path',
            name: 'channel_id',
            required: true,
            description: 'Id del canal (ObjectId de MongoDB). Debe pertenecer al workspace de la URL',
            schema: {
                type: 'string',
                pattern: '^[0-9a-fA-F]{24}$',
            },
            example: '674a1b2c3d4e5f6a7b8c9d0c',
        },
    },
    securitySchemes: {
        bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Token JWT devuelto por el login (data.auth_token)',
        },
    },
}

const swaggerSpec = swaggerJsdoc({
    ...options,
    //Los components van DENTRO de la definition para que swagger-jsdoc los preserve
    definition: {
        ...swaggerDefinition,
        components,
    },
})

export default swaggerSpec
