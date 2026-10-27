import connectMongoDB from "./config/mongo.config.js";
import { testMysqlConnection } from "./config/mysql.config.js";
import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

connectMongoDB()
/* testMysqlConnection() */

import express from 'express'
import errorHandlerMiddleware from "./middlewares/error.middleware.js";
import auth_router from "./routes/auth.router.js";
import user_router from "./routes/user.router.js";
import authMiddleware from "./middlewares/auth.middleware.js";
import workspace_repository from "./repositories/workspace.repository.js";
import member_repository from "./repositories/member.repository.js";
import workspace_router from "./routes/workspace.router.js";
import mailer_transporter from "./config/mailer.config.js";
import ENVIRONMENT from "./config/environment.config.js";
import user_repository from "./repositories/user.repository.js";
import cors from 'cors'


const PORT = ENVIRONMENT.PORT

const app = express()

app.use(cors())

app.use(express.json())



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


