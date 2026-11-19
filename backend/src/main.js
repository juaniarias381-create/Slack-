import connectMongoDB from "./config/mongo.config.js";

//connectMongoDB()


import express from 'express'
import errorHandlerMiddleware from "./middlewares/error.middleware.js";
import loggerMiddleware from "./middlewares/logger.middleware.js";
import auth_router from "./routes/auth.router.js";
import user_router from "./routes/user.router.js";
import workspace_router from "./routes/workspace.router.js";
import cors from 'cors'
import ENVIRONMENT from "./config/environment.config.js";
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './docs/swagger.config.js'


const PORT = ENVIRONMENT.PORT
const app = express()

//Detras de un proxy (Vercel) req.ip devuelve la IP del proxy;
//confiando en el header X-Forwarded-For obtenemos la IP real del cliente
app.set('trust proxy', true)

app.use(cors())
app.use(express.json())

//Logger de consultas: primero en la cadena, escribe el log al finalizar la respuesta
app.use(loggerMiddleware)

//Documentacion OpenAPI (Swagger UI): solo disponible fuera de produccion.
//Se monta ANTES del middleware de conexion a MongoDB para que la documentacion
//siga accesible aunque la base de datos este caida
if (process.env.NODE_ENV !== 'production') {
    app.use(
        '/api/docs',
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, {
            customSiteTitle: 'API Slack Clone - Documentacion',
        })
    )
}

app.use(async (req, res, next) => {
    try {
        await connectMongoDB();
        next();
    } catch (error) {
        console.error("Error conectando MongoDB:", error);

        res.status(503).json({
            message: "No se pudo conectar a la base de datos"
        });
    }
});


app.use('/api/auth', auth_router)
app.use('/api/users', user_router)
app.use('/api/workspaces', workspace_router)

app.use(
    errorHandlerMiddleware
)


app.listen(
    PORT,
    () => {
        console.log(
            `El servidor se esta escuchando correctamente en http://localhost:${PORT}`
        )
    }
)

