import { Router } from "express"
import { getUserById, getUsers } from "../controllers/user.controller.js"

const user_router = Router()

user_router.get('/', getUsers)
user_router.get('/:user_id', getUserById)

export default user_router