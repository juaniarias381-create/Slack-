import mongoose from "mongoose";
import ENVIRONMENT from "./environment.config.js";
import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
let connectionPromise = null;

async function connectMongoDB() {
    if (mongoose.connection.readyState === 1) {
        
        return mongoose.connection;
    }

    if (!connectionPromise) {
        connectionPromise = mongoose.connect(
            `${ENVIRONMENT.MONGO_DB_URI}/${ENVIRONMENT.MONGO_DB_NAME}`,
            {
                serverSelectionTimeoutMS: 10000
            }
        ).catch(error => {
            connectionPromise = null;
            throw error;
        });
    }

    await connectionPromise;

    return mongoose.connection;
}

export default connectMongoDB;