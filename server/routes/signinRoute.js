import express from 'express'
import { loginHandler } from '../controllers/loginController.js'
const route = express.Router()

route.post("/signin",loginHandler)

export default route