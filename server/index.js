import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve('./.env') }); 


import express from 'express'
import signinRoute from './routes/signinRoute.js'
const app = express()


app.use(express.json())

app.use("/user",signinRoute)

app.listen(3000)